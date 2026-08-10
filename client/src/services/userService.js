import api from "../api/axios";

export const createUser = async (userData) => {
    const response = await api.post("/users", userData);
    return response.data;
};

export const getUsers = async () => {
    const response = await api.get("/users");
    return response.data;
};

export const getUserById = async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
};

export const updateUserRole = async (userId, role) => {
    const response = await api.patch( `/users/${userId}/role`, { role });
    return response.data;
};

export const updateUserStatus = async (userId, isActive) => {
    const response = await api.patch( `/users/${userId}/status`, { isActive });
    return response.data;
};
