import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { getIO } from "../config/socket.js";

export async function createNotificationService(data) {
    const {
        recipient,
        sender = null,
        title,
        message,
        type,
    } = data;

    // -------------------------------------------------
    // Validate recipient
    // -------------------------------------------------

    const recipientUser = await User.findById(recipient);

    if (!recipientUser) {
        throw new Error("Notification recipient not found.");
    }

    if (!recipientUser.isActive) {
        throw new Error(
            "Cannot notify an inactive user."
        );
    }

    // -------------------------------------------------
    // Validate sender only when provided
    // -------------------------------------------------

    if (sender) {
        const senderUser =
            await User.findById(sender);

        if (!senderUser) {
            throw new Error(
                "Notification sender not found."
            );
        }
    }

    // -------------------------------------------------
    // Create notification
    // -------------------------------------------------

    const notification =
        await Notification.create({
            recipient,
            sender,
            title,
            message,
            type,
        });

    // -------------------------------------------------
    // Populate notification
    // -------------------------------------------------

    const populatedNotification =
        await Notification.findById(
            notification._id
        )
            .populate(
                "recipient",
                "name email role"
            )
            .populate(
                "sender",
                "name email role"
            );

    // -------------------------------------------------
    // Send real-time notification
    // -------------------------------------------------

    const io = getIO();

    io.to(
        `user:${recipientUser._id.toString()}`
    ).emit(
        "notification",
        populatedNotification
    );

    return populatedNotification;
}


// =====================================================
// Get Current User Notifications
// =====================================================

export async function getMyNotificationsService(
    currentUser
) {
    const notifications =
        await Notification.find({
            recipient: currentUser._id,
        })
            .populate(
                "recipient",
                "name email role"
            )
            .populate(
                "sender",
                "name email role"
            )
            .sort({
                createdAt: -1,
            });

    return notifications;
}


// =====================================================
// Mark Notification As Read
// =====================================================

export async function markNotificationAsReadService(
    notificationId,
    currentUser
) {
    const notification =
        await Notification.findById(
            notificationId
        );

    if (!notification) {
        throw new Error(
            "Notification not found."
        );
    }

    // -------------------------------------------------
    // Ownership check
    // -------------------------------------------------

    if (
        notification.recipient.toString() !==
        currentUser._id.toString()
    ) {
        throw new Error(
            "You can only update your own notifications."
        );
    }

    // -------------------------------------------------
    // Already read
    // -------------------------------------------------

    if (notification.isRead) {
        return notification;
    }

    // -------------------------------------------------
    // Mark as read
    // -------------------------------------------------

    notification.isRead = true;

    await notification.save();

    return notification;
}