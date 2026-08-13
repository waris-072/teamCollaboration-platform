import { useEffect, useState, useMemo, useRef } from "react";
import {
  FaUsers,
  FaSearch,
  FaFilter,
  FaTimes,
  FaUserCircle,
  FaEnvelope,
  FaProjectDiagram,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronRight,
  FaUser,
  FaCalendarAlt,
} from "react-icons/fa";

import { getProjects } from "../../services/projectService";
import { getTasks } from "../../services/taskService";
import Loader from "../../components/loader/Loader";
import useAuth from "../../hooks/useAuth";

import "./Manager-styling/ManagerMembers.css";

function ManagerMembers() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [teamData, setTeamData] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [expandedProjects, setExpandedProjects] = useState({});
  const [expandedMembers, setExpandedMembers] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

  // =====================================================
  // Fetch Data - Using getProjects() instead of getMyTeam()
  // =====================================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setServerError("");

      // Get projects (already filtered for manager by backend) and all tasks
      const [projectsResponse, tasksResponse] = await Promise.all([
        getProjects(),
        getTasks(),
      ]);

      const projects = projectsResponse?.projects || [];
      const tasks = tasksResponse?.tasks || [];

      // Add member details and tasks to each project
      const projectsWithMembers = projects.map((project) => ({
        ...project,
        members: project.members || [],
        tasks: tasks.filter((task) => {
          const projectId = task.project?._id || task.project;
          return projectId === project._id;
        }),
      }));

      setTeamData(projectsWithMembers);
      setAllTasks(tasks);

      // Auto-expand first project if there are any
      if (projectsWithMembers.length > 0) {
        setExpandedProjects({ [projectsWithMembers[0]._id]: true });
      }

    } catch (error) {
      console.error("❌ Fetch error:", error);
      setServerError(
        error?.response?.data?.message || "Unable to load team data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =====================================================
  // Search Handlers
  // =====================================================

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = () => {
    setSearchQuery(searchTerm);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // =====================================================
  // Toggle Functions
  // =====================================================

  const toggleProject = (projectId) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const toggleMember = (memberId) => {
    setExpandedMembers((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  // =====================================================
  // Filter Data
  // =====================================================

  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return teamData.filter((project) => {
      if (!normalizedSearch) return true;

      const matchesProject = project.title?.toLowerCase().includes(normalizedSearch);

      const matchesMember = project.members?.some((member) =>
        member.name?.toLowerCase().includes(normalizedSearch) ||
        member.email?.toLowerCase().includes(normalizedSearch)
      );

      const matchesTask = project.tasks?.some((task) =>
        task.title?.toLowerCase().includes(normalizedSearch)
      );

      return matchesProject || matchesMember || matchesTask;
    });
  }, [teamData, searchQuery]);

  // =====================================================
  // Helper Functions
  // =====================================================

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
      todo: "#f59e0b",
      "in-progress": "#2563eb",
      review: "#7c3aed",
      completed: "#4caf50",
    };
    return colors[status] || "#6b7280";
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
      high: "#dc2626",
      medium: "#f59e0b",
      low: "#2563eb",
    };
    return colors[priority] || "#6b7280";
  };

  const getPriorityLabel = (priority) => {
    if (!priority) return "Medium";
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

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

  const getTaskStats = (tasks) => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const todo = tasks.filter((t) => t.status === "todo").length;
    const review = tasks.filter((t) => t.status === "review").length;
    return { total, completed, inProgress, todo, review };
  };

  // =====================================================
  // Loading
  // =====================================================

  if (loading) {
    return <Loader message="Loading team data..." />;
  }

  // =====================================================
  // Stats
  // =====================================================

  const totalMembers = teamData.reduce((acc, p) => acc + (p.members?.length || 0), 0);
  const totalProjects = teamData.length;
  const totalTasks = allTasks.length;

  // =====================================================
  // Render
  // =====================================================

  return (
    <div className="manager-members-page">
      {/* Header */}
      <div className="manager-members-header">
        <div className="manager-members-title">
          <div className="manager-members-icon">
            <FaUsers />
          </div>
          <div>
            <h1>My Team</h1>
            <p>Manage your team members and their tasks across projects</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {serverError && (
        <div className="manager-members-error">
          <span>{serverError}</span>
          <button type="button" onClick={() => setServerError("")}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* Stats */}
      <section className="manager-members-stats">
        <div className="member-stat-card">
          <div className="member-stat-icon projects"><FaProjectDiagram /></div>
          <div>
            <span>Projects</span>
            <strong>{totalProjects}</strong>
          </div>
        </div>
        <div className="member-stat-card">
          <div className="member-stat-icon members"><FaUsers /></div>
          <div>
            <span>Team Members</span>
            <strong>{totalMembers}</strong>
          </div>
        </div>
        <div className="member-stat-card">
          <div className="member-stat-icon tasks"><FaTasks /></div>
          <div>
            <span>Total Tasks</span>
            <strong>{totalTasks}</strong>
          </div>
        </div>
      </section>

      {/* Search */}
      <div className="manager-members-toolbar">
        <div className="manager-members-search">
          <button
            type="button"
            onClick={handleSearchSubmit}
            aria-label="Search"
          >
            <FaSearch />
          </button>
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            placeholder="Search projects, members, or tasks..."
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>
        <div className="manager-members-results">
          <span>
            Showing <strong>{filteredProjects.length}</strong> of{" "}
            <strong>{teamData.length}</strong> projects
          </span>
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="manager-members-empty">
          <div className="manager-members-empty-icon">
            <FaUsers />
          </div>
          <h3>
            {teamData.length === 0
              ? "No projects or team members yet"
              : "No results found"}
          </h3>
          <p>
            {teamData.length === 0
              ? "Create projects and assign members to build your team."
              : "Try adjusting your search or filters."}
          </p>
          {searchQuery && (
            <button
              type="button"
              className="manager-members-empty-clear"
              onClick={clearSearch}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="manager-members-projects">
          {filteredProjects.map((project) => {
            const stats = getTaskStats(project.tasks || []);
            const isProjectExpanded = expandedProjects[project._id];

            return (
              <div key={project._id} className="manager-project-card">
                {/* Project Header */}
                <div
                  className="manager-project-header"
                  onClick={() => toggleProject(project._id)}
                >
                  <div className="manager-project-info">
                    <div className="manager-project-icon">
                      <FaProjectDiagram />
                    </div>
                    <div>
                      <h3>{project.title}</h3>
                      <div className="manager-project-meta">
                        <span>
                          <FaUsers />
                          {project.members?.length || 0} members
                        </span>
                        <span>
                          <FaTasks />
                          {stats.total} tasks
                        </span>
                        <span
                          className={`project-status project-status-${project.status}`}
                        >
                          {getStatusLabel(project.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="manager-project-toggle">
                    <span className="manager-task-stats">
                      <span className="stat-dot completed">
                        {stats.completed} done
                      </span>
                      <span className="stat-dot in-progress">
                        {stats.inProgress} in progress
                      </span>
                      <span className="stat-dot todo">
                        {stats.todo} todo
                      </span>
                    </span>
                    {isProjectExpanded ? <FaChevronDown /> : <FaChevronRight />}
                  </div>
                </div>

                {/* Project Content */}
                {isProjectExpanded && (
                  <div className="manager-project-content">
                    {/* Members Grid */}
                    <div className="manager-members-grid">
                      {project.members && project.members.length > 0 ? (
                        project.members.map((member) => {
                          const memberTasks = project.tasks?.filter(
                            (task) => task.assignedTo?._id === member._id || task.assignedTo === member._id
                          ) || [];
                          const isMemberExpanded = expandedMembers[member._id];
                          const memberStats = getTaskStats(memberTasks);

                          return (
                            <div key={member._id} className="manager-member-card">
                              <div
                                className="manager-member-header"
                                onClick={() => toggleMember(member._id)}
                              >
                                <div className="manager-member-info">
                                  <div className="manager-member-avatar">
                                    {getInitials(member.name)}
                                  </div>
                                  <div>
                                    <div className="manager-member-name">
                                      {member.name}
                                    </div>
                                    <div className="manager-member-email">
                                      <FaEnvelope />
                                      {member.email}
                                    </div>
                                  </div>
                                </div>
                                <div className="manager-member-stats">
                                  <span className="member-task-count">
                                    {memberTasks.length} tasks
                                  </span>
                                  <span className="member-completed-count">
                                    {memberStats.completed} done
                                  </span>
                                  {isMemberExpanded ? <FaChevronDown /> : <FaChevronRight />}
                                </div>
                              </div>

                              {/* Member Tasks */}
                              {isMemberExpanded && (
                                <div className="manager-member-tasks">
                                  {memberTasks.length === 0 ? (
                                    <div className="manager-member-no-tasks">
                                      <FaTasks />
                                      <span>No tasks assigned</span>
                                    </div>
                                  ) : (
                                    memberTasks.map((task) => (
                                      <div key={task._id} className="manager-member-task">
                                        <div className="manager-task-info">
                                          <div className="manager-task-title">
                                            {task.title}
                                          </div>
                                          <div className="manager-task-meta">
                                            <span
                                              className="task-status-badge"
                                              style={{
                                                background: getStatusColor(task.status) + "20",
                                                color: getStatusColor(task.status),
                                              }}
                                            >
                                              {getStatusLabel(task.status)}
                                            </span>
                                            <span
                                              className="task-priority-badge"
                                              style={{
                                                background: getPriorityColor(task.priority) + "20",
                                                color: getPriorityColor(task.priority),
                                              }}
                                            >
                                              {getPriorityLabel(task.priority)}
                                            </span>
                                            <span className="task-due-date">
                                              <FaCalendarAlt />
                                              {formatDate(task.dueDate)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="manager-no-members">
                          <FaUsers />
                          <span>No members assigned to this project</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ManagerMembers;