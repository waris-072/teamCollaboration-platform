import express from "express";

import { isAuthenticated } from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorize.js";
import { createProjectController, getProjectsController, getProjectByIdController, updateProjectController, updateProjectStatusController, deleteProjectController, addProjectMembersController, removeProjectMembersController } from "../controllers/projectController.js";

const router = express.Router();

router.post("/", isAuthenticated, authorize("admin"), createProjectController);

router.get("/", isAuthenticated, authorize("admin","manager","member"), getProjectsController);
router.get("/:projectId", isAuthenticated, authorize("admin","manager","member"), getProjectByIdController );

router.patch("/:projectId", isAuthenticated, authorize("admin","manager"), updateProjectController );
router.patch("/:projectId/status", isAuthenticated, authorize("admin","manager"), updateProjectStatusController);

router.delete("/:projectId", isAuthenticated, authorize("admin"), deleteProjectController);

router.post("/:projectId/members",isAuthenticated,authorize("admin","manager"),addProjectMembersController);
router.patch("/:projectId/members/remove", isAuthenticated, authorize("admin","manager"), removeProjectMembersController);


export default router;