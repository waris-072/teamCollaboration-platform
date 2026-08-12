// ProjectDetails.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaProjectDiagram,
  FaUserTie,
  FaUsers,
  FaCalendarAlt,
  FaFlag,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaExclamationCircle,
  FaEnvelope,
  FaCalendarPlus,
  FaCalendarCheck,
  FaUserCircle,
} from "react-icons/fa";

import useAuth from "../../hooks/useAuth";
import { getProjectById } from "../../services/projectService";
import Loader from "../loader/Loader";

import "./project-styling/ProjectDetails.css";

function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  
  const projectsPath =
  user?.role === "manager" ? "/manager/projects" : user?.role === "member"
    ? "/member/projects" : "/admin/projects";

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setServerError("");
        const data = await getProjectById(projectId);
        setProject(data.project);
      } catch (error) {
        setServerError(
          error?.response?.data?.message || "Unable to load project."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  const formatDate = (date) => {
    if (!date) return "Not specified";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "Not specified";
    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <FaCheckCircle />;
      case "planning":
        return <FaClock />;
      case "completed":
        return <FaCheckCircle />;
      case "cancelled":
        return <FaTimesCircle />;
      default:
        return <FaExclamationCircle />;
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return "Unknown";
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getPriorityLabel = (priority) => {
    if (!priority) return "Not specified";
    return priority.charAt(0).toUpperCase() + priority.slice(1);
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

  const getStatusConfig = (status) => {
    const configs = {
      active: { color: "#16a34a", bg: "#dcfce7", icon: <FaCheckCircle /> },
      planning: { color: "#f59e0b", bg: "#fef3c7", icon: <FaClock /> },
      completed: { color: "#2563eb", bg: "#dbeafe", icon: <FaCheckCircle /> },
      cancelled: { color: "#dc2626", bg: "#fee2e2", icon: <FaTimesCircle /> },
    };
    return configs[status] || configs.planning;
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      high: { color: "#dc2626", bg: "#fee2e2", label: "High" },
      medium: { color: "#d97706", bg: "#fef3c7", label: "Medium" },
      low: { color: "#2563eb", bg: "#dbeafe", label: "Low" },
    };
    return configs[priority] || configs.medium;
  };

  if (loading) {
    return <Loader message="Loading project details..." />;
  }

  if (serverError) {
    return (
      <div className="project-details-page">
        <div className="project-details-error">
          <div className="project-details-error-icon">
            <FaTimesCircle />
          </div>
          <h2>Unable to Load Project</h2>
          <p>{serverError}</p>
          <button type="button" onClick={() => navigate(projectsPath)}>
            <FaArrowLeft /> Back to Projects
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-details-page">
        <div className="project-details-error">
          <div className="project-details-error-icon">
            <FaExclamationCircle />
          </div>
          <h2>Project Not Found</h2>
          <p>The project you are looking for does not exist or is no longer available.</p>
          <button type="button" onClick={() => navigate(projectsPath)}>
            <FaArrowLeft /> Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const manager = project.manager;
  const members = project.members || [];
  const statusConfig = getStatusConfig(project.status);
  const priorityConfig = getPriorityConfig(project.priority);

  return (
    <div className="project-details-page">
      {/* Back Navigation */}
      <button
        type="button"
        className="project-details-back"
        onClick={() => navigate(projectsPath)}
      >
        <FaArrowLeft />
        <span>Back to Projects</span>
      </button>

      {/* Single Unified Card */}
      <div className="project-details-card">
        {/* Header with Project Name and Badges */}
        <div className="details-header">
          <div className="header-left">
            <div className="project-icon">
              <FaProjectDiagram />
            </div>
            <div className="project-title-group">
              <h1 className="project-title">{project.title}</h1>
              <div className="project-badges">
                <span 
                  className="badge status-badge"
                  style={{ 
                    background: statusConfig.bg, 
                    color: statusConfig.color 
                  }}
                >
                  <span className="badge-icon">{statusConfig.icon}</span>
                  {getStatusLabel(project.status)}
                </span>
                <span 
                  className="badge priority-badge"
                  style={{ 
                    background: priorityConfig.bg, 
                    color: priorityConfig.color 
                  }}
                >
                  <FaFlag className="badge-icon" />
                  {priorityConfig.label} Priority
                </span>
              </div>
            </div>
          </div>
          <div className="header-right">
            <div className="team-size-badge">
              <FaUsers />
              <span>{members.length} Members</span>
            </div>
          </div>
        </div>

        {/* Description - No Scroll */}
        <div className="details-description">
          <p>{project.description || "No description provided."}</p>
        </div>

        {/* Three Column Grid */}
        <div className="details-grid">
          {/* Column 1: Project Info */}
          <div className="details-column">
            <div className="column-header">
              <FaProjectDiagram className="column-icon" />
              <h3>Project Info</h3>
            </div>
            <div className="column-content">
              <div className="info-row">
                <span className="info-label">Project Name</span>
                <span className="info-value">{project.title}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Status</span>
                <span className="info-value">
                  <span 
                    className="inline-badge"
                    style={{ 
                      background: statusConfig.bg, 
                      color: statusConfig.color 
                    }}
                  >
                    {statusConfig.icon}
                    {getStatusLabel(project.status)}
                  </span>
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Priority</span>
                <span className="info-value">
                  <span 
                    className="inline-badge"
                    style={{ 
                      background: priorityConfig.bg, 
                      color: priorityConfig.color 
                    }}
                  >
                    <FaFlag />
                    {priorityConfig.label}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Timeline */}
          <div className="details-column">
            <div className="column-header">
              <FaCalendarAlt className="column-icon" />
              <h3>Timeline</h3>
            </div>
            <div className="column-content">
              <div className="timeline-item">
                <div className="timeline-dot start-dot"></div>
                <div className="timeline-info">
                  <span className="timeline-label">Start Date</span>
                  <span className="timeline-value">{formatDate(project.startDate)}</span>
                </div>
              </div>
              <div className="timeline-line"></div>
              <div className="timeline-item">
                <div className="timeline-dot end-dot"></div>
                <div className="timeline-info">
                  <span className="timeline-label">End Date</span>
                  <span className="timeline-value">{formatDate(project.endDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Manager */}
          <div className="details-column">
            <div className="column-header">
              <FaUserTie className="column-icon" />
              <h3>Project Manager</h3>
            </div>
            <div className="column-content">
              {manager ? (
                <div className="manager-card">
                  <div className="manager-avatar">
                    {getInitials(manager.name)}
                  </div>
                  <div className="manager-info">
                    <div className="manager-name">{manager.name || "Unnamed Manager"}</div>
                    {manager.email && (
                      <div className="manager-email">
                        <FaEnvelope />
                        {manager.email}
                      </div>
                    )}
                    <div className="manager-role">Project Manager</div>
                  </div>
                </div>
              ) : (
                <div className="empty-manager">
                  <FaUserCircle />
                  <span>No manager assigned</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="details-members">
          <div className="members-header">
            <div className="members-header-left">
              <FaUsers className="members-icon" />
              <h3>Team Members</h3>
              <span className="members-count">{members.length}</span>
            </div>
          </div>
          
          {members.length === 0 ? (
            <div className="empty-members">
              <FaUsers />
              <div>
                <strong>No members assigned</strong>
                <span>Assign team members to this project</span>
              </div>
            </div>
          ) : (
            <div className="members-grid">
              {members.map((member) => (
                <div className="member-card" key={member._id}>
                  <div className="member-avatar-small">
                    {getInitials(member.name)}
                  </div>
                  <div className="member-info">
                    <div className="member-name">{member.name || "Unnamed Member"}</div>
                    {member.email && (
                      <div className="member-email">
                        <FaEnvelope />
                        {member.email}
                      </div>
                    )}
                  </div>
                  <span className="member-role">Member</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectDetails;