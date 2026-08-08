import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { getMyNotificationsController, markNotificationAsReadController, } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/notifications", isAuthenticated, getMyNotificationsController);
router.patch("/notifications/:notificationId/read", isAuthenticated, markNotificationAsReadController);


export default router;