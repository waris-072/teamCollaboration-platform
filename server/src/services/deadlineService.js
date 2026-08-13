import Task from "../models/Task.js";
import Notification from "../models/Notification.js";
import { createNotificationService } from "./notificationService.js";

// =Check for upcoming deadlines and send notifications to assigned users
export async function checkUpcomingDeadlines() {
    const now = new Date();

    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
        dueDate: {
            $gte: tomorrowStart,
            $lte: tomorrowEnd,
        },
        status: {
            $ne: "completed",
        },
    }).select(
        "_id title assignedTo dueDate"
    );

    for (const task of tasks) {
        try {
            const existingNotification = await Notification.findOne({
                recipient: task.assignedTo,
                type: "deadline",
                message: `The task "${task.title}" is due tomorrow.`,
                createdAt: {
                    $gte: new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate()
                    ),
                },
            });

            if (existingNotification) {
                continue;
            }

            await createNotificationService({
                recipient: task.assignedTo,
                sender: null,
                title: "Task Deadline Tomorrow",
                message: `The task "${task.title}" is due tomorrow.`,
                type: "deadline",
            });
        } catch (error) {
            console.error(
                `Deadline notification failed for task ${task._id}:`,
                error.message
            );
        }
    }

}