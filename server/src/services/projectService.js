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

async function validateMemberAvailability(memberIds, excludeProjectId) {
    const uniqueMembers = [...new Set(
        memberIds.map((id) => id.toString())
    )];

    if (!uniqueMembers.length) {
        return;
    }

    const filter = {
        members: { $in: uniqueMembers },
    };

    if (excludeProjectId) {
        filter._id = { $ne: excludeProjectId };
    }

    const conflictingProject = await Project.findOne(filter)
        .populate("members", "name");

    if (!conflictingProject) {
        return;
    }

    const conflictingMember = conflictingProject.members.find((member) =>
        uniqueMembers.includes(member._id.toString())
    );

    throw new Error(
        `${conflictingMember?.name || "A selected member"} is already assigned to another project.`
    );
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
    } = data;

    await validateManager(manager);

    const project = await Project.create({
        title,
        description,
        startDate,
        endDate,
        priority,
        status,
        manager,
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
export async function updateProjectService(projectId, data, user) {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new Error("Project not found.");
    }

    if (user.role !== "admin") {
        throw new Error("Only admins can edit projects.");
    }

    if (data.manager !== undefined) {
        await validateManager(data.manager);
        project.manager = data.manager;
    }

    if (data.title !== undefined) {
        project.title = data.title;
    }

    if (data.description !== undefined) {
        project.description = data.description;
    }

    if (data.priority !== undefined) {
        project.priority = data.priority;
    }

    if (data.startDate !== undefined) {
        project.startDate = data.startDate;
    }

    if (data.endDate !== undefined) {
        project.endDate = data.endDate;
    }

    await project.save();

    return await Project.findById(project._id)
        .populate("manager", "name email role")
        .populate("members", "name email role")
        .populate("createdBy", "name email role");
}

// Update Project Status Service
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

//Add/Remove Members
export async function updateProjectMembersService(projectId, memberIds, user) {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new Error("Project not found.");
    }

    if (user.role !== "manager") {
        throw new Error("Only project managers can manage project members.");
    }

    if (
        project.manager.toString() !==
        user._id.toString()
    ) {
        throw new Error("You can only manage members of your own projects.");
    }

    if (!Array.isArray(memberIds)) {
        throw new Error("Members must be provided as an array.");
    }

    const uniqueMemberIds = [...new Set(
        memberIds.map((id) => id.toString())
    ),];

    const validMembers = await validateMembers(uniqueMemberIds);
    await validateMemberAvailability(validMembers, project._id);
    project.members = validMembers;

    await project.save();

    return await Project.findById(project._id)
        .populate("manager", "name email role")
        .populate("members", "name email role")
        .populate("createdBy", "name email role");
}

// Get members available for assignment to a project
export async function getAvailableMembersService(projectId, user) {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new Error("Project not found.");
    }

    if (user.role !== "manager" || project.manager.toString() !== user._id.toString()) {
        throw new Error("Only the project manager can manage project members.");
    }

    const members = await User.find({role: "member", isActive: true,})
        .select("name email role").sort({ name: 1 });

    const projects = await Project.find({
        members: { $exists: true, $ne: [] },
    }).select("_id members");

    const currentProjectMemberIds = new Set(
        project.members.map((id) => id.toString())
    );

    const assignedToOtherProjectIds = new Set();

    for (const otherProject of projects) {
        if (otherProject._id.toString() === projectId.toString()){
            continue;
        }

        for (const memberId of otherProject.members) {
            assignedToOtherProjectIds.add(memberId.toString());
        }
    }

    return members.filter((member) => {
        const memberId = member._id.toString();

        if (currentProjectMemberIds.has(memberId)) {
            return true;
        }

        return !assignedToOtherProjectIds.has(memberId);
    });
}