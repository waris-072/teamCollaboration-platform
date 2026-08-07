import bcrypt from "bcrypt";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const registerService = async (userData) => {
  const { name, email, password, phone, address } = userData;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    address,
    role: "customer",
  });

  const token = generateToken(user._id, user.role);
  user.password = undefined; // this excludes password from the response

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};


export const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new Error("Invalid email or password");
  }

  user.password = undefined;
  const token = generateToken(user._id, user.role);

  return {
    user,
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