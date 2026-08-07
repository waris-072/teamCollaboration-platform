import { createUserService, getUsersService, getUserByIdService, updateProfileService, updatePasswordService, updateRoleService, updateStatusService } from "../services/userService.js";

export async function createUserController(req, res) {
  try {
    const user = await createUserService(req.body);

    res.status(201).json({
      success: true,
      message: "User created successfully.",
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getUsersController(req, res) {
  try {
    const users = await getUsersService();

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getUserByIdController(req, res) {
    try {
        const user = await getUserByIdService(req.params.userId);
        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
}

export async function updateProfileController(req, res) {
    try {
        const user = await updateProfileService(req.user._id,req.body);
        res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function updatePasswordController(req, res) {
    try {
        await updatePasswordService(req.user._id, req.body);
        res.status(200).json({
            success: true,
            message: "Password updated successfully.",
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function updateRoleController(req, res) {
    try {
        const user = await updateRoleService(req.params.userId,req.body.role);
        res.status(200).json({
            success: true,
            message: "User role updated successfully.",
            user,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function updateStatusController(req, res) {
    try {
        const user = await updateStatusService(
            req.params.userId,
            req.body.isActive,
            req.user
        );
        res.status(200).json({
            success: true,
            message: "User status updated successfully.",
            user,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}