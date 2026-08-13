import api from "../api/axios";

// Get current user's notifications
export const getMyNotifications = async () => {
  const response = await api.get("/notifications");
  return response.data;
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  const response = await api.patch(
    `/notifications/${notificationId}/read`
  );

  return response.data;
};