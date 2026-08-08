import { createTaskCommentService, getTaskCommentsService, deleteTaskCommentService } from "../services/taskCommentService.js";

// Create Task Comment Controller
export async function createTaskCommentController(req, res) {
    try {
        const comment = await createTaskCommentService(
            req.params.taskId,
            req.body.message,
            req.user
        );
        res.status(201).json({
            success: true,
            message: "Comment added successfully.",
            comment,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

// Get Task Comments Controller
export async function getTaskCommentsController(req, res) {
    try {
        const comments = await getTaskCommentsService(
            req.params.taskId,
            req.user
        );
        res.status(200).json({
            success: true,
            count: comments.length,
            comments,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

// Delete Task Comment Controller
export async function deleteTaskCommentController(req, res) {
    try {
        await deleteTaskCommentService(
            req.params.commentId,
            req.user
        );
        res.status(200).json({
            success: true,
            message: "Comment deleted successfully.",
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}