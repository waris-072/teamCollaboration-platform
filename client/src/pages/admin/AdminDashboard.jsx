import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaUserShield,
  FaUserTie,
  FaUser,
  FaProjectDiagram,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaExclamationTriangle,
  FaBell,
  FaArrowRight,
  FaFolderOpen,
  FaUserPlus,
  FaChartLine,
} from "react-icons/fa";

import { getAdminDashboard } from "../../services/dashboardService";
import Loader from "../../components/loader/Loader";
import useAuth from "../../hooks/useAuth";

import "./Admin-styling/AdminDashboard.css";

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [dashboardData, setDashboardData] = useState(null);

  // Role-based theme colors
  const theme = {
    primary: "#2563eb",
    primaryLight: "#eff6ff",
    primaryDark: "#1d4ed8",
    iconBg: "var(--admin-primary-light)",
    iconColor: "var(--admin-primary)",
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setServerError("");
        const response = await getAdminDashboard();
        setDashboardData(response.data);
      } catch (error) {
        setServerError(
          error?.response?.data?.message || "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "#10b981",
      planning: "#f59e0b",
      completed: "#3b82f6",
      cancelled: "#ef4444",
    };
    return colors[status] || "#94a3b8";
  };

  const getStatusLabel = (status) => {
    if (!status) return "Active";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return <Loader message="Loading dashboard..." />;
  }

  if (serverError || !dashboardData) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-error">
          <FaTimesCircle className="error-icon" />
          <span>{serverError || "Unable to load dashboard"}</span>
        </div>
      </div>
    );
  }

  const { stats, recentProjects, recentUsers, recentNotifications } = dashboardData;

  return (
    <div className="admin-dashboard-page">
      {/* Header */}
      <div className="admin-dashboard-header">
        <div className="admin-dashboard-title">
          <div className="admin-dashboard-icon">
            <FaChartLine />
          </div>
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {user?.name || "Admin"}! Here's an overview of your workspace.</p>
          </div>
        </div>
        <div className="admin-dashboard-date">
          <span>{new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="admin-dashboard-stats">
        {/* Users */}
        <div className="stat-card users-card">
          <div className="stat-card-icon users">
            <FaUsers />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Total Users</span>
            <strong className="stat-value">{stats.users.total}</strong>
            <div className="stat-breakdown">
              <span><FaUserShield /> {stats.users.admins}</span>
              <span><FaUserTie /> {stats.users.managers}</span>
              <span><FaUser /> {stats.users.members}</span>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="stat-card projects-card">
          <div className="stat-card-icon projects">
            <FaProjectDiagram />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Total Projects</span>
            <strong className="stat-value">{stats.projects.total}</strong>
            <div className="stat-breakdown">
              <span className="active">{stats.projects.active}</span>
              <span className="planning">{stats.projects.planning}</span>
              <span className="completed">{stats.projects.completed}</span>
              <span className="cancelled">{stats.projects.cancelled}</span>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="stat-card tasks-card">
          <div className="stat-card-icon tasks">
            <FaTasks />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Total Tasks</span>
            <strong className="stat-value">{stats.tasks.total}</strong>
            <div className="stat-breakdown">
              <span className="todo">{stats.tasks.todo}</span>
              <span className="in-progress">{stats.tasks.inProgress}</span>
              <span className="review">{stats.tasks.review}</span>
              <span className="completed">{stats.tasks.completed}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity Grid */}
      <div className="admin-dashboard-grid">
        {/* Recent Projects */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="card-header-left">
              <FaFolderOpen className="card-header-icon" style={{ color: theme.primary }} />
              <h3>Recent Projects</h3>
            </div>
            <button
              type="button"
              className="card-view-all"
              style={{ color: theme.primary }}
              onClick={() => navigate("/admin/projects")}
            >
              View All <FaArrowRight />
            </button>
          </div>
          <div className="dashboard-card-body">
            {recentProjects.length === 0 ? (
              <div className="empty-state">
                <FaProjectDiagram />
                <p>No projects created yet</p>
              </div>
            ) : (
              recentProjects.map((project) => (
                <div
                  key={project._id}
                  className="recent-item"
                  onClick={() => navigate(`/admin/projects/${project._id}`)}
                >
                  <div className="recent-item-icon" style={{ backgroundColor: getStatusColor(project.status) + "20" }}>
                    <FaProjectDiagram style={{ color: getStatusColor(project.status) }} />
                  </div>
                  <div className="recent-item-content">
                    <span className="recent-item-title">{project.title}</span>
                    <span className="recent-item-sub">
                      {project.manager?.name || "Unassigned"} • {formatDate(project.createdAt)}
                    </span>
                  </div>
                  <span className="recent-item-status" style={{ backgroundColor: getStatusColor(project.status) + "20", color: getStatusColor(project.status) }}>
                    {getStatusLabel(project.status)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="card-header-left">
              <FaUsers className="card-header-icon" style={{ color: theme.primary }} />
              <h3>Recent Users</h3>
            </div>
            <button
              type="button"
              className="card-view-all"
              style={{ color: theme.primary }}
              onClick={() => navigate("/admin/users")}
            >
              View All <FaArrowRight />
            </button>
          </div>
          <div className="dashboard-card-body">
            {recentUsers.length === 0 ? (
              <div className="empty-state">
                <FaUserPlus />
                <p>No users registered yet</p>
              </div>
            ) : (
              recentUsers.map((user) => (
                <div
                  key={user._id}
                  className="recent-item"
                  onClick={() => navigate(`/admin/users/${user._id}`)}
                >
                  <div className="recent-item-avatar" style={{ background: theme.primary }}>
                    {getInitials(user.name)}
                  </div>
                  <div className="recent-item-content">
                    <span className="recent-item-title">{user.name}</span>
                    <span className="recent-item-sub">
                      {user.email} • {user.role}
                    </span>
                  </div>
                  <span className={`recent-item-status ${user.isActive ? "active" : "inactive"}`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="dashboard-card full-width">
          <div className="dashboard-card-header">
            <div className="card-header-left">
              <FaBell className="card-header-icon" style={{ color: theme.primary }} />
              <h3>Recent Notifications</h3>
            </div>
            <button
              type="button"
              className="card-view-all"
              style={{ color: theme.primary }}
              onClick={() => navigate("/admin/notifications")}
            >
              View All <FaArrowRight />
            </button>
          </div>
          <div className="dashboard-card-body">
            {recentNotifications.length === 0 ? (
              <div className="empty-state">
                <FaBell />
                <p>No notifications yet</p>
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <div key={notification._id} className="notification-item">
                  <div className="notification-item-icon" style={{ background: theme.primaryLight, color: theme.primary }}>
                    <FaBell />
                  </div>
                  <div className="notification-item-content">
                    <span className="notification-item-title">{notification.title}</span>
                    <span className="notification-item-message">{notification.message}</span>
                  </div>
                  <span className="notification-item-time">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;