import express from "express";

import { isAuthenticated } from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorize.js";
import { createProjectController, getProjectsController, getProjectByIdController, updateProjectController, updateProjectStatusController, deleteProjectController, getAvailableMembersController, updateProjectMembersController, getMyTeamController } from "../controllers/projectController.js";

const router = express.Router();

router.post("/", isAuthenticated, authorize("admin"), createProjectController);

router.get("/", isAuthenticated, authorize("admin","manager","member"), getProjectsController);
router.get( "/my-team", isAuthenticated, authorize("manager"), getMyTeamController );

router.get("/:projectId", isAuthenticated, authorize("admin","manager","member"), getProjectByIdController );

router.patch("/:projectId", isAuthenticated, authorize("admin"), updateProjectController );
router.patch("/:projectId/status", isAuthenticated, authorize("admin","manager"), updateProjectStatusController);

router.delete("/:projectId", isAuthenticated, authorize("admin"), deleteProjectController);

router.get(
    "/:projectId/members/available",
    isAuthenticated,
    authorize("manager"),
    getAvailableMembersController
);

router.patch(
    "/:projectId/members",
    isAuthenticated,
    authorize("manager"),
    updateProjectMembersController
);


export default router;


