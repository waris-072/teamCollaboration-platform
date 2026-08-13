import api from "../api/axios";

// Admin Dashboard
export const getAdminDashboard = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};

// Manager Dashboard
export const getManagerDashboard = async () => {
  const response = await api.get("/manager/dashboard");
  return response.data;
};

// Member Dashboard
export const getMemberDashboard = async () => {
  const response = await api.get("/member/dashboard");
  return response.data;
};