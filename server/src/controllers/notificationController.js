import { getMyNotificationsService, markNotificationAsReadService, } from "../services/notificationService.js";

// Get My Notifications Controller
export async function getMyNotificationsController(req, res) {
    try {
        const notifications = await getMyNotificationsService(req.user);
        res.status(200).json({
            success: true,
            count: notifications.length,
            notifications,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

//Mark Notification as Read Controller
export async function markNotificationAsReadController(req, res) {
    try {
        const notification = await markNotificationAsReadService(
                req.params.notificationId,
                req.user
            );
        res.status(200).json({
            success: true,
            message: "Notification marked as read.",
            notification,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}