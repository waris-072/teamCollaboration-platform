import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { io } from "socket.io-client";

import useAuth from "../hooks/useAuth";

import {
  getMyNotifications,
  markNotificationAsRead,
} from "../services/notificationService";

const NotificationContext = createContext(null);

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

export function NotificationProvider({ children }) {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  /*
   * ==========================================
   * Fetch existing notifications
   * ==========================================
   */

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const fetchNotifications = async () => {
      try {
        setLoading(true);

        const response = await getMyNotifications();

        setNotifications(
          response.notifications || []
        );
      } catch (error) {
        console.error(
          "Failed to load notifications:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  /*
   * ==========================================
   * Socket connection
   * ==========================================
   */

  useEffect(() => {
    if (!user) {
      return;
    }

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
    });

    setSocket(newSocket);

    /*
     * Connection
     */

    newSocket.on("connect", () => {
      console.log(
        "Notification socket connected:",
        newSocket.id
      );
    });

    /*
     * Authentication error
     */

    newSocket.on("connect_error", (error) => {
      console.error(
        "Notification socket error:",
        error.message
      );
    });

    /*
     * New notification
     */

    newSocket.on(
      "notification",
      (notification) => {
        console.log(
          "New notification:",
          notification
        );

        setNotifications((previous) => [
          notification,
          ...previous,
        ]);
      }
    );

    /*
     * Cleanup
     */

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [user]);

  /*
   * ==========================================
   * Mark notification as read
   * ==========================================
   */

  const markAsRead = async (notificationId) => {
    try {
      const response =
        await markNotificationAsRead(
          notificationId
        );

      const updatedNotification =
        response.notification;

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id ===
          updatedNotification._id
            ? updatedNotification
            : notification
        )
      );

      return updatedNotification;
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );

      throw error;
    }
  };

  /*
   * ==========================================
   * Unread count
   * ==========================================
   */

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  /*
   * ==========================================
   * Context value
   * ==========================================
   */

  const value = {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    socket,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context =
    useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider."
    );
  }

  return context;
}