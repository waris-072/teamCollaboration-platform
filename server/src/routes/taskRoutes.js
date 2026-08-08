import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorize.js";
import { createTaskController, getTasksController, getTaskByIdController, updateTaskController, updateTaskStatusController, archiveTaskController } from "../controllers/taskController.js";    

const router = express.Router();

router.post("/", isAuthenticated, authorize("admin", "manager"), createTaskController);
router.get("/", isAuthenticated, getTasksController);
router.get("/:taskId",isAuthenticated,getTaskByIdController);
router.patch("/:taskId", isAuthenticated, authorize("admin", "manager"), updateTaskController);
router.patch("/:taskId/status", isAuthenticated, updateTaskStatusController);
router.patch("/:taskId/archive", isAuthenticated, authorize("admin", "manager"),archiveTaskController);

export default router;