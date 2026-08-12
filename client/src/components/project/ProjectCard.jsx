// ProjectCard.jsx (Updated with Members dropdown styling)
import {
  FaCalendarAlt,
  FaClock,
  FaEye,
  FaFolderOpen,
  FaPen,
  FaTrash,
  FaUserTie,
  FaUsers,
  FaEllipsisV,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

import { getAvailableMembers } from "../../services/projectService";

import { useState } from "react";
import "./project-styling/ProjectCard.css";

function ProjectCard({
  project,
  onView,
  onEdit,
  onStatusChange,
  onDelete,
  onMembersChange,
  showAdminActions = false,
  showManagerActions = false,
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showMembersMenu, setShowMembersMenu] = useState(false);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [originalMemberIds, setOriginalMemberIds] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersSaving, setMembersSaving] = useState(false);
  const [membersError, setMembersError] = useState("");

  const handleMembersToggle = async () => {
    if (showMembersMenu) {
      setShowMembersMenu(false);
      return;
    }

    setShowStatusMenu(false);
    setMembersError("");
    try {
      setMembersLoading(true);
      const data = await getAvailableMembers(project._id);
      const currentMemberIds = (project.members || []).map(
        (member) => typeof member === "string" ? member : member._id
      );

      setAvailableMembers(data.members || []);
      setSelectedMemberIds(currentMemberIds);
      setOriginalMemberIds(currentMemberIds);
      setShowMembersMenu(true);
    } catch (error) {
      setMembersError(
        error?.response?.data?.message || "Unable to load available members."
      );
    } finally {
      setMembersLoading(false);
    }
  };

  const handleMemberToggle = (memberId) => {
    setSelectedMemberIds((previousIds) => {
      if (previousIds.includes(memberId)) {
        return previousIds.filter(
          (id) => id !== memberId
        );
      }

      return [...previousIds, memberId];
    });
  };

  const hasMemberChanges =
    selectedMemberIds.length !== originalMemberIds.length ||
    selectedMemberIds.some((id) => !originalMemberIds.includes(id));

  const handleCancelMembers = () => {
    setSelectedMemberIds(originalMemberIds);
    setMembersError("");
    setShowMembersMenu(false);
  };

  const handleApplyMembers = async () => {
    if (!hasMemberChanges) {
      setShowMembersMenu(false);
      return;
    }

    try {
      setMembersSaving(true);
      setMembersError("");

      await onMembersChange?.(project, selectedMemberIds);
      setOriginalMemberIds(selectedMemberIds);
      setShowMembersMenu(false);
    } catch (error) {
      setMembersError(error?.message || "Failed to update project members.");
    } finally {
      setMembersSaving(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US",{
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusLabel = (status) => {
    if (!status) return "Planning";

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  const getPriorityLabel = (priority) => {
    if (!priority) return "Medium";

    return (
      priority.charAt(0).toUpperCase() +
      priority.slice(1)
    );
  };

  const managerName = project?.manager?.name || "Unassigned";
  const memberCount = project?.members?.length || 0;

  const handleStatusChange = (newStatus) => {
    onStatusChange?.(project, newStatus);
    setShowStatusMenu(false);
  };

  const statusOptions = [ "planning", "active", "completed", "cancelled", ];

  return (
    <article className="project-card">
      {/* Header */}
      <div className="project-card-header">
        <div className="project-card-title-wrapper">
          <div className="project-card-icon"><FaFolderOpen /></div>
          <div className="project-card-title-content">

            <h3>{project?.title || "Untitled Project"}</h3>
            <div className="status-priority-row">
              <span className={`badge badge-status badge-status-${project?.status || "planning"}`}
              >
                {getStatusLabel(project?.status)}
              </span>

              <span
                className={`badge badge-priority badge-priority-${project?.priority ||"medium"}`}
              >
                {getPriorityLabel(project?.priority)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="project-card-description">
        <p>
          {project?.description ? project.description : "No project description available."}
        </p>
      </div>


      {/* Project Information */}
      <div className="project-card-info">
        <div className="project-info-item">
          <FaUserTie />
          <div>
            <span className="project-info-label">Manager</span>
            <strong>{managerName}</strong>
          </div>
        </div>


        <div className="project-info-item">
          <FaUsers />
          <div>
            <span className="project-info-label">Members</span>
            <strong>{memberCount}</strong>
          </div>
        </div>
      </div>


      {/* Dates */}
      <div className="project-card-dates">
        <div className="project-date-item">
          <FaCalendarAlt />
          <div>
            <span>Start</span>
            <strong>{formatDate(project?.startDate)}</strong>

          </div>

        </div>


        <div className="project-date-item">
          <FaClock />
          <div>
            <span>End</span>
            <strong>{formatDate(project?.endDate)}</strong>
          </div>
        </div>
      </div>


      {/* Footer Actions */}
      <div className="project-card-footer">

        {/* View */}
        <button
          type="button"
          className="project-card-action project-card-view"
          onClick={() =>
            onView?.(project)
          }
          title="View project"
          aria-label="View project"
        >
          <FaEye />
          <span>View</span>
        </button>


        {/* Admin Edit */}
        {showAdminActions && (
          <button
            type="button"
            className="project-card-action project-card-edit"
            onClick={() =>
              onEdit?.(project)
            }
            title="Edit project"
            aria-label="Edit project"
          >
            <FaPen />
            <span>Edit</span>
          </button>
        )}


        {/* Admin Delete */}
        {showAdminActions && (
          <button
            type="button"
            className="project-card-action project-card-delete"
            onClick={() =>
              onDelete?.(project)
            }
            title="Delete project"
            aria-label="Delete project"
          >
            <FaTrash />
            <span>Delete</span>
          </button>
        )}


        {/* Status */}
        {(showAdminActions || showManagerActions) && (
          <div className="project-card-status-wrapper">

            <button
              type="button"
              className="project-card-action project-card-status-toggle"
              onClick={() =>
                setShowStatusMenu(
                  !showStatusMenu
                )
              }
              title="Change status"
              aria-label="Change status"
            >
              <span>Status</span>
              <FaEllipsisV />
            </button>


            {showStatusMenu && (
              <>
                <div
                  className="project-card-status-overlay"
                  onClick={() =>
                    setShowStatusMenu(false)
                  }
                />

                <div className="project-card-status-menu">
                  {statusOptions.map((status) => (
                      <button
                        key={status}
                        className={`project-card-status-option ${
                          project?.status === status ? "active" : ""
                        }`}
                        onClick={() => handleStatusChange(status)}
                      >

                        <span className={`status-dot status-${status}`} />

                        {getStatusLabel(status)}

                        {project?.status === status && (
                          <span className="status-check">✓</span>
                        )}
                      </button>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        )}


        {/* Manage Members - Updated styling to match Status dropdown */}
        {showManagerActions && (
          <div className="project-card-members-wrapper">
            <button
              type="button"
              className="project-card-action project-card-members-toggle"
              onClick={handleMembersToggle}
              title="Manage project members"
              aria-label="Manage project members"
            >
              <FaUsers />
              <span>Members</span>
              <FaEllipsisV />
            </button>

            {showMembersMenu && (
              <>
                {/* Overlay */}
                <div
                  className="project-card-members-overlay"
                  onClick={handleCancelMembers}
                />

                {/* Dropdown - Now styled like Status dropdown */}
                <div className="project-card-members-menu">

                  {/* Header */}
                  <div className="project-card-members-header">
                    <span className="project-card-members-title">Project Members</span>
                    <span className="project-card-members-count">
                      {selectedMemberIds.length} selected
                    </span>
                    <button
                      type="button"
                      className="project-card-members-close"
                      onClick={handleCancelMembers}
                      disabled={membersSaving}
                      aria-label="Close members menu"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {/* Error */}
                  {membersError && (
                    <div className="project-card-members-error">
                      {membersError}
                    </div>
                  )}

                  {/* Loading */}
                  {membersLoading ? (
                    <div className="project-card-members-loading">
                      Loading members...
                    </div>
                  ) : availableMembers.length === 0 ? (
                    <div className="project-card-members-empty">
                      No available members.
                    </div>
                  ) : (
                    <div className="project-card-members-list">
                      {availableMembers.map((member) => {
                        const memberId = member._id;
                        const isSelected = selectedMemberIds.includes(memberId);

                        return (
                          <label
                            key={memberId}
                            className={`project-card-member-option ${
                              isSelected ? "selected" : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={membersSaving}
                              onChange={() => handleMemberToggle(memberId)}
                            />
                            <span className="member-checkbox">
                              {isSelected && <FaCheck />}
                            </span>
                            <div className="member-option-info">
                              <strong>{member.name}</strong>
                              {member.email && (
                                <span>{member.email}</span>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="project-card-members-footer">
                    <button
                      type="button"
                      className="project-card-members-cancel"
                      onClick={handleCancelMembers}
                      disabled={membersSaving}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="project-card-members-apply"
                      onClick={handleApplyMembers}
                      disabled={membersSaving || membersLoading || !hasMemberChanges}
                    >
                      {membersSaving ? "Saving..." : "Apply Changes"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default ProjectCard;