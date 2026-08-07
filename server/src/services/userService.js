import bcrypt from "bcrypt";
import User from "../models/User.js";

export async function createUserService(data) {
    const { name, email, password, role, avatar = "", } = data;

    if (!["manager", "member"].includes(role)) {
        throw new Error("Only manager and member accounts can be created.");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error("Email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        avatar,
    });

    user.password = undefined;
    return user;
}

export async function getUsersService() {
  const users = await User.find()
    .select("-password")
    .sort({ createdAt: -1 });

  return users;
}

export async function getUserByIdService(userId) {
    const user = await User.findById(userId).select("-password");

    if (!user) {
        throw new Error("User not found.");
    }

    return user;
}

export async function updateProfileService(userId, data) {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found.");
    }

    const { name, avatar } = data;
    if (name !== undefined) {
        user.name = name;
    }

    if (avatar !== undefined) {
        user.avatar = avatar;
    }

    await user.save();
    return await User.findById(user._id).select("-password");
}

export async function updatePasswordService(userId, data) {
    const { password, newPassword } = data;
    const user = await User.findById(userId).select("+password");

    if (!user) {
        throw new Error("User not found.");
    }

    const isPasswordMatched = await bcrypt.compare(password,user.password);
    if (!isPasswordMatched) {
        throw new Error("Current password is incorrect.");
    }

    if (password === newPassword) {
        throw new Error(
            "New password must be different from the current password."
        );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
}

export async function updateRoleService(userId, role) {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found.");
    }

    if (role === "admin") {
        throw new Error("Admin role cannot be assigned.");
    }

    if (!["manager", "member"].includes(role)) {
        throw new Error("Invalid user role.");
    }

    if (user.role === role) {
        throw new Error(`User is already a ${role}.`);
    }

    user.role = role;
    await user.save();
    return await User.findById(user._id).select("-password");
}

export async function updateStatusService(userId,isActive,currentUser) {

    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found.");
    }

    if (user._id.toString() === currentUser._id.toString()) {
        throw new Error("You cannot deactivate your own account.");
    }

    if (user.role === "admin") {
        throw new Error("Admin account status cannot be changed.");
    }
    
    if (user.isActive === isActive) {
        throw new Error(`User is already ${isActive ? "active" : "inactive"}.`);
    }

    user.isActive = isActive;
    await user.save();
    return await User.findById(user._id).select("-password");
}