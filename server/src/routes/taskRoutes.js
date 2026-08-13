import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorize.js";
import { createTaskController, getTasksController, getTaskByIdController, updateTaskController, updateTaskStatusController, deleteTaskController } from "../controllers/taskController.js";    

const router = express.Router();

router.post("/", isAuthenticated, authorize("manager"), createTaskController);
router.get("/", isAuthenticated, getTasksController);
router.get("/:taskId",isAuthenticated,getTaskByIdController);
router.patch("/:taskId", isAuthenticated, authorize("manager"), updateTaskController);
router.patch("/:taskId/status", isAuthenticated, updateTaskStatusController);
router.delete("/:taskId", isAuthenticated, authorize("manager"), deleteTaskController);

export default router;