import Task from "../models/Task.js";
import Project from "../models/Project.js";
import TaskComment from "../models/TaskComment.js";

// Private function to validate task access based on user role and task ownership

async function validateTaskAccess(taskId, currentUser) {
    const task = await Task.findById(taskId);

    if (!task) {
        throw new Error("Task not found.");
    }

    if (task.isArchived) {
        throw new Error("Task has been archived.");
    }

    // Admin can access any task
    if (currentUser.role === "admin") {
        return task;
    }

    const project = await Project.findById(task.project);
    if (!project) {
        throw new Error("Project not found.");
    }

    // Manager can access tasks in their own projects
    if (currentUser.role === "manager") {
        if (
            project.manager.toString() ===
            currentUser._id.toString()
        ) {
            return task;
        }
    }

    // Member can access only tasks assigned to them
    if (currentUser.role === "member") {
        if (
            task.assignedTo.toString() ===
            currentUser._id.toString()
        ) {
            return task;
        }
    }

    throw new Error("You are not authorized to access this task.");
}



// Create Task Comment Service
export async function createTaskCommentService(taskId, message, currentUser) {
    await validateTaskAccess(taskId, currentUser);
    const comment = await TaskComment.create({
        task: taskId,
        author: currentUser._id,
        message,
    });
    return await TaskComment.findById(comment._id)
        .populate("author", "name email role");
}

// Get Task Comments Service
export async function getTaskCommentsService(taskId, currentUser) {
    await validateTaskAccess(taskId, currentUser);
    const comments = await TaskComment.find({task: taskId,})
        .populate("author", "name email role")
        .sort({ createdAt: 1 });

    return comments;
}

// Delete Task Comment Service
export async function deleteTaskCommentService(commentId,currentUser) {
    const comment = await TaskComment.findById(commentId);

    if (!comment) {
        throw new Error("Comment not found.");
    }

    if (currentUser.role === "admin") {
        await TaskComment.findByIdAndDelete(commentId);
        return;
    }

    if (
        comment.author.toString() !==
        currentUser._id.toString()
    ) {
        throw new Error(
            "You can only delete your own comments."
        );
    }

    await TaskComment.findByIdAndDelete(commentId);
}