import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    FaArrowLeft,
    FaTasks,
    FaUser,
    FaFolderOpen,
    FaCalendarAlt,
    FaFlag,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaExclamationCircle,
    FaEnvelope,
    FaUserCircle,
    FaCalendarCheck,
    FaCalendarPlus,
    FaInfoCircle,
    FaUserTie,
    FaComment,
    FaPaperPlane,
    FaTrash,
    FaPlus,
} from "react-icons/fa";

import useAuth from "../../hooks/useAuth";
import { getTaskById } from "../../services/taskService";
import Loader from "../loader/Loader";

import { getTaskComments, createTaskComment, deleteTaskComment, } from "../../services/taskCommentService";

import "./task-styling/TaskDetails.css";

function TaskDetails() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [serverError, setServerError] = useState("");


    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentMessage, setCommentMessage] = useState("");
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [commentError, setCommentError] = useState("");
    const [deletingCommentId, setDeletingCommentId] = useState(null);

    useEffect(() => {
        const fetchComments = async () => {
            if (!taskId) return;

            try {
                setCommentsLoading(true);
                setCommentError("");

                const data = await getTaskComments(taskId);

                setComments(data.comments || []);
            } catch (error) {
                setCommentError(
                    error?.response?.data?.message ||
                    "Unable to load comments."
                );
            } finally {
                setCommentsLoading(false);
            }
        };

        fetchComments();
    }, [taskId]);

    const handleAddComment = async (event) => {
        event.preventDefault();

        const message = commentMessage.trim();

        if (!message) {
            setCommentError("Comment cannot be empty.");
            return;
        }

        if (message.length > 1000) {
            setCommentError(
                "Comment cannot exceed 1000 characters."
            );
            return;
        }

        try {
            setCommentSubmitting(true);
            setCommentError("");

            const data = await createTaskComment(
                taskId,
                message
            );

            setComments((previous) => [
                ...previous,
                data.comment,
            ]);

            setCommentMessage("");
        } catch (error) {
            setCommentError(
                error?.response?.data?.message ||
                "Unable to add comment."
            );
        } finally {
            setCommentSubmitting(false);
        }
    };

    const canDeleteComment = (comment) => {
        if (!user || !comment?.author) {
            return false;
        }

        if (user.role === "admin") {
            return true;
        }

        if (
            comment.author._id?.toString() ===
            user._id?.toString()
        ) {
            return true;
        }

        if (user.role === "manager") {
            return comment.author.role === "member";
        }

        return false;
    };

    const handleDeleteComment = async (commentId) => {
        try {
            setDeletingCommentId(commentId);
            setCommentError("");

            await deleteTaskComment(commentId);

            setComments((previous) =>
                previous.filter(
                    (comment) => comment._id !== commentId
                )
            );
        } catch (error) {
            setCommentError(
                error?.response?.data?.message ||
                "Unable to delete comment."
            );
        } finally {
            setDeletingCommentId(null);
        }
    };


    const tasksPath =
        user?.role === "manager" ? "/manager/tasks" : user?.role === "member"
            ? "/member/tasks" : "/admin/tasks";

    useEffect(() => {
        const fetchTask = async () => {
            try {
                setLoading(true);
                setServerError("");
                const data = await getTaskById(taskId);
                setTask(data.task || data);
            } catch (error) {
                setServerError(
                    error?.response?.data?.message || "Unable to load task."
                );
            } finally {
                setLoading(false);
            }
        };
        fetchTask();
    }, [taskId]);

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
            case "completed":
                return <FaCheckCircle />;
            case "in-progress":
                return <FaClock />;
            case "review":
                return <FaClock />;
            case "todo":
                return <FaClock />;
            default:
                return <FaExclamationCircle />;
        }
    };

    const getStatusLabel = (status) => {
        if (!status) return "Todo";
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
            "todo": { color: "#f59e0b", bg: "#fef3c7", icon: <FaClock /> },
            "in-progress": { color: "#2563eb", bg: "#dbeafe", icon: <FaClock /> },
            "review": { color: "#7c3aed", bg: "#ede9fe", icon: <FaClock /> },
            "completed": { color: "#16a34a", bg: "#dcfce7", icon: <FaCheckCircle /> },
        };
        return configs[status] || configs["todo"];
    };

    const getPriorityConfig = (priority) => {
        const configs = {
            high: { color: "#dc2626", bg: "#fee2e2", label: "High" },
            medium: { color: "#d97706", bg: "#fef3c7", label: "Medium" },
            low: { color: "#2563eb", bg: "#dbeafe", label: "Low" },
        };
        return configs[priority] || configs.medium;
    };

    const isOverdue = () => {
        if (!task?.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dueDate < today && task.status !== "completed";
    };

    const getDaysRemaining = () => {
        if (!task?.dueDate) return null;
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getProjectDaysRemaining = () => {
        if (!task?.project?.endDate) return null;
        const endDate = new Date(task.project.endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const isProjectOverdue = () => {
        if (!task?.project?.endDate) return false;
        const endDate = new Date(task.project.endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return endDate < today;
    };

    const getProjectStatusConfig = (status) => {
        const configs = {
            active: { color: "#16a34a", bg: "#dcfce7", label: "Active" },
            planning: { color: "#f59e0b", bg: "#fef3c7", label: "Planning" },
            completed: { color: "#2563eb", bg: "#dbeafe", label: "Completed" },
            cancelled: { color: "#dc2626", bg: "#fee2e2", label: "Cancelled" },
        };
        return configs[status] || configs.planning;
    };

    if (loading) {
        return <Loader message="Loading task details..." />;
    }

    if (serverError) {
        return (
            <div className="task-details-page">
                <div className="task-details-error">
                    <div className="task-details-error-icon">
                        <FaTimesCircle />
                    </div>
                    <h2>Unable to Load Task</h2>
                    <p>{serverError}</p>
                    <button type="button" onClick={() => navigate(tasksPath)}>
                        <FaArrowLeft /> Back to Tasks
                    </button>
                </div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="task-details-page">
                <div className="task-details-error">
                    <div className="task-details-error-icon">
                        <FaExclamationCircle />
                    </div>
                    <h2>Task Not Found</h2>
                    <p>The task you are looking for does not exist or is no longer available.</p>
                    <button type="button" onClick={() => navigate(tasksPath)}>
                        <FaArrowLeft /> Back to Tasks
                    </button>
                </div>
            </div>
        );
    }

    const assignedTo = task.assignedTo;
    const project = task.project;
    const createdBy = task.createdBy;
    const statusConfig = getStatusConfig(task.status);
    const priorityConfig = getPriorityConfig(task.priority);
    const overdue = isOverdue();
    const daysRemaining = getDaysRemaining();

    const projectDaysRemaining = getProjectDaysRemaining();
    const projectOverdue = isProjectOverdue();
    const projectStatusConfig = project?.status ? getProjectStatusConfig(project.status) : null;

    return (
        <div className="task-details-page">
            {/* Back Navigation */}
            <button
                type="button"
                className="task-details-back"
                onClick={() => navigate(tasksPath)}
            >
                <FaArrowLeft />
                <span>Back to Tasks</span>
            </button>

            {/* Single Unified Card */}
            <div className="task-details-card">
                {/* Header with Task Name and Badges */}
                <div className="details-header">
                    <div className="header-left">
                        <div className="task-icon">
                            <FaTasks />
                        </div>
                        <div className="task-title-group">
                            <h1 className="task-title">{task.title}</h1>
                            <div className="task-badges">
                                <span
                                    className="badge status-badge"
                                    style={{
                                        background: statusConfig.bg,
                                        color: statusConfig.color
                                    }}
                                >
                                    <span className="badge-icon">{statusConfig.icon}</span>
                                    {getStatusLabel(task.status)}
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
                                {overdue && (
                                    <span className="badge overdue-badge">
                                        <FaTimesCircle className="badge-icon" />
                                        Overdue
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="header-right">
                        {daysRemaining !== null && !overdue && task.status !== "completed" && (
                            <div className="days-remaining-badge">
                                <FaCalendarAlt />
                                <span>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining</span>
                            </div>
                        )}
                        {overdue && task.status !== "completed" && (
                            <div className="days-remaining-badge overdue">
                                <FaTimesCircle />
                                <span>Overdue by {Math.abs(daysRemaining)} day{Math.abs(daysRemaining) !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="details-description">
                    <p>{task.description || "No description provided."}</p>
                </div>

                {/* Three Column Grid - Task Info, Timeline, Assigned To */}
                <div className="details-grid">
                    {/* Column 1: Task Info */}
                    <div className="details-column">
                        <div className="column-header">
                            <FaTasks className="column-icon" />
                            <h3>Task Info</h3>
                        </div>
                        <div className="column-content">
                            <div className="info-row">
                                <span className="info-label">Task Name</span>
                                <span className="info-value">{task.title}</span>
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
                                        {getStatusLabel(task.status)}
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
                                <div className="timeline-dot created-dot"></div>
                                <div className="timeline-info">
                                    <span className="timeline-label">Created</span>
                                    <span className="timeline-value">{formatDate(task.createdAt)}</span>
                                </div>
                            </div>
                            <div className="timeline-line"></div>
                            <div className="timeline-item">
                                <div className="timeline-dot due-dot" style={{
                                    background: overdue && task.status !== "completed" ? '#dc2626' : '#4caf50'
                                }}></div>
                                <div className="timeline-info">
                                    <span className="timeline-label">Due Date</span>
                                    <span className="timeline-value" style={{
                                        color: overdue && task.status !== "completed" ? '#dc2626' : 'inherit',
                                        fontWeight: overdue && task.status !== "completed" ? '600' : 'normal'
                                    }}>
                                        {formatDate(task.dueDate)}
                                        {overdue && task.status !== "completed" && (
                                            <span className="overdue-label"> (Overdue)</span>
                                        )}
                                    </span>
                                </div>
                            </div>
                            {task.completedAt && (
                                <>
                                    <div className="timeline-line"></div>
                                    <div className="timeline-item">
                                        <div className="timeline-dot completed-dot"></div>
                                        <div className="timeline-info">
                                            <span className="timeline-label">Completed</span>
                                            <span className="timeline-value">{formatDate(task.completedAt)}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Column 3: Assigned To */}
                    <div className="details-column">
                        <div className="column-header">
                            <FaUser className="column-icon" />
                            <h3>Assigned To</h3>
                        </div>
                        <div className="column-content">
                            {assignedTo ? (
                                <div className="assignee-card">
                                    <div className="assignee-avatar">
                                        {getInitials(assignedTo.name)}
                                    </div>
                                    <div className="assignee-info">
                                        <div className="assignee-name">{assignedTo.name || "Unnamed Member"}</div>
                                        {assignedTo.email && (
                                            <div className="assignee-email">
                                                <FaEnvelope />
                                                {assignedTo.email}
                                            </div>
                                        )}
                                        <div className="assignee-role">Team Member</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-assignee">
                                    <FaUserCircle />
                                    <span>No member assigned</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Two Column Layout: Project+Created By | Comments */}
                <div className="details-bottom-grid">
                    {/* Left Column: Project + Created By */}
                    <div className="details-bottom-left">
                        {/* Project */}
                        <div className="bottom-item project-item">
                            <div className="bottom-item-header">
                                <FaFolderOpen className="bottom-item-icon" />
                                <h4>Project</h4>
                            </div>
                            {project ? (
                                <div className="project-info-card">
                                    <div className="project-info-name">{project.title || "Unnamed Project"}</div>
                                    {project.status && (
                                        <div className="project-info-status">
                                            <span
                                                className="project-status-badge"
                                                style={{
                                                    background: projectStatusConfig?.bg || '#e5e7eb',
                                                    color: projectStatusConfig?.color || '#6b7280'
                                                }}
                                            >
                                                {projectStatusConfig?.icon} {projectStatusConfig?.label || getStatusLabel(project.status)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="project-timeline-info">
                                        {project.startDate && (
                                            <div className="project-date-item">
                                                <FaCalendarPlus className="project-date-icon" />
                                                <span>Started: {formatDate(project.startDate)}</span>
                                            </div>
                                        )}
                                        {project.endDate && (
                                            <div className="project-date-item">
                                                <FaCalendarCheck className="project-date-icon" />
                                                <span>
                                                    Deadline: {formatDate(project.endDate)}
                                                    {projectOverdue ? (
                                                        <span className="project-overdue-label"> (Overdue)</span>
                                                    ) : projectDaysRemaining !== null && projectDaysRemaining <= 7 ? (
                                                        <span className="project-deadline-warning"> ({projectDaysRemaining} days left)</span>
                                                    ) : projectDaysRemaining !== null ? (
                                                        <span className="project-deadline-info"> ({projectDaysRemaining} days left)</span>
                                                    ) : null}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-project">
                                    <FaFolderOpen />
                                    <span>No project associated</span>
                                </div>
                            )}
                        </div>

                        {/* Created By */}
                        <div className="bottom-item created-item">
                            <div className="bottom-item-header">
                                <FaUserTie className="bottom-item-icon" />
                                <h4>Created By</h4>
                            </div>
                            {createdBy ? (
                                <div className="created-by-card">
                                    <div className="created-by-avatar">
                                        {getInitials(createdBy.name)}
                                    </div>
                                    <div className="created-by-info">
                                        <div className="created-by-name">{createdBy.name || "Unknown"}</div>
                                        {createdBy.email && (
                                            <div className="created-by-email">
                                                <FaEnvelope />
                                                {createdBy.email}
                                            </div>
                                        )}
                                        <div className="created-by-role">
                                            {createdBy.role === "manager" ? "Project Manager" :
                                                createdBy.role === "admin" ? "Administrator" : "Team Member"}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-creator">
                                    <FaUserCircle />
                                    <span>Unknown creator</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Comments */}
                    <div className="details-bottom-right">
                        <div className="comments-wrapper">
                            <div className="comments-header">
                                <div className="comments-title">
                                    <FaComment />
                                    <h4>Comments</h4>
                                    <span>{comments.length}</span>
                                </div>
                            </div>

                            {/* Comments List */}
                            <div className="comments-list">
                                {commentsLoading ? (
                                    <div className="comments-loading">Loading comments...</div>
                                ) : comments.length === 0 ? (
                                    <div className="comments-empty">
                                        <FaComment />
                                        <p>No comments yet</p>
                                        <span>Be the first to comment</span>
                                    </div>
                                ) : (
                                    comments.map((comment) => {
                                        const author = comment.author;
                                        return (
                                            <div className="comment-item" key={comment._id}>
                                                <div 
                                                    className="comment-avatar"
                                                    data-role={author?.role || "member"}
                                                >
                                                    {getInitials(author?.name)}
                                                </div>
                                                <div className="comment-content">
                                                    <div className="comment-top">
                                                        <div>
                                                            <strong>{author?.name || "Unknown User"}</strong>
                                                            <span 
                                                                className="comment-role"
                                                                data-role={author?.role || "member"}
                                                            >
                                                                {author?.role === "manager" ? "Manager" :
                                                                 author?.role === "admin" ? "Admin" : "Member"}
                                                            </span>
                                                        </div>
                                                        {canDeleteComment(comment) && (
                                                            <button
                                                                type="button"
                                                                className="comment-delete"
                                                                onClick={() => handleDeleteComment(comment._id)}
                                                                disabled={deletingCommentId === comment._id}
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="comment-message">{comment.message}</p>
                                                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Comment Input with icon on right */}
                            <form className="comment-input-form" onSubmit={handleAddComment}>
                                <div className="comment-input-wrapper">
                                    <input
                                        type="text"
                                        value={commentMessage}
                                        onChange={(e) => {
                                            setCommentMessage(e.target.value);
                                            if (commentError) setCommentError("");
                                        }}
                                        placeholder="Write a comment..."
                                        maxLength={1000}
                                        disabled={commentSubmitting}
                                    />
                                    <button
                                        type="submit"
                                        className="comment-submit-btn"
                                        disabled={commentSubmitting || !commentMessage.trim()}
                                    >
                                        <FaPaperPlane />
                                    </button>
                                </div>
                                {commentError && <div className="comment-error">{commentError}</div>}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TaskDetails;