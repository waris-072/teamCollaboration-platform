import { createContext, useEffect, useState } from "react";

import { getProfile, loginUser, logoutUser, updateProfile, } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";
  const isMember = user?.role === "member";

  // Check if the user is already authenticated
  const checkAuth = async () => {
    try {
      const data = await getProfile();
      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (formData) => {
    const data = await loginUser(formData);

    setUser(data.user);

    return data;
  };

  // Logout user
  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  };

  // Update logged-in user's profile
  const updateUser = async (formData) => {
    const data = await updateProfile(formData);
    setUser(data.user);
    return data;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isAdmin,
        isManager,
        isMember,
        checkAuth,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
