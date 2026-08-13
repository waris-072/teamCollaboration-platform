import {
  FaBell,
  FaCheckCircle,
  FaTasks,
  FaProjectDiagram,
  FaClock,
  FaEye,
  FaTimes,
} from "react-icons/fa";

import { useNotifications } from "../../context/NotificationContext";

import "./NotificationPanel.css";

function NotificationPanel({ onClose, onViewAll }) {
  const { notifications, loading, markAsRead } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case "task_assigned":
        return <FaTasks />;
      case "task_updated":
        return <FaTasks />;
      case "project_updated":
        return <FaProjectDiagram />;
      case "deadline":
        return <FaClock />;
      default:
        return <FaBell />;
    }
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

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification._id);
      } catch {
        // Error already handled by context
      }
    }
  };

  const formatTime = (date) => {
    if (!date) return "";
    try {
      const parsed = new Date(date);
      const now = new Date();
      const diffMs = now - parsed;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return parsed.toLocaleDateString();
    } catch {
      return "";
    }
  };

  // Get only the latest 5 notifications
  const latestNotifications = notifications.slice(0, 5);
  const hasMore = notifications.length > 5;

  return (
    <div className="notification-panel">
      {/* Header */}
      <div className="notification-panel-header">
        <div className="notification-panel-title">
          <FaBell />
          <h3>Notifications</h3>
          <span className="notification-count">
            {notifications.filter(n => !n.isRead).length} unread
          </span>
        </div>
        <button
          type="button"
          className="notification-panel-close"
          onClick={onClose}
          aria-label="Close notifications"
        >
          <FaTimes />
        </button>
      </div>

      {/* List */}
      <div className="notification-list">
        {loading && (
          <div className="notification-empty">
            <div className="notification-loader" />
            <p>Loading notifications...</p>
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="notification-empty">
            <FaBell />
            <p>No notifications yet.</p>
            <span>You'll see notifications here when you receive updates.</span>
          </div>
        )}

        {!loading && latestNotifications.map((notification) => (
          <div
            key={notification._id}
            className={`notification-item ${notification.isRead ? "read" : "unread"}`}
            onClick={() => handleNotificationClick(notification)}
          >
            <div 
              className="notification-item-icon"
              style={{ backgroundColor: getTypeColor(notification.type) + "20" }}
            >
              <span style={{ color: getTypeColor(notification.type) }}>
                {getIcon(notification.type)}
              </span>
            </div>

            <div className="notification-item-content">
              <div className="notification-item-header">
                <span className="notification-item-title">
                  {notification.title}
                </span>
                {!notification.isRead && (
                  <span className="notification-unread-dot" />
                )}
              </div>
              <p className="notification-item-message">
                {notification.message}
              </p>
              <span className="notification-item-time">
                {formatTime(notification.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer with "See More" button */}
      <div className="notification-panel-footer">
        <button
          type="button"
          className="notification-view-all"
          onClick={onViewAll}
        >
          <FaEye />
          {hasMore ? `See All ${notifications.length} Notifications` : "View All Notifications"}
        </button>
      </div>
    </div>
  );
}

export default NotificationPanel;