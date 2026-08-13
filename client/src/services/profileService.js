import api from "../api/axios";

// Get current user profile
export const getProfile = async () => {
  const response = await api.get("/users/profile");
  return response.data;
};

// Update profile (name, avatar)
export const updateProfile = async (data) => {
  const response = await api.patch("/users/profile", data);
  return response.data;
};

// Update password
export const updatePassword = async (data) => {
  const response = await api.patch("/users/password", data);
  return response.data;
};