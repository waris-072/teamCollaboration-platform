import Project from "../models/Project.js";
import User from "../models/User.js";

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
export async function updateProjectService(projectId, data, user) {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new Error("Project not found.");
    }

    if (
        user.role === "manager" &&
        project.manager.toString() !== user._id.toString()
    ) {
        throw new Error("You can only update your own projects.");
    }

    if (user.role === "member") {
        throw new Error("You are not allowed to update projects.");
    }

    if (data.manager) {
        await validateManager(data.manager);
        project.manager = data.manager;
    }

    if (data.members) {
        project.members = await validateMembers(data.members);
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

    if (data.status !== undefined) {
        project.status = data.status;
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

// Update Project Status
export async function updateProjectStatusService(projectId, status, user) {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new Error("Project not found.");
    }

    if (
        user.role === "manager" &&
        project.manager.toString() !== user._id.toString()
    ) {
        throw new Error("You can only update your own projects.");
    }

    const allowedStatus = ["planning", "active", "completed", "cancelled",];
    if (!allowedStatus.includes(status)) {
        throw new Error("Invalid project status.");
    }

    project.status = status;
    await project.save();
    return project;
}

export async function deleteProjectService(projectId) {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found.");
  }

  await project.deleteOne();
  return;
}

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