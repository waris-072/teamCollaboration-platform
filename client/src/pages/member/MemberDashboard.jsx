import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaBell,
  FaArrowRight,
  FaProjectDiagram,
  FaCalendarAlt,
  FaChartLine,
  FaUser,
} from "react-icons/fa";

import { getMemberDashboard } from "../../services/dashboardService";
import Loader from "../../components/loader/Loader";
import useAuth from "../../hooks/useAuth";

import "./Member-styling/MemberDashboard.css";

function MemberDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [dashboardData, setDashboardData] = useState(null);

  // Role-based theme colors
  const theme = {
    primary: "#059669",
    primaryLight: "#ecfdf5",
    primaryDark: "#047857",
    iconBg: "var(--member-primary-light)",
    iconColor: "var(--member-primary)",
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setServerError("");
        const response = await getMemberDashboard();
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
      todo: "#f59e0b",
      "in-progress": "#2563eb",
      review: "#7c3aed",
      completed: "#4caf50",
    };
    return colors[status] || "#94a3b8";
  };

  const getStatusLabel = (status) => {
    if (!status) return "Todo";
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "#ef4444",
      medium: "#f59e0b",
      low: "#3b82f6",
    };
    return colors[priority] || "#94a3b8";
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
      <div className="member-dashboard-page">
        <div className="member-dashboard-error">
          <FaExclamationTriangle className="error-icon" />
          <span>{serverError || "Unable to load dashboard"}</span>
        </div>
      </div>
    );
  }

  const { stats, projects, tasks, upcomingDeadlines, recentNotifications } = dashboardData;

  return (
    <div className="member-dashboard-page">
      {/* Header */}
      <div className="member-dashboard-header">
        <div className="member-dashboard-title">
          <div className="member-dashboard-icon">
            <FaChartLine />
          </div>
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {user?.name || "Member"}! Here's your personal task overview.</p>
          </div>
        </div>
        <div className="member-dashboard-date">
          <span>{new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="member-dashboard-stats">
        <div className="stat-card total-card" onClick={() => navigate("/member/tasks")}>
          <div className="stat-card-icon total">
            <FaTasks />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">My Tasks</span>
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
              {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% done
            </span>
          </div>
        </div>

        <div className="stat-card pending-card" onClick={() => navigate("/member/tasks")}>
          <div className="stat-card-icon pending">
            <FaClock />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">In Progress</span>
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
            <span className="stat-sub danger">Needs attention</span>
          </div>
        </div>
      </section>

      {/* Dashboard Grid */}
      <div className="member-dashboard-grid">
        {/* Recent Tasks */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="card-header-left">
              <FaTasks className="card-header-icon" style={{ color: theme.primary }} />
              <h3>Recent Tasks</h3>
            </div>
            <button
              type="button"
              className="card-view-all"
              style={{ color: theme.primary }}
              onClick={() => navigate("/member/tasks")}
            >
              View All <FaArrowRight />
            </button>
          </div>
          <div className="dashboard-card-body">
            {tasks.length === 0 ? (
              <div className="empty-state">
                <FaTasks />
                <p>No tasks assigned yet</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task._id}
                  className="task-item"
                  onClick={() => navigate(`/member/tasks/${task._id}`)}
                >
                  <div className="task-item-left">
                    <span
                      className="task-item-status-dot"
                      style={{ backgroundColor: getStatusColor(task.status) }}
                    />
                    <div className="task-item-content">
                      <span className="task-item-title">{task.title}</span>
                      <span className="task-item-project">
                        {task.project?.title || "No project"}
                      </span>
                    </div>
                  </div>
                  <div className="task-item-right">
                    <span
                      className="task-item-priority"
                      style={{ color: getPriorityColor(task.priority) }}
                    >
                      {task.priority || "Medium"}
                    </span>
                    <span className="task-item-status">
                      {getStatusLabel(task.status)}
                    </span>
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
              onClick={() => navigate("/member/tasks")}
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
                    onClick={() => navigate(`/member/tasks/${task._id}`)}
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
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* My Projects */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="card-header-left">
              <FaProjectDiagram className="card-header-icon" style={{ color: theme.primary }} />
              <h3>My Projects</h3>
            </div>
            <button
              type="button"
              className="card-view-all"
              style={{ color: theme.primary }}
              onClick={() => navigate("/member/projects")}
            >
              View All <FaArrowRight />
            </button>
          </div>
          <div className="dashboard-card-body">
            {projects.length === 0 ? (
              <div className="empty-state">
                <FaProjectDiagram />
                <p>No projects assigned</p>
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project._id}
                  className="project-item"
                  onClick={() => navigate(`/member/projects/${project._id}`)}
                >
                  <div className="project-item-icon" style={{ background: theme.primaryLight, color: theme.primary }}>
                    <FaProjectDiagram />
                  </div>
                  <div className="project-item-content">
                    <span className="project-item-title">{project.title}</span>
                    <span className="project-item-manager">
                      Manager: {project.manager?.name || "Unassigned"}
                    </span>
                  </div>
                  <span
                    className="project-item-status"
                    style={{
                      backgroundColor: getStatusColor(project.status) + "20",
                      color: getStatusColor(project.status),
                    }}
                  >
                    {getStatusLabel(project.status)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="card-header-left">
              <FaBell className="card-header-icon" style={{ color: theme.primary }} />
              <h3>Recent Notifications</h3>
            </div>
            <button
              type="button"
              className="card-view-all"
              style={{ color: theme.primary }}
              onClick={() => navigate("/member/notifications")}
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

export default MemberDashboard;