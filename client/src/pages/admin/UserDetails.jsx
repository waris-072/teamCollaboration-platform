import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaUserShield,
  FaCalendarAlt,
  FaClock,
  FaBriefcase,
  FaTasks,
  FaUsers,
  FaUserTie,
  FaFolderOpen,
  FaCheckCircle,
  FaTimesCircle,
  FaIdBadge,
  FaProjectDiagram,
  FaClipboardList,
  FaUserFriends,
} from "react-icons/fa";

import { getUserById } from "../../services/userService";
import Loader from "../../components/loader/Loader"; // Import existing Loader

import "./Admin-styling/UserDetails.css";

function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getUserById(userId);
        setUser(data.user);
      } catch (error) {
        setError(
          error?.response?.data?.message ||
            "Unable to load user details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchRelatedData = async () => {
      try {
        setRelatedLoading(true);
        setProjects([]);
        setTasks([]);
        setTeamMembers([]);
      } catch (error) {
        console.error(
          "Failed to load related user information:",
          error
        );
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchRelatedData();
  }, [user]);

  const formatDate = (date) => {
    if (!date) {
      return "Never";
    }
    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "Never";
    }
    return new Date(date).toLocaleString(
      "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  const getInitial = () => {
    return (
      user?.name?.charAt(0)?.toUpperCase() ||
      "U"
    );
  };

  const getRoleLabel = () => {
    if (!user?.role) {
      return "Unknown";
    }
    return (
      user.role.charAt(0).toUpperCase() +
      user.role.slice(1)
    );
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case "admin":
        return <FaUserShield />;
      case "manager":
        return <FaUserTie />;
      case "member":
        return <FaUser />;
      default:
        return <FaUser />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': '#10b981',
      'completed': '#3b82f6',
      'pending': '#f59e0b',
      'inactive': '#ef4444',
      'in progress': '#8b5cf6'
    };
    return colors[status?.toLowerCase()] || '#94a3b8';
  };

  if (loading) {
    return (
      <div className="admin-users-page">
        <Loader />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="admin-users-page">
        <div className="admin-users-error">
          <FaTimesCircle className="error-icon" />
          {error || "User not found."}
        </div>
        <button
          type="button"
          className="admin-user-back-button"
          onClick={() => navigate("/admin/users")}
        >
          <FaArrowLeft />
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="admin-users-page">

      {/* Back Button */}
      <button
        type="button"
        className="admin-user-back-button"
        onClick={() => navigate("/admin/users")}
      >
        <FaArrowLeft />
        Back to Users
      </button>

      {/* Combined Profile & Header Card */}
      <section className="admin-user-profile-card">
        <div className="profile-card-content">
          {/* Avatar */}
          <div className="admin-user-details-avatar">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
              />
            ) : (
              <span className="avatar-initial">{getInitial()}</span>
            )}
          </div>

          {/* User Info */}
          <div className="admin-user-details-main">
            <div className="user-name-section">
              <h2>{user.name}</h2>
              <span className={`role-badge role-${user.role}`}>
                {getRoleIcon()}
                {getRoleLabel()}
              </span>
            </div>

            <p className="user-email">
              <FaEnvelope />
              {user.email}
            </p>

            <div className="admin-user-details-badges">
              <span
                className={
                  user.isActive
                    ? "status-badge active"
                    : "status-badge inactive"
                }
              >
                {user.isActive ? (
                  <>
                    <FaCheckCircle />
                    Active
                  </>
                ) : (
                  <>
                    <FaTimesCircle />
                    Inactive
                  </>
                )}
              </span>
              <span className="user-id-badge">
                <FaIdBadge />
                ID: {user._id?.slice(-8) || "N/A"}
              </span>
            </div>

            {/* Account Activity Info */}
            <div className="account-activity-mini">
              <div className="activity-item">
                <FaCalendarAlt className="activity-icon" />
                <span>Joined: {formatDate(user.createdAt)}</span>
              </div>
              <div className="activity-divider"></div>
              <div className="activity-item">
                <FaClock className="activity-icon" />
                <span>Last Login: {formatDateTime(user.lastLogin)}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-item">
              <FaProjectDiagram className="stat-icon" />
              <div>
                <span className="stat-value">{projects.length || 0}</span>
                <span className="stat-label">Projects</span>
              </div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <FaClipboardList className="stat-icon" />
              <div>
                <span className="stat-value">{tasks.length || 0}</span>
                <span className="stat-label">Tasks</span>
              </div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <FaUserFriends className="stat-icon" />
              <div>
                <span className="stat-value">{teamMembers.length || 0}</span>
                <span className="stat-label">Team</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        
        {/* Manager/Team Card (for member) */}
        {user.role === "member" && (
          <div className="dashboard-card team-card">
            <div className="dashboard-card-header">
              <div className="card-header-icon">
                <FaUserTie />
              </div>
              <div>
                <h3>Manager</h3>
              </div>
            </div>
            <div className="dashboard-card-body scrollable-content">
              {relatedLoading ? (
                <div className="loading-placeholder">Loading...</div>
              ) : teamMembers.length === 0 ? (
                <div className="empty-state-small">
                  <FaUserTie className="empty-icon-small" />
                  <p>No manager assigned</p>
                </div>
              ) : (
                <div className="scrollable-items">
                  {teamMembers.map((member) => (
                    <div key={member._id} className="scrollable-item">
                      <div className="item-avatar-small">
                        {member.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="item-details">
                        <span className="item-name">{member.name}</span>
                        <span className="item-sub">{member.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects Card */}
        <div className="dashboard-card projects-card">
          <div className="dashboard-card-header">
            <div className="card-header-icon">
              <FaBriefcase />
            </div>
            <div>
              <h3>Projects</h3>
              <span className="item-count">{projects.length}</span>
            </div>
          </div>
          <div className="dashboard-card-body scrollable-content">
            {relatedLoading ? (
              <div className="loading-placeholder">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="empty-state-small">
                <FaFolderOpen className="empty-icon-small" />
                <p>No projects</p>
              </div>
            ) : (
              <div className="scrollable-items">
                {projects.map((project) => (
                  <div key={project._id} className="scrollable-item">
                    <div className="item-details">
                      <span className="item-name">{project.title}</span>
                      <span 
                        className="item-status"
                        style={{ backgroundColor: getStatusColor(project.status) }}
                      >
                        {project.status || "Active"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tasks Card */}
        <div className="dashboard-card tasks-card">
          <div className="dashboard-card-header">
            <div className="card-header-icon">
              <FaTasks />
            </div>
            <div>
              <h3>Tasks</h3>
              <span className="item-count">{tasks.length}</span>
            </div>
          </div>
          <div className="dashboard-card-body scrollable-content">
            {relatedLoading ? (
              <div className="loading-placeholder">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="empty-state-small">
                <FaTasks className="empty-icon-small" />
                <p>No tasks</p>
              </div>
            ) : (
              <div className="scrollable-items">
                {tasks.map((task) => (
                  <div key={task._id} className="scrollable-item">
                    <div className="item-details">
                      <span className="item-name">{task.title}</span>
                      <span 
                        className="item-status"
                        style={{ backgroundColor: getStatusColor(task.status) }}
                      >
                        {task.status || "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Team Card (for manager) */}
        {user.role === "manager" && (
          <div className="dashboard-card team-card">
            <div className="dashboard-card-header">
              <div className="card-header-icon">
                <FaUsers />
              </div>
              <div>
                <h3>Team Members</h3>
                <span className="item-count">{teamMembers.length}</span>
              </div>
            </div>
            <div className="dashboard-card-body scrollable-content">
              {relatedLoading ? (
                <div className="loading-placeholder">Loading team...</div>
              ) : teamMembers.length === 0 ? (
                <div className="empty-state-small">
                  <FaUsers className="empty-icon-small" />
                  <p>No team members</p>
                </div>
              ) : (
                <div className="scrollable-items">
                  {teamMembers.map((member) => (
                    <div key={member._id} className="scrollable-item">
                      <div className="item-avatar-small">
                        {member.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="item-details">
                        <span className="item-name">{member.name}</span>
                        <span className="item-sub">{member.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Admin Info Card */}
        {user.role === "admin" && (
          <div className="dashboard-card admin-info-card">
            <div className="dashboard-card-header">
              <div className="card-header-icon admin-icon">
                <FaUserShield />
              </div>
              <div>
                <h3>Administrator</h3>
              </div>
            </div>
            <div className="dashboard-card-body">
              <div className="admin-privileges">
                <FaUserShield className="admin-privilege-icon" />
                <p>System administrator with full access to manage users, projects, and tasks across the workspace.</p>
                <div className="privilege-badges">
                  <span className="privilege-badge">User Management</span>
                  <span className="privilege-badge">Project Management</span>
                  <span className="privilege-badge">Task Management</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default UserDetails;