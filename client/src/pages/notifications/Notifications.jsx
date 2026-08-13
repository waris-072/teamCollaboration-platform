import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaCheckCircle,
  FaClock,
  FaProjectDiagram,
  FaTasks,
  FaInfoCircle,
  FaTimes,
  FaCheck,
  FaFilter,
  FaEye,
  FaTrash,
} from "react-icons/fa";
import { format } from "date-fns";

import useAuth from "../../hooks/useAuth";
import { useNotifications } from "../../context/NotificationContext";
import Loader from "../../components/loader/Loader";

import "./Notifications.css";

function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, loading, markAsRead, unreadCount } = useNotifications();

  const [filter, setFilter] = useState("all");
  const [isUpdating, setIsUpdating] = useState(false);
  const [serverError, setServerError] = useState("");
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [selectMode, setSelectMode] = useState(false);

  // =====================================================
  // Get role-based path
  // =====================================================

  const getRolePath = () => {
    if (user?.role === "admin") return "/admin";
    if (user?.role === "manager") return "/manager";
    if (user?.role === "member") return "/member";
    return "";
  };

  // =====================================================
  // Filter Notifications
  // =====================================================

  const getTypeLabel = (type) => {
    const labels = {
      task_assigned: "Task Assigned",
      task_updated: "Task Updated",
      project_updated: "Project Updated",
      deadline: "Deadline Alert",
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type) => {
    const icons = {
      task_assigned: <FaTasks />,
      task_updated: <FaTasks />,
      project_updated: <FaProjectDiagram />,
      deadline: <FaClock />,
    };
    return icons[type] || <FaInfoCircle />;
  };

  const getTypeColor = (type) => {
    const colors = {
      task_assigned: "#3b82f6",
      task_updated: "#8b5cf6",
      project_updated: "#06b6d4",
      deadline: "#ef4444",
    };
    return colors[type] || "#6b7280";
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.isRead;
    if (filter === "read") return notification.isRead;
    return true;
  });

  // =====================================================
  // Format Date
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "Unknown";
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) return "Unknown";
      
      const now = new Date();
      const diffMs = now - parsedDate;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return format(parsedDate, "MMM d, yyyy");
    } catch {
      return "Unknown";
    }
  };

  // =====================================================
  // Mark as Read
  // =====================================================

  const handleMarkAsRead = async (notificationId) => {
    try {
      setIsUpdating(true);
      await markAsRead(notificationId);
    } catch (error) {
      setServerError(
        error?.response?.data?.message || "Failed to mark notification as read."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications
      .filter((n) => !n.isRead)
      .map((n) => n._id);

    if (unreadIds.length === 0) return;

    try {
      setIsUpdating(true);
      await Promise.all(unreadIds.map((id) => markAsRead(id)));
    } catch (error) {
      setServerError(
        error?.response?.data?.message || "Failed to mark all as read."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkSelectedAsRead = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      setIsUpdating(true);
      await Promise.all(selectedNotifications.map((id) => markAsRead(id)));
      setSelectedNotifications([]);
      setSelectMode(false);
    } catch (error) {
      setServerError(
        error?.response?.data?.message || "Failed to mark selected as read."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // =====================================================
  // Toggle Selection
  // =====================================================

  const toggleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map((n) => n._id));
    }
  };

  const toggleSelectNotification = (id) => {
    setSelectedNotifications((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  // =====================================================
  // Navigate on notification click
  // =====================================================

  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }

    const basePath = getRolePath();

    // Navigate based on notification type
    switch (notification.type) {
      case "task_assigned":
      case "task_updated":
        navigate(`${basePath}/tasks`);
        break;
      case "project_updated":
        navigate(`${basePath}/projects`);
        break;
      case "deadline":
        navigate(`${basePath}/tasks`);
        break;
      default:
        break;
    }
  };

  // =====================================================
  // Render
  // =====================================================

  if (loading) {
    return <Loader message="Loading notifications..." />;
  }

  return (
    <div className="notifications-page">
      {/* Header */}
      <div className="notifications-header">
        <div className="notifications-title">
          <div className="notifications-icon">
            <FaBell />
          </div>
          <div>
            <h1>Notifications</h1>
            <p>Stay updated with your tasks and projects</p>
          </div>
        </div>
        <div className="notifications-actions">
          {unreadCount > 0 && (
            <button
              type="button"
              className="notifications-mark-all"
              onClick={handleMarkAllAsRead}
              disabled={isUpdating}
            >
              <FaCheck />
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {serverError && (
        <div className="notifications-error">
          <span>{serverError}</span>
          <button type="button" onClick={() => setServerError("")}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* Stats */}
      <section className="notifications-stats">
        <div className="notification-stat-card">
          <div className="notification-stat-icon total"><FaBell /></div>
          <div>
            <span>Total</span>
            <strong>{notifications.length}</strong>
          </div>
        </div>
        <div className="notification-stat-card">
          <div className="notification-stat-icon unread"><FaClock /></div>
          <div>
            <span>Unread</span>
            <strong>{unreadCount}</strong>
          </div>
        </div>
        <div className="notification-stat-card">
          <div className="notification-stat-icon read"><FaCheckCircle /></div>
          <div>
            <span>Read</span>
            <strong>{notifications.length - unreadCount}</strong>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="notifications-toolbar">
        <div className="notifications-filters">
          <button
            type="button"
            className={`notification-filter ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            type="button"
            className={`notification-filter ${filter === "unread" ? "active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            Unread
            {unreadCount > 0 && (
              <span className="filter-count">{unreadCount}</span>
            )}
          </button>
          <button
            type="button"
            className={`notification-filter ${filter === "read" ? "active" : ""}`}
            onClick={() => setFilter("read")}
          >
            Read
          </button>
        </div>

        <div className="notifications-toolbar-actions">
          {selectMode && selectedNotifications.length > 0 && (
            <button
              type="button"
              className="notifications-select-action"
              onClick={handleMarkSelectedAsRead}
              disabled={isUpdating}
            >
              <FaCheck />
              Mark Selected Read
            </button>
          )}
          <button
            type="button"
            className={`notifications-select-toggle ${selectMode ? "active" : ""}`}
            onClick={() => setSelectMode(!selectMode)}
          >
            <FaFilter />
            {selectMode ? "Cancel" : "Select"}
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="notifications-results-header">
        <div>
          Showing <strong>{filteredNotifications.length}</strong> of{" "}
          <strong>{notifications.length}</strong> notifications
        </div>
        {selectMode && selectedNotifications.length > 0 && (
          <span className="selected-count">
            {selectedNotifications.length} selected
          </span>
        )}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="notifications-empty">
          <div className="notifications-empty-icon">
            <FaBell />
          </div>
          <h3>
            {notifications.length === 0
              ? "No notifications yet"
              : "No notifications found"}
          </h3>
          <p>
            {notifications.length === 0
              ? "You'll see notifications here when you receive updates."
              : "Try changing your filter."}
          </p>
          {filter !== "all" && notifications.length > 0 && (
            <button
              type="button"
              className="notifications-empty-clear"
              onClick={() => setFilter("all")}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="notifications-list">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${!notification.isRead ? "unread" : ""} ${
                selectedNotifications.includes(notification._id) ? "selected" : ""
              }`}
            >
              {/* Select Checkbox */}
              {selectMode && (
                <div className="notification-select">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification._id)}
                    onChange={() => toggleSelectNotification(notification._id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              {/* Icon */}
              <div 
                className="notification-icon-wrapper"
                style={{ backgroundColor: getTypeColor(notification.type) + "20" }}
                onClick={() => handleNotificationClick(notification)}
              >
                <span style={{ color: getTypeColor(notification.type) }}>
                  {getTypeIcon(notification.type)}
                </span>
              </div>

              {/* Content */}
              <div 
                className="notification-content"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-top">
                  <div className="notification-info">
                    <span className="notification-type">
                      {getTypeLabel(notification.type)}
                    </span>
                    {!notification.isRead && (
                      <span className="notification-unread-dot">●</span>
                    )}
                  </div>
                  <span className="notification-time">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>

                <div className="notification-body">
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                </div>

                <div className="notification-footer">
                  {notification.sender && (
                    <span className="notification-sender">
                      From: {notification.sender.name || "System"}
                    </span>
                  )}
                  {!notification.isRead && (
                    <button
                      type="button"
                      className="notification-mark-read"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification._id);
                      }}
                      disabled={isUpdating}
                    >
                      <FaCheck />
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;