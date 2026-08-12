import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { 
  FaProjectDiagram, 
  FaCalendarAlt, 
  FaAlignLeft, 
  FaFlag, 
  FaUserTie, 
  FaUsers, 
  FaTimes, 
  FaSave,
  FaUser,
  FaEnvelope,
  FaCheckCircle,
  FaUserPlus,
} from "react-icons/fa";

import { getUsers } from "../../services/userService";
import Loader from "../../components/loader/Loader";

import "./project-styling/ProjectForm.css";

function ProjectForm({
    project = null,
    currentUser,
    onSubmit,
    onCancel,
    submitting = false,
}) {
    const isEditMode = Boolean(project);

    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [serverError, setServerError] = useState("");
    const role = currentUser?.role || "admin";

    const themeClass =
        role === "manager" ? "project-form-manager" : role === "member"
            ? "project-form-member" : "project-form-admin";

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isValid },
    } = useForm({
        mode: "onChange",
        defaultValues: {
            title: "",
            description: "",
            startDate: "",
            endDate: "",
            priority: "medium",
            manager: "",
        },
    });

    const selectedManager = watch("manager");
    const startDate = watch("startDate");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setUsersLoading(true);
                setServerError("");

                const data = await getUsers();
                setUsers(data.users || []);
            } catch (error) {
                setServerError(
                    error?.response?.data?.message ||
                    "Unable to load users."
                );
            } finally {
                setUsersLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const managers = useMemo(() => {
        return users.filter(
            (user) =>
                user.role === "manager" &&
                user.isActive
        );
    }, [users]);

    const members = useMemo(() => {
        return users.filter(
            (user) =>
                user.role === "member" &&
                user.isActive
        );
    }, [users]);

    useEffect(() => {
        if (!project) {
            reset({
                title: "",
                description: "",
                startDate: "",
                endDate: "",
                priority: "medium",
                manager: currentUser?.role === "manager" ? currentUser._id : "",
            });
            return;
        }

        reset({
            title: project.title || "",
            description: project.description || "",
            startDate: project.startDate
                ? formatDateForInput(project.startDate)
                : "",
            endDate: project.endDate ? formatDateForInput(project.endDate) : "",
            priority: project.priority || "medium",
            manager: project.manager?._id || project.manager || "",
            members: project.members?.map((member) =>
                typeof member === "object" ? member._id : member) || [],
        });
    }, [project, reset, currentUser]);

    function formatDateForInput(date) {
        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "";
        }

        return parsedDate.toISOString().split("T")[0];
    }

    const handleFormSubmit = async (formData) => {
        try {
            setServerError("");

            const payload = { ...formData, members: formData.members || [], };

            if (currentUser?.role === "manager" && !payload.manager){ 
                payload.manager = currentUser._id;
            }

            await onSubmit(payload);
        } catch (error) {
            setServerError(
                error?.response?.data?.message || "Failed to save project."
            );
        }
    };

    if (usersLoading) {
        return (
            <div className={`project-form ${themeClass}`}>
                <div className="project-form-loader">
                    <Loader />
                </div>
            </div>
        );
    }

    return (
        <div className={`project-form ${themeClass}`}>
            {/* Header */}
            <div className="project-form-header">
                <div className="project-form-title-wrapper">
                    <div className="project-form-icon">
                        <FaProjectDiagram />
                    </div>

                    <div>
                        <h2>
                            {isEditMode ? "Update Project" : "Create New Project"}
                        </h2>
                        <p>
                            {isEditMode 
                                ? "Update project information and team assignments." 
                                : "Fill in the details to create a new project."}
                        </p>
                    </div>
                </div>

                {onCancel && (
                    <button
                        type="button"
                        className="project-form-close"
                        onClick={onCancel}
                        aria-label="Close form"
                    >
                        <FaTimes />
                    </button>
                )}
            </div>

            {/* Form */}
            <form
                className="project-form-body"
                onSubmit={handleSubmit(handleFormSubmit)}
            >
                {/* Server Error */}
                {serverError && (
                    <div className="project-form-server-error">
                        <FaTimesCircle className="error-icon" />
                        <span>{serverError}</span>
                    </div>
                )}

                {/* Basic Information */}
                <div className="project-form-section">
                    {/* Title */}
                    <div className="project-form-group">
                        <label htmlFor="project-title">
                            Project Title <span>*</span>
                        </label>
                        <div className="project-input-wrapper">
                            <FaProjectDiagram />
                            <input
                                id="project-title"
                                type="text"
                                placeholder="Enter project title"
                                {...register("title", {
                                    required: "Project title is required",
                                    minLength: {
                                        value: 3,
                                        message: "Title must contain at least 3 characters.",
                                    },
                                    maxLength: {
                                        value: 100,
                                        message: "Title cannot exceed 100 characters.",
                                    },
                                })}
                            />
                        </div>
                        {errors.title && (
                            <small className="project-form-error">
                                {errors.title.message}
                            </small>
                        )}
                    </div>

                    {/* Description */}
                    <div className="project-form-group">
                        <label htmlFor="project-description">
                            Description <span>*</span>
                        </label>
                        <div className="project-textarea-wrapper">
                            <FaAlignLeft />
                            <textarea
                                id="project-description"
                                rows="5"
                                placeholder="Describe the project..."
                                {...register("description", {
                                    required: "Project description is required",
                                    maxLength: {
                                        value: 1000,
                                        message: "Description cannot exceed 1000 characters.",
                                    },
                                })}
                            />
                        </div>
                        {errors.description && (
                            <small className="project-form-error">
                                {errors.description.message}
                            </small>
                        )}
                    </div>
                </div>

                {/* Dates & Priority */}
                <div className="project-form-section">
                    <div className="project-form-grid three-columns">
                        {/* Start Date */}
                        <div className="project-form-group">
                            <label htmlFor="project-start-date">
                                Start Date <span>*</span>
                            </label>
                            <div className="project-input-wrapper">
                                <FaCalendarAlt />
                                <input
                                    id="project-start-date"
                                    type="date"
                                    {...register("startDate", {
                                        required: "Start date is required",
                                    })}
                                />
                            </div>
                            {errors.startDate && (
                                <small className="project-form-error">
                                    {errors.startDate.message}
                                </small>
                            )}
                        </div>

                        {/* End Date */}
                        <div className="project-form-group">
                            <label htmlFor="project-end-date">
                                End Date <span>*</span>
                            </label>
                            <div className="project-input-wrapper">
                                <FaCalendarAlt />
                                <input
                                    id="project-end-date"
                                    type="date"
                                    min={startDate || undefined}
                                    {...register("endDate", {
                                        required: "End date is required",
                                        validate: (value) => {
                                            if (startDate && value < startDate) {
                                                return "End date cannot be before start date.";
                                            }
                                            return true;
                                        },
                                    })}
                                />
                            </div>
                            {errors.endDate && (
                                <small className="project-form-error">
                                    {errors.endDate.message}
                                </small>
                            )}
                        </div>

                        {/* Priority */}
                        <div className="project-form-group">
                            <label htmlFor="project-priority">
                                Priority <span>*</span>
                            </label>
                            <div className="project-input-wrapper">
                                <FaFlag />
                                <select
                                    id="project-priority"
                                    {...register("priority", {
                                        required: "Priority is required",
                                    })}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Manager */}
                <div className="project-form-section">
                    <div className="project-form-group">
                        <label htmlFor="project-manager">
                            Manager <span>*</span>
                        </label>
                        <div className="project-input-wrapper">
                            <FaUserTie />
                            <select
                                id="project-manager"
                                disabled={currentUser?.role === "manager"}
                                {...register("manager", {
                                    required: "Project manager is required",
                                })}
                            >
                                <option value="">Select manager</option>
                                {managers.map((manager) => (
                                    <option key={manager._id} value={manager._id}>
                                        {manager.name} — {manager.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {currentUser?.role === "manager" && (
                            <small className="project-form-helper">
                                You can only manage projects assigned to you.
                            </small>
                        )}
                        {errors.manager && (
                            <small className="project-form-error">
                                {errors.manager.message}
                            </small>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="project-form-actions">
                    {onCancel && (
                        <button
                            type="button"
                            className="project-form-cancel"
                            onClick={onCancel}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        className="project-form-submit"
                        disabled={!isValid || submitting}
                    >
                        {submitting ? (
                            <>
                                <span className="project-form-spinner" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <FaSave />
                                {isEditMode ? "Update Project" : "Create Project"}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProjectForm;