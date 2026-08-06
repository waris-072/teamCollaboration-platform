import {registerService, loginService, updateProfileService} from "../services/authService.js";
import cookieOptions from "../utils/cookieOptions.js";

export const registerController = async (req, res) => {
  try {
    const { confirmPassword, ...userData } = req.body;
    const { user, token } = await registerService(userData);

    res.status(201).cookie("token", token, cookieOptions).json({
        success: true,
        message: "User registered successfully",
        user,
      });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const { user, token } = await loginService(req.body);

    res.status(200).cookie("token", token, cookieOptions).json({
        success: true,
        message: "Login successful",
        user,
      });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export const profileController = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logoutController = async (req, res) => {
  try {
    res.clearCookie("token", cookieOptions).status(200).json({
        success: true,
        message: "Logout successful.",
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfileController = async (req, res, next) => {
  try {
    const user = await updateProfileService(req.user.id, req.body);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    next(error);
  }
};