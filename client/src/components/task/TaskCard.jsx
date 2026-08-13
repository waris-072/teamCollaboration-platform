import {
  FaClipboardList,
  FaFolderOpen,
  FaUser,
  FaFlag,
  FaCalendarAlt,
  FaEye,
  FaEdit,
  FaTrash,
  FaExchangeAlt,
  FaEllipsisV,
  FaCheck,
  FaUserTie,
} from "react-icons/fa";

import { useState } from "react";
import "./task-styling/TaskCard.css";

function TaskCard({
  task,
  userRole,
  onView,
  onEdit,
  onStatusChange,
  onDelete,
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  if (!task) {
    return null;
  }

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPriorityClass = (priority) => {
    return `task-priority-${priority?.toLowerCase() || "medium"}`;
  };

  const getStatusClass = (status) => {
    return `task-status-${status?.toLowerCase() || "todo"}`;
  };

  const formatStatus = (status) => {
    if (!status) return "Todo";
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatPriority = (priority) => {
    if (!priority) return "Medium";
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const statusOptions = ["todo", "in-progress", "review", "completed"];

  const handleStatusChange = (newStatus) => {
    onStatusChange?.(task, newStatus);
    setShowStatusMenu(false);
  };

  return (
    <article className="task-card">
      {/* Header */}
      <div className="task-card-header">
        <div className="task-card-title-wrapper">
          <div className="task-card-icon">
            <FaClipboardList />
          </div>
          <div className="task-card-title-content">
            <h3 title={task.title}>{task.title}</h3>
            <div className="task-badges">
              <span className={`task-badge ${getStatusClass(task.status)}`}>
                {formatStatus(task.status)}
              </span>
              <span className={`task-badge ${getPriorityClass(task.priority)}`}>
                <FaFlag />
                {formatPriority(task.priority)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="task-card-description">
        <p>{task.description || "No description provided."}</p>
      </div>

      {/* Task Information */}
      <div className="task-card-info">
        <div className="task-info-item">
          <FaFolderOpen />
          <div>
            <span className="task-info-label">Project</span>
            <strong title={task.project?.title}>
              {task.project?.title || "N/A"}
            </strong>
          </div>
        </div>

        <div className="task-info-item">
          <FaUser />
          <div>
            <span className="task-info-label">Assigned To</span>
            <strong title={task.assignedTo?.name}>
              {task.assignedTo?.name || "Unassigned"}
            </strong>
          </div>
        </div>

        <div className="task-info-item">
          <FaCalendarAlt />
          <div>
            <span className="task-info-label">Due Date</span>
            <strong>{formatDate(task.dueDate)}</strong>
          </div>
        </div>

        <div className="task-info-item">
          <FaUserTie />
          <div>
            <span className="task-info-label">Created By</span>
            <strong title={task.createdBy?.name}>
              {task.createdBy?.name || "N/A"}
            </strong>
          </div>
        </div>
      </div>

      {/* Footer Actions - All in single row */}
      <div className="task-card-footer">
        <div className="task-card-actions">
          {/* View - Everyone */}
          <button
            type="button"
            className="task-card-action task-card-view"
            onClick={() => onView?.(task)}
            title="View task"
          >
            <FaEye />
            <span>View</span>
          </button>

          {/* Edit - Manager only */}
          {userRole === "manager" && (
            <button
              type="button"
              className="task-card-action task-card-edit"
              onClick={() => onEdit?.(task)}
              title="Edit task"
            >
              <FaEdit />
              <span>Edit</span>
            </button>
          )}

          {/* Status Change - ONLY Members can change status */}
          {userRole === "member" && (
            <div className="task-card-status-wrapper">
              <button
                type="button"
                className="task-card-status-toggle"
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                title="Change status"
              >
                <FaExchangeAlt />
                <span>Status</span>
                <FaEllipsisV />
              </button>

              {showStatusMenu && (
                <>
                  <div
                    className="task-card-status-overlay"
                    onClick={() => setShowStatusMenu(false)}
                  />
                  <div className="task-card-status-menu">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        className={`task-card-status-option ${
                          task?.status === status ? "active" : ""
                        }`}
                        onClick={() => handleStatusChange(status)}
                      >
                        <span className={`status-dot status-${status}`} />
                        {formatStatus(status)}
                        {task?.status === status && (
                          <span className="status-check">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Delete - Manager only */}
          {userRole === "manager" && (
            <button
              type="button"
              className="task-card-action task-card-delete"
              onClick={() => onDelete?.(task)}
              title="Delete task"
            >
              <FaTrash />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default TaskCard;