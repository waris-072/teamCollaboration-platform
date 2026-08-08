import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

// Validate Project
async function validateProject(projectId, user) {
    const project = await Project.findById(projectId);

    if (!project) {
        throw new Error("Project not found.");
    }

    if (
        user.role === "manager" &&
        project.manager.toString() !== user._id.toString()
    ) {
        throw new Error(
            "You are not authorized to create tasks in this project."
        );
    }

    return project;
}

// Validate Assignee
async function validateAssignee(userId, project) {
    const member = await User.findById(userId);

    if (!member) {
        throw new Error("Assigned user not found.");
    }

    if (member.role !== "member") {
        throw new Error("Tasks can only be assigned to members.");
    }

    if (!member.isActive) {
        throw new Error("Assigned member is inactive.");
    }

    const belongsToProject = project.members.some((id) => 
        id.toString() === userId.toString()
    );

    if (!belongsToProject) {
        throw new Error("Assigned member does not belong to this project.");
    }

    return member;
}

// Validate Due Date
function validateDueDate(dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(dueDate);
    if (selectedDate < today) {
        throw new Error("Due date cannot be in the past.");
    }
}



//Create Task Service
export async function createTaskService(data, currentUser) {

    const {
        title,
        description,
        project,
        assignedTo,
        priority,
        dueDate,
    } = data;

    if (currentUser.role === "member") {
        throw new Error("You are not authorized to create tasks.");
    }

    const projectDoc = await validateProject(project, currentUser);
    await validateAssignee(assignedTo, projectDoc);
    validateDueDate(dueDate);

    const task = await Task.create({
        title,
        description,
        project,
        assignedTo,
        priority,
        dueDate,
        createdBy: currentUser._id,
    });

    return await Task.findById(task._id)
        .populate("project", "title status")
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email role");
}

// Get All Tasks Service
export async function getTasksService(currentUser) {
    let filter = { 
        isArchived: false 
    };

    if (currentUser.role === "manager") {
        const projects = await Project.find({
            manager: currentUser._id,
        }).select("_id");

        const projectIds = projects.map(
            (project) => project._id
        );

        filter.project = { $in: projectIds };
    }

    if (currentUser.role === "member") {
        filter.assignedTo = currentUser._id;
    }

    const tasks = await Task.find(filter)
        .populate("project", "title status")
        .populate("assignedTo", "name email role")
        .populate("createdBy", "name email role")
        .sort({ createdAt: -1 });

    return tasks;
}

// Get Task By ID Service
export async function getTaskByIdService(taskId, currentUser) {
    if (!taskId) {
        throw new Error("Task id is required.");
    }

    const task = await Task.findById(taskId)
        .populate("project", "title status manager members")
        .populate("assignedTo", "name email role")
        .populate("createdBy", "name email role");

    if (!task) {
        throw new Error("Task not found.");
    }

    if (task.isArchived) {
        throw new Error("Task has been archived.");
    }

    if (currentUser.role === "admin") {
        return task;
    }

    if (currentUser.role === "manager") {
        if (
            task.project.manager.toString() ===
            currentUser._id.toString()
        ) {
            return task;
        }
    }

    if (currentUser.role === "member") {
        if (
            task.assignedTo._id.toString() ===
            currentUser._id.toString()
        ) {
            return task;
        }
    }

    throw new Error("You are not authorized to access this task.");
}

//Update Task Service
export async function updateTaskService(taskId, data, currentUser) {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new Error("Task not found.");
    }

    if (task.isArchived) {
        throw new Error("Task has been archived.");
    }

    if (currentUser.role === "member") {
        throw new Error("You are not authorized to update tasks.");
    }

    const project = await Project.findById(task.project);
    if (!project) {
        throw new Error("Project not found.");
    }

    if (
        currentUser.role === "manager" &&
        project.manager.toString() !==
            currentUser._id.toString()
    ) {
        throw new Error("You can only update tasks in your own projects.");
    }

    if (data.title !== undefined) {
        task.title = data.title;
    }

    if (data.description !== undefined) {
        task.description = data.description;
    }

    if (data.assignedTo !== undefined) {
        await validateAssignee(data.assignedTo, project);
        task.assignedTo = data.assignedTo;
    }

    if (data.priority !== undefined) {
        task.priority = data.priority;
    }

    if (data.dueDate !== undefined) {
        validateDueDate(data.dueDate);
        task.dueDate = data.dueDate;
    }

    await task.save();
    return await Task.findById(task._id)
        .populate("project", "title status")
        .populate("assignedTo", "name email role")
        .populate("createdBy", "name email role");
}

// Update Task Status Service
export async function updateTaskStatusService(taskId, status, currentUser) {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new Error("Task not found.");
    }

    if (task.isArchived) {
        throw new Error("Task has been archived.");
    }

    const allowedStatus = ["todo","in-progress","review","completed",];
    if (!allowedStatus.includes(status)) {
        throw new Error("Invalid task status.");
    }

    if (currentUser.role === "admin") {
        task.status = status;

        await task.save();

        return await Task.findById(task._id)
            .populate("project", "title status")
            .populate("assignedTo", "name email role")
            .populate("createdBy", "name email role");
    }

    if (currentUser.role === "manager") {
        const project = await Project.findById(task.project);

        if (!project) {
            throw new Error("Project not found.");
        }

        if (
            project.manager.toString() !==
            currentUser._id.toString()
        ) {
            throw new Error("You can only update tasks in your own projects.");
        }

        task.status = status;
        await task.save();
        return await Task.findById(task._id)
            .populate("project", "title status")
            .populate("assignedTo", "name email role")
            .populate("createdBy", "name email role");
    }

    if (currentUser.role === "member") {
        if (
            task.assignedTo.toString() !==
            currentUser._id.toString()
        ) {
            throw new Error(
                "You can only update the status of your own tasks."
            );
        }

        task.status = status;
        await task.save();
        return await Task.findById(task._id)
            .populate("project", "title status")
            .populate("assignedTo", "name email role")
            .populate("createdBy", "name email role");
    }

    throw new Error("You are not authorized to update task status.");
}

// Archive/Soft-Delete Task Service
export async function archiveTaskService(taskId, currentUser) {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new Error("Task not found.");
    }

    if (task.isArchived) {
        throw new Error("Task is already archived.");
    }

    if (currentUser.role === "admin") {
        task.isArchived = true;

        await task.save();
        return await Task.findById(task._id)
            .populate("project", "title status")
            .populate("assignedTo", "name email role")
            .populate("createdBy", "name email role");
    }

    if (currentUser.role === "manager") {
        const project = await Project.findById(task.project);

        if (!project) {
            throw new Error("Project not found.");
        }

        if (
            project.manager.toString() !==
            currentUser._id.toString()
        ) {
            throw new Error("You can only archive tasks in your own projects.");
        }

        task.isArchived = true;
        await task.save();
        return await Task.findById(task._id)
            .populate("project", "title status")
            .populate("assignedTo", "name email role")
            .populate("createdBy", "name email role");
    }

    throw new Error("You are not authorized to archive tasks.");
}