import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { getIO } from "../config/socket.js";

// Create a new notification and send it to the recipient in real-time
export async function createNotificationService(data) {
    const {recipient, sender, title, message, type} = data;

    const recipientUser = await User.findById(recipient);

    if (!recipientUser) {
        throw new Error("Notification recipient not found.");
    }

    if (!recipientUser.isActive) {
        throw new Error("Cannot notify an inactive user.");
    }

    const senderUser = await User.findById(sender);

    if (!senderUser) {
        throw new Error("Notification sender not found.");
    }

    const notification = 
        await Notification.create({recipient, sender, title, message, type});

    const populatedNotification = await Notification.findById(notification._id)
        .populate("recipient","name email role")
        .populate("sender","name email role");

    const io = getIO();
    io.to(`user:${recipientUser._id.toString()}`).emit(
        "notification",
        populatedNotification
    );

    return populatedNotification;
}

// Mark a notification as read for the current user
export async function markNotificationAsReadService(notificationId,currentUser) {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
        throw new Error("Notification not found.");
    }

    if (
        notification.recipient.toString() !==
        currentUser._id.toString()
    ) {
        throw new Error("You can only update your own notifications.");
    }

    if (notification.isRead) {
        return notification;
    }

    notification.isRead = true;
    await notification.save();
    return notification;
}