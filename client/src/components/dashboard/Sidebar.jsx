import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaSignOutAlt, FaTimes } from "react-icons/fa";

import useAuth from "../../hooks/useAuth";
import { navigationConfig } from "../../config/navigationConfig";
import Loader from "../loader/Loader";
import "./dashboard-styling/Sidebar.css";

function Sidebar() {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigationItems = navigationConfig[user?.role] || [];
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigation = () => {
    setIsMobileOpen(false);
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const toggleButton = document.getElementById('sidebarToggle');
    
    const handleToggle = () => {
      setIsMobileOpen((prev) => !prev);
    };

    if (toggleButton) {
      toggleButton.addEventListener('click', handleToggle);
    }

    return () => {
      if (toggleButton) {
        toggleButton.removeEventListener('click', handleToggle);
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return <Loader message="signing out..." />;
  }

  return (
    <>
      {isMobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${isMobileOpen ? "sidebar-open" : ""}`}>
        <button
          type="button"
          className="sidebar-close-button"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close sidebar"
        >
          <FaTimes />
        </button>

        <div className="sidebar-brand">
          <h2>TeamFlow</h2>
          <span>Workspace</span>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div className="sidebar-user-info">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>
        </div>

        <nav className="sidebar-navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavigation}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
                }
              >
                <Icon className="sidebar-link-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;