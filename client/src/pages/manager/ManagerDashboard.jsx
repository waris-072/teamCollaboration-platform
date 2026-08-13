import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaProjectDiagram,
  FaUsers,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaBell,
  FaArrowRight,
  FaUserTie,
  FaCalendarAlt,
  FaChartLine,
  FaUserCheck,
  FaUserClock,
} from "react-icons/fa";

import { getManagerDashboard } from "../../services/dashboardService";
import Loader from "../../components/loader/Loader";
import useAuth from "../../hooks/useAuth";

import "./Manager-styling/ManagerDashboard.css";

function ManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [dashboardData, setDashboardData] = useState(null);

  // Role-based theme colors
  const theme = {
    primary: "#7c3aed",
    primaryLight: "#f5f3ff",
    primaryDark: "#6d28d9",
    iconBg: "var(--manager-primary-light)",
    iconColor: "var(--manager-primary)",
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setServerError("");
        const response = await getManagerDashboard();
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

  const getStatusColor = (status) => {
    const colors = {
      active: "#10b981",
      planning: "#f59e0b",
      completed: "#3b82f6",
      cancelled: "#ef4444",
      todo: "#f59e0b",
      "in-progress": "#2563eb",
      review: "#7c3aed",
    };
    return colors[status] || "#94a3b8";
  };

  const getStatusLabel = (status) => {
    if (!status) return "Active";
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return <Loader message="Loading dashboard..." />;
  }

  if (serverError || !dashboardData) {
    return (
      <div className="manager-dashboard-page">
        <div className="manager-dashboard-error">
          <FaExclamationTriangle className="error-icon" />
          <span>{serverError || "Unable to load dashboard"}</span>
        </div>
      </div>
    );
  }

  const { stats, projects, teamMembers, projectProgress, upcomingDeadlines, recentNotifications } = dashboardData;

  return (
    <div className="manager-dashboard-page">
      {/* Header */}
      <div className="manager-dashboard-header">
        <div className="manager-dashboard-title">
          <div className="manager-dashboard-icon">
            <FaChartLine />
          </div>
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {user?.name || "Manager"}! Here's your team's performance overview.</p>
          </div>
        </div>
        <div className="manager-dashboard-date">
          <span>{new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="manager-dashboard-stats">
        <div className="stat-card projects-card" onClick={() => navigate("/manager/projects")}>
          <div className="stat-card-icon projects">
            <FaProjectDiagram />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">My Projects</span>
            <strong className="stat-value">{stats.projects}</strong>
          </div>
        </div>

        <div className="stat-card members-card" onClick={() => navigate("/manager/members")}>
          <div className="stat-card-icon members">
            <FaUsers />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Team Members</span>
            <strong className="stat-value">{stats.members}</strong>
          </div>
        </div>

        <div className="stat-card tasks-card" onClick={() => navigate("/manager/tasks")}>
          <div className="stat-card-icon tasks">
            <FaTasks />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Total Tasks</span>
            <strong className="stat-value">{stats.totalTasks}</strong>
          </div>
        </div>

        <div className="stat-card completed-card">
          <div className="stat-card-icon completed">
            <FaCheckCircle />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Completed</span>
            <strong className="stat-value">{stats.completedTasks}</strong>
            <span className="stat-sub">
              {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% of tasks
            </span>
          </div>
        </div>

        <div className="stat-card pending-card" onClick={() => navigate("/manager/tasks")}>
          <div className="stat-card-icon pending">
            <FaClock />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Pending</span>
            <strong className="stat-value">{stats.pendingTasks}</strong>
            <div className="stat-breakdown">
              <span className="todo">{stats.todo} Todo</span>
              <span className="in-progress">{stats.inProgress} In Progress</span>
              <span className="review">{stats.review} Review</span>
            </div>
          </div>
        </div>

        <div className="stat-card overdue-card">
          <div className="stat-card-icon overdue">
            <FaExclamationTriangle />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Overdue</span>
            <strong className="stat-value">{stats.overdue}</strong>
            <span className="stat-sub danger">Needs immediate attention</span>
          </div>
        </div>
      </section>

      {/* Dashboard Grid */}
      <div className="manager-dashboard-grid">
        {/* Project Progress */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="card-header-left">
              <FaChartLine className="card-header-icon" style={{ color: theme.primary }} />
              <h3>Project Progress</h3>
            </div>
            <button
              type="button"
              className="card-view-all"
              style={{ color: theme.primary }}
              onClick={() => navigate("/manager/projects")}
            >
              View All <FaArrowRight />
            </button>
          </div>
          <div className="dashboard-card-body">
            {projectProgress.length === 0 ? (
              <div className="empty-state">
                <FaProjectDiagram />
                <p>No projects yet</p>
              </div>
            ) : (
              projectProgress.map((project) => (
                <div
                  key={project._id}
                  className="progress-item"
                  onClick={() => navigate(`/manager/projects/${project._id}`)}
                >
                  <div className="progress-item-header">
                    <span className="progress-item-title">{project.title}</span>
                    <span className="progress-item-status" style={{ color: getStatusColor(project.status) }}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                  <div className="progress-bar-wrapper">
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${project.progress}%`, background: theme.primary }}
                      />
                    </div>
                    <span className="progress-percentage">{project.progress}%</span>
                  </div>
                  <div className="progress-item-meta">
                    <span>{project.completedTasks} / {project.totalTasks} tasks completed</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="card-header-left">
              <FaCalendarAlt className="card-header-icon" style={{ color: theme.primary }} />
              <h3>Upcoming Deadlines</h3>
            </div>
            <button
              type="button"
              className="card-view-all"
              style={{ color: theme.primary }}
              onClick={() => navigate("/manager/tasks")}
            >
              View All <FaArrowRight />
            </button>
          </div>
          <div className="dashboard-card-body">
            {upcomingDeadlines.length === 0 ? (
              <div className="empty-state">
                <FaCalendarAlt />
                <p>No upcoming deadlines</p>
              </div>
            ) : (
              upcomingDeadlines.map((task) => {
                const daysRemaining = getDaysRemaining(task.dueDate);
                const isUrgent = daysRemaining !== null && daysRemaining <= 2;

                return (
                  <div
                    key={task._id}
                    className="deadline-item"
                    onClick={() => navigate(`/manager/tasks/${task._id}`)}
                  >
                    <div className={`deadline-item-dot ${isUrgent ? "urgent" : "normal"}`} />
                    <div className="deadline-item-content">
                      <span className="deadline-item-title">{task.title}</span>
                      <span className="deadline-item-project">
                        {task.project?.title || "No project"}
                      </span>
                    </div>
                    <div className="deadline-item-right">
                      <span className={`deadline-item-days ${isUrgent ? "urgent" : ""}`}>
                        {daysRemaining !== null ? (
                          daysRemaining <= 0 ? "Overdue" :
                          daysRemaining === 1 ? "1 day" :
                          `${daysRemaining} days`
                        ) : "No due date"}
                      </span>
                      <span className="deadline-item-assignee">
                        {task.assignedTo?.name || "Unassigned"}
                      </span>
                    </div>
                  </div>
                );
              })
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
              onClick={() => navigate("/manager/notifications")}
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

export default ManagerDashboard;