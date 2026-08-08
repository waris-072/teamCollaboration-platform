import Project from "../models/Project.js";
import User from "../models/User.js";
import Task from "../models/Task.js";
import TaskComment from "../models/TaskComment.js";
import { createNotificationService, } from "./notificationService.js";

// ======================================
// Private Helper Functions
// ======================================
async function validateManager(managerId) {
    const manager = await User.findById(managerId);

    if (!manager) {
        throw new Error("Project manager not found.");
    }

    if (manager.role !== "manager") {
        throw new Error("Selected user is not a manager.");
    }

    if (!manager.isActive) {
        throw new Error("Manager account is inactive.");
    }

    return manager;
}

async function validateMembers(memberIds = []) {
    const uniqueMembers = [...new Set(memberIds)];

    if (!uniqueMembers.length) {
        return [];
    }

    const memberUsers = await User.find({ _id: { $in: uniqueMembers }, });

    if (memberUsers.length !== uniqueMembers.length) {
        throw new Error("One or more members do not exist.");
    }

    for (const member of memberUsers) {
        if (member.role !== "member") {
            throw new Error(`${member.name} is not a team member.`);
        }

        if (!member.isActive) {
            throw new Error(`${member.name} is inactive.`);
        }
    }

    return uniqueMembers;
}



//Create Project
export async function createProjectService(data, adminId) {
    const {
        title,
        description,
        startDate,
        endDate,
        priority,
        status,
        manager,
        members = [],
    } = data;

    await validateManager(manager);
    const uniqueMembers = await validateMembers(members);

    const project = await Project.create({
        title,
        description,
        startDate,
        endDate,
        priority,
        status,
        manager,
        members: uniqueMembers,
        createdBy: adminId,
    });

    return await Project.findById(project._id)
        .populate("manager", "name email role")
        .populate("members", "name email role")
        .populate("createdBy", "name email");
}

// Get All Projects
export async function getProjectsService(user) {
    let filter = {};

    if (user.role === "manager") {
        filter.manager = user._id;
    }

    if (user.role === "member") {
        filter.members = user._id;
    }

    const projects = await Project.find(filter)
        .populate("manager", "name email")
        .populate("members", "name email")
        .sort({ createdAt: -1 });

    return projects;
}

// Get Project By ID
export async function getProjectByIdService(projectId, user) {
    if (!projectId) {
        throw new Error("Project id is required.");
    }

    const project = await Project.findById(projectId)
        .populate("manager", "name email role")
        .populate("members", "name email role")
        .populate("createdBy", "name email role");

    if (!project) {
        throw new Error("Project not found.");
    }

    if (user.role === "admin") {
        return project;
    }

    if (
        user.role === "manager" &&
        project.manager._id.toString() === user._id.toString()
    ) {
        return project;
    }

    if (user.role === "member") {
        const assigned = project.members.some((member) =>
            member._id.toString() === user._id.toString()
        );

        if (assigned) {
            return project;
        }
    }

    throw new Error("You are not authorized to access this project.");
}

// Update Project Service
export async function updateProjectStatusService(projectId,status,user) {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new Error("Project not found.");
    }

    const allowedStatus = ["planning","active","completed","cancelled",];

    if (!allowedStatus.includes(status)) {
        throw new Error("Invalid project status.");
    }

    const previousStatus = project.status;

    if (previousStatus === status) {
        return project;
    }

    if (user.role === "admin") {
        project.status = status;
        await project.save();
       
        try {
            await createNotificationService({
                recipient: project.manager,
                sender: user._id,
                title: "Project Status Updated",
                message: `The project "${project.title}" changed from "${previousStatus}" to "${status}".`,
                type: "project_updated",
            });
        } catch (error) {
            console.error(
                "Project status notification to manager failed:",
                error.message
            );
        }

        for (const memberId of project.members) {
            try {
                await createNotificationService({
                    recipient: memberId,
                    sender: user._id,
                    title: "Project Status Updated",
                    message: `The project "${project.title}" changed from "${previousStatus}" to "${status}".`,
                    type: "project_updated",
                });
            } catch (error) {
                console.error(
                    "Project status notification to member failed:",
                    error.message
                );
            }
        }
        return project;
    }

    if (user.role === "manager") {
        if (
            project.manager.toString() !==
            user._id.toString()
        ) {
            throw new Error(
                "You can only update the status of your own projects."
            );
        }

        project.status = status;
        await project.save();

        for (const memberId of project.members) {
            try {
                await createNotificationService({
                    recipient: memberId,
                    sender: user._id,
                    title: "Project Status Updated",
                    message: `The project "${project.title}" changed from "${previousStatus}" to "${status}".`,
                    type: "project_updated",
                });
            } catch (error) {
                console.error(
                    "Project status notification failed:",
                    error.message
                );
            }
        }
        return project;
    }

    throw new Error(
        "Team members cannot update project status."
    );
}

// Delete Project Service
export async function deleteProjectService(projectId,user) {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new Error("Project not found.");
    }

    if (user.role !== "admin") {
        throw new Error("Only admins can delete projects.");
    }

    const tasks = await Task.find({project: project._id,}).select("_id");
    const taskIds = tasks.map((task) => task._id);

    if (taskIds.length > 0) {
        await TaskComment.deleteMany({
            task: {
                $in: taskIds,
            },
        });
    }

    await Task.deleteMany({
        project: project._id,
    });

    await project.deleteOne();
    return;
}

// Add Project Members Service
export async function addProjectMembersService(projectId,memberIds,user) {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found.");
  }

  if (
    user.role === "manager" &&
    project.manager.toString() !== user._id.toString()
  ) {
    throw new Error("You can only manage your own projects.");
  }

  const validMembers = await validateMembers(memberIds);

  const updatedMembers = [
    ...new Set([
      ...project.members.map(id => id.toString()),
      ...validMembers.map(id => id.toString()),
    ]),
  ];

  project.members = updatedMembers;

  await project.save();

  return await Project.findById(project._id)
    .populate("manager", "name email role")
    .populate("members", "name email role")
    .populate("createdBy", "name email role");
}

// Remove Project Members Service
export async function removeProjectMembersService(projectId,memberIds,user) {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new Error("Project not found.");
    }

    if (user.role !== "admin" && user.role !== "manager" ) {
        throw new Error( "You are not authorized to manage project members." );
    }

    if (
        user.role === "manager" &&
        project.manager.toString() !==
            user._id.toString()
    ) {
        throw new Error("You can only manage members of your own projects.");
    }

    if (!Array.isArray(memberIds) || !memberIds.length) {
        throw new Error("Member IDs are required.");
    }

    const membersToRemove = new Set(memberIds.map((id) => id.toString()));

    const projectMemberIds = new Set(
        project.members.map((id) =>
            id.toString()
        )
    );

    for (const memberId of membersToRemove) {
        if (!projectMemberIds.has(memberId)) {
            throw new Error(
                "One or more users are not members of this project."
            );
        }
    }

    project.members = project.members.filter(
        (memberId) => !membersToRemove.has(memberId.toString())
    );

    await project.save();

    return await Project.findById(project._id)
        .populate( "manager", "name email role" )
        .populate("members","name email role")
        .populate("createdBy","name email role");
}