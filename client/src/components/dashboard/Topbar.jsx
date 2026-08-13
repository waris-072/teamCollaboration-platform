import { useLocation, useNavigate } from "react-router-dom";
import { FaBell, FaSearch, FaUserCircle, FaBars } from "react-icons/fa";
import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import NotificationPanel from "../notifications/NotificationPanel";
import { useNotifications } from "../../context/NotificationContext";
import "./dashboard-styling/Topbar.css";

function Topbar() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const path = location.pathname;

  const getPageConfig = () => {
    if (path.includes("/dashboard")) {
      return {
        title: "Dashboard",
        searchable: false,
      };
    }

    if (path.includes("/users")) {
      return {
        title: "Users",
        searchable: true,
      };
    }

    if (path.includes("/members")) {
      return {
        title: "Members",
        searchable: true,
      };
    }

    if (path.includes("/projects")) {
      return {
        title: "Projects",
        searchable: true,
      };
    }

    if (path.includes("/tasks")) {
      return {
        title: "Tasks",
        searchable: true,
      };
    }

    if (path.includes("/notifications")) {
      return {
        title: "Notifications",
        searchable: true,
      };
    }

    if (path.includes("/profile")) {
      return {
        title: "My Profile",
        placeholder: "",
        searchable: false,
      };
    }

    return {
      title: "TeamFlow",
      searchable: false,
    };
  };

  const pageConfig = getPageConfig();

  const handleViewAllNotifications = () => {
    setShowNotifications(false);

    if (user?.role === "admin") {
      navigate("/admin/notifications");
    } else if (user?.role === "manager") {
      navigate("/manager/notifications");
    } else if (user?.role === "member") {
      navigate("/member/notifications");
    }
  };

  const handleProfileClick = () => {
    if (user?.role === "admin") {
      navigate("/admin/profile");
    } else if (user?.role === "manager") {
      navigate("/manager/profile");
    } else if (user?.role === "member") {
      navigate("/member/profile");
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-mobile-toggle"
          id="sidebarToggle"
          aria-label="Toggle navigation"
        >
          <FaBars />
        </button>

        <div className="topbar-page-info">
          <h1>{pageConfig.title}</h1>
        </div>
      </div>

      <div className="topbar-right">
        <button
          type="button"
          className="notification-button"
          aria-label="Notifications"
          onClick={() => setShowNotifications((prev) => !prev)}
        >
          <FaBell />
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <NotificationPanel
            onClose={() => setShowNotifications(false)}
            onViewAll={handleViewAllNotifications}
          />
        )}

        <button
          type="button"
          className="topbar-user"
          onClick={handleProfileClick}
          aria-label="Open profile"
        >
          <div className="topbar-avatar">
            <FaUserCircle className="topbar-profile-icon" />
          </div>

          <div className="topbar-user-info">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>
        </button>
      </div>
    </header>
  );
}

export default Topbar;