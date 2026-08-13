import { useEffect, useState } from "react";
import {
  FaTasks,
  FaTimes,
  FaSave,
  FaFolderOpen,
  FaUser,
  FaFlag,
  FaCalendarAlt,
  FaAlignLeft,
  FaExclamationTriangle,
} from "react-icons/fa";

import "./task-styling/TaskForm.css";

function TaskForm({
  task = null,
  projects = [],
  onSubmit,
  onClose,
  submitting = false,
}) {
  const isEditMode = Boolean(task);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project: "",
    assignedTo: "",
    priority: "medium",
    dueDate: "",
  });

  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState([]);

  // =====================================================
  // Populate form when editing
  // =====================================================

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        project: task.project?._id || task.project || "",
        assignedTo: task.assignedTo?._id || task.assignedTo || "",
        priority: task.priority || "medium",
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        project: "",
        assignedTo: "",
        priority: "medium",
        dueDate: "",
      });
    }
    setErrors({});
    setWarnings([]);
  }, [task]);

  // =====================================================
  // Selected project with members and details
  // =====================================================

  const selectedProject = projects.find(
    (project) => project._id === formData.project
  );

  const projectMembers = selectedProject?.members || [];

  // Get project end date (this is the deadline)
  const projectEndDate = selectedProject?.endDate
    ? new Date(selectedProject.endDate).toISOString().split("T")[0]
    : "";

  const projectStartDate = selectedProject?.startDate
    ? new Date(selectedProject.startDate).toISOString().split("T")[0]
    : "";

  // =====================================================
  // Today's date
  // =====================================================

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split("T")[0];

  // =====================================================
  // Calculate days until project deadline
  // =====================================================

  const getDaysUntilDeadline = () => {
    if (!projectEndDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(projectEndDate);
    deadline.setHours(0, 0, 0, 0);
    
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysUntilDeadline = getDaysUntilDeadline();

  // =====================================================
  // Handle input changes
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "project") {
      setFormData((prev) => ({
        ...prev,
        project: value,
        assignedTo: "",
        dueDate: "",
      }));
      setErrors((prev) => ({
        ...prev,
        project: "",
        assignedTo: "",
        dueDate: "",
      }));
      setWarnings([]);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
    
    // Clear warnings when due date changes
    if (name === "dueDate") {
      setWarnings([]);
    }
  };

  // =====================================================
  // Validation
  // =====================================================

  const validateForm = () => {
    const newErrors = {};
    const newWarnings = [];

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Task title is required.";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Task title must be at least 3 characters.";
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Task description is required.";
    }

    // Project validation
    if (!formData.project) {
      newErrors.project = "Please select a project.";
    }

    // Assigned member validation
    if (!formData.assignedTo) {
      newErrors.assignedTo = "Please select a member.";
    }

    // Due date validation
    if (!formData.dueDate) {
      newErrors.dueDate = "Please select a due date.";
    } else {
      const selectedDate = new Date(`${formData.dueDate}T00:00:00`);
      
      // Check if due date is in the past
      if (selectedDate < today) {
        newErrors.dueDate = "Due date cannot be in the past.";
      }

      // Check if due date exceeds project deadline
      if (projectEndDate) {
        const projectDate = new Date(`${projectEndDate}T00:00:00`);
        
        if (selectedDate > projectDate) {
          newErrors.dueDate = `Task due date (${formData.dueDate}) cannot be after project deadline (${projectEndDate}).`;
        }
        
        // Add warning if task due date is close to project deadline (within 3 days)
        if (selectedDate <= projectDate) {
          const diffTime = projectDate.getTime() - selectedDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 3 && diffDays >= 0) {
            newWarnings.push(
              `⚠️ Task is due in ${diffDays} day${diffDays !== 1 ? 's' : ''} before project deadline. Consider finishing earlier.`
            );
          }
        }
      }
    }

    setErrors(newErrors);
    setWarnings(newWarnings);
    
    return Object.keys(newErrors).length === 0;
  };

  // =====================================================
  // Submit
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        project: formData.project,
        assignedTo: formData.assignedTo,
        priority: formData.priority,
        dueDate: formData.dueDate,
      };

      await onSubmit(payload);
    } catch (error) {
      setErrors({
        submit: error?.response?.data?.message || "Unable to save task.",
      });
    }
  };

  // =====================================================
  // Render
  // =====================================================

  return (
    <div className="task-form">
      {/* Header */}
      <div className="task-form-header">
        <div className="task-form-title">
          <div className="task-form-icon">
            <FaTasks />
          </div>
          <div>
            <h2>{isEditMode ? "Update Task" : "Create New Task"}</h2>
            <p>
              {isEditMode
                ? "Update task details and assignment."
                : "Fill in the details to create a new task."}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            className="task-form-close"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close form"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Form */}
      <form className="task-form-body" onSubmit={handleSubmit}>
        {/* Server Error */}
        {errors.submit && (
          <div className="task-form-server-error">
            {errors.submit}
          </div>
        )}

        {/* Project Deadline Warning */}
        {selectedProject && projectEndDate && (
          <div className={`task-form-deadline-info ${daysUntilDeadline !== null && daysUntilDeadline <= 7 ? 'urgent' : ''}`}>
            <FaCalendarAlt />
            <div>
              <strong>Project Deadline:</strong>{" "}
              {new Date(projectEndDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {daysUntilDeadline !== null && (
                <span className="deadline-days">
                  {daysUntilDeadline < 0 ? (
                    <span className="overdue">⚠️ Project is overdue!</span>
                  ) : daysUntilDeadline === 0 ? (
                    <span className="urgent">⚠️ Project deadline is TODAY!</span>
                  ) : daysUntilDeadline <= 3 ? (
                    <span className="urgent">⚠️ Only {daysUntilDeadline} day{daysUntilDeadline !== 1 ? 's' : ''} remaining!</span>
                  ) : daysUntilDeadline <= 7 ? (
                    <span className="warning">📅 {daysUntilDeadline} days remaining</span>
                  ) : (
                    <span className="info">📅 {daysUntilDeadline} days remaining</span>
                  )}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="task-form-warnings">
            {warnings.map((warning, index) => (
              <div key={index} className="task-form-warning">
                <FaExclamationTriangle />
                <span>{warning}</span>
              </div>
            ))}
          </div>
        )}

        {/* Title */}
        <div className="task-form-group">
          <label htmlFor="task-title">
            Task Title <span>*</span>
          </label>
          <div className="task-input-wrapper">
            <FaTasks />
            <input
              id="task-title"
              type="text"
              name="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={handleChange}
              disabled={submitting}
              maxLength={100}
            />
          </div>
          {errors.title && (
            <small className="task-form-error">{errors.title}</small>
          )}
        </div>

        {/* Description */}
        <div className="task-form-group">
          <label htmlFor="task-description">
            Description <span>*</span>
          </label>
          <div className="task-textarea-wrapper">
            <FaAlignLeft />
            <textarea
              id="task-description"
              name="description"
              placeholder="Describe the task..."
              value={formData.description}
              onChange={handleChange}
              disabled={submitting}
              rows={5}
              maxLength={1000}
            />
          </div>
          <div className="task-form-character-count">
            {formData.description.length}/1000
          </div>
          {errors.description && (
            <small className="task-form-error">{errors.description}</small>
          )}
        </div>

        {/* Project & Assignee Grid */}
        <div className="task-form-grid two-columns">
          {/* Project */}
          <div className="task-form-group">
            <label htmlFor="task-project">
              Project <span>*</span>
            </label>
            <div className="task-input-wrapper">
              <FaFolderOpen />
              <select
                id="task-project"
                name="project"
                value={formData.project}
                onChange={handleChange}
                disabled={submitting || isEditMode}
              >
                <option value="">Select project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title} {project.endDate ? `(ends ${new Date(project.endDate).toLocaleDateString()})` : ''}
                  </option>
                ))}
              </select>
            </div>
            {isEditMode && (
              <small className="task-form-helper">
                Project cannot be changed while editing.
              </small>
            )}
            {errors.project && (
              <small className="task-form-error">{errors.project}</small>
            )}
          </div>

          {/* Assigned Member */}
          <div className="task-form-group">
            <label htmlFor="task-assignee">
              Assign To <span>*</span>
            </label>
            <div className="task-input-wrapper">
              <FaUser />
              <select
                id="task-assignee"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                disabled={submitting || !formData.project}
              >
                <option value="">
                  {!formData.project
                    ? "Select project first"
                    : "Select member"}
                </option>
                {projectMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} — {member.email}
                  </option>
                ))}
              </select>
            </div>
            {formData.project && projectMembers.length === 0 && (
              <small className="task-form-helper">
                No active members available for this project.
              </small>
            )}
            {errors.assignedTo && (
              <small className="task-form-error">{errors.assignedTo}</small>
            )}
          </div>
        </div>

        {/* Priority & Due Date Grid */}
        <div className="task-form-grid two-columns">
          {/* Priority */}
          <div className="task-form-group">
            <label htmlFor="task-priority">
              Priority <span>*</span>
            </label>
            <div className="task-input-wrapper">
              <FaFlag />
              <select
                id="task-priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={submitting}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div className="task-form-group">
            <label htmlFor="task-due-date">
              Due Date <span>*</span>
            </label>
            <div className="task-input-wrapper">
              <FaCalendarAlt />
              <input
                id="task-due-date"
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                disabled={submitting || !formData.project}
                min={todayString}
                max={projectEndDate || undefined}
              />
            </div>
            {!formData.project && (
              <small className="task-form-helper">
                Select a project first.
              </small>
            )}
            {projectEndDate && (
              <small className="task-form-helper task-form-deadline-helper">
                <strong>Project deadline:</strong>{" "}
                {new Date(projectEndDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
                {daysUntilDeadline !== null && daysUntilDeadline <= 7 && (
                  <span className="deadline-warning">
                    {" "}
                    ⚠️ {daysUntilDeadline} day{daysUntilDeadline !== 1 ? 's' : ''} remaining
                  </span>
                )}
              </small>
            )}
            {errors.dueDate && (
              <small className="task-form-error">{errors.dueDate}</small>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="task-form-actions">
          {onClose && (
            <button
              type="button"
              className="task-form-cancel"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="task-form-submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="task-form-spinner" />
                Saving...
              </>
            ) : (
              <>
                <FaSave />
                {isEditMode ? "Update Task" : "Create Task"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskForm;