import { createTaskService, getTasksService, getTaskByIdService, updateTaskService, updateTaskStatusService, deleteTaskService } from "../services/taskService.js";


export async function createTaskController(req, res) {
    try {
        const task = await createTaskService(req.body, req.user);
        res.status(201).json({
            success: true,
            message: "Task created successfully.",
            task,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

//Get All Tasks Controller
export async function getTasksController(req, res) {
    try {
        const tasks = await getTasksService(req.user);
        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

// Get Task By ID Controller
export async function getTaskByIdController(req, res) {
    try {
        const task = await getTaskByIdService(
            req.params.taskId,
            req.user
        );
        res.status(200).json({
            success: true,
            task,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

// Update Task Controller
export async function updateTaskController(req, res) {
    try {
        const task = await updateTaskService(
            req.params.taskId,
            req.body,
            req.user
        );
        res.status(200).json({
            success: true,
            message: "Task updated successfully.",
            task,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

// Update Task Status Controller
export async function updateTaskStatusController(req,res) {
    try {
        const task = await updateTaskStatusService(
            req.params.taskId,
            req.body.status,
            req.user
        );
        res.status(200).json({
            success: true,
            message: "Task status updated successfully.",
            task,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

// Delete Task
export async function deleteTaskController(req, res) {
    try {
        const { taskId } = req.params;

        const result = await deleteTaskService(
            taskId,
            req.user
        );

        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({
            message:
                error.message ||
                "Unable to delete task.",
        });
    }
}