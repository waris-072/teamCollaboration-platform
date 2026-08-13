import bcrypt from "bcrypt";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";


export const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new Error("Invalid email or password");
  }
  
  if (!user.isActive) {
    throw new Error("Your account is inactive. Please contact an administrator.");
  }

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { lastLogin: new Date() },
    { new: true } // Return the updated document
  ).select("-password");

  const token = generateToken(user._id, user.role);

  return {
    user: updatedUser,
    token,
  };
};

export const updateProfileService = async (userId, data) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  user.name = data.name;
  user.phone = data.phone;
  user.address = data.address;

  await user.save();

  return user;
};