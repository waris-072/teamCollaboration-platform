import express from "express";

import { createTaskCommentController, getTaskCommentsController, deleteTaskCommentController} from "../controllers/taskCommentController.js";

import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/tasks/:taskId/comments", isAuthenticated, createTaskCommentController);
router.get("/tasks/:taskId/comments", isAuthenticated, getTaskCommentsController);
router.delete("/comments/:commentId", isAuthenticated, deleteTaskCommentController);

export default router;