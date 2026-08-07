import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorize.js";

import { createUserController, getUsersController, getUserByIdController, updateProfileController, updatePasswordController, updateRoleController, updateStatusController } from "../controllers/userController.js";

const router = express.Router();

router.post("/", isAuthenticated, authorize("admin"), createUserController);
router.get("/", isAuthenticated, authorize("admin"), getUsersController);
router.get("/:userId", isAuthenticated, authorize("admin"), getUserByIdController);
router.patch("/profile", isAuthenticated, updateProfileController);
router.patch("/password", isAuthenticated, updatePasswordController);
router.patch("/:userId/role", isAuthenticated, authorize("admin"), updateRoleController);
router.patch("/:userId/status", isAuthenticated, authorize("admin"), updateStatusController);

export default router;