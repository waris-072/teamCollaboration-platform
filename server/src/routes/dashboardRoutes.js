import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorize.js";
import {
  getAdminDashboard,
  getManagerDashboard,
  getMemberDashboard,
} from "../controllers/dashboardController.js";

const router = express.Router();

// Admin Dashboard - Only admins
router.get(
  "/admin/dashboard",
  isAuthenticated,
  authorize("admin"),
  getAdminDashboard
);

// Manager Dashboard - Only managers
router.get(
  "/manager/dashboard",
  isAuthenticated,
  authorize("manager"),
  getManagerDashboard
);

// Member Dashboard - Only members
router.get(
  "/member/dashboard",
  isAuthenticated,
  authorize("member"),
  getMemberDashboard
);

export default router;