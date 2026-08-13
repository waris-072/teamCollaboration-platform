import api from "../api/axios";

// Get comments for a task
export const getTaskComments = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}/comments`);
  return response.data;
};

// Create a comment
export const createTaskComment = async (taskId, message) => {
  const response = await api.post(`/tasks/${taskId}/comments`,{ message });
  return response.data;
};

// Delete a comment
export const deleteTaskComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};