// ManagerProjects.jsx

import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { FaSearch, FaFilter, FaTimes, FaFolderOpen, FaCheckCircle, FaClock, } from "react-icons/fa";

import { getProjects, updateProjectStatus, updateProjectMembers } from "../../services/projectService";

import ProjectCard from "../../components/project/ProjectCard";
import ProjectDetails from "../../components/project/ProjectDetails";
import Loader from "../../components/loader/Loader";

import "../../styles/ProjectList.css";

function ManagerProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const searchInputRef = useRef(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setServerError("");

      const data = await getProjects();

      setProjects(data.projects || []);
    } catch (error) {
      setServerError(
        error?.response?.data?.message || "Unable to load your projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const sortedProjects = useMemo(() => {
    const statusOrder = {
      active: 1,
      planning: 2,
      completed: 3,
      cancelled: 4,
    };

    return [...projects].sort(
      (a, b) =>
        (statusOrder[a.status] || 99) -
        (statusOrder[b.status] || 99)
    );
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return sortedProjects.filter((project) => {
      const matchesSearch = !normalizedSearch ||
        project.title?.toLowerCase().includes(normalizedSearch) ||
        project.description?.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" || project.priority === priorityFilter;

      return (matchesSearch && matchesStatus && matchesPriority);
    });
  }, [sortedProjects, searchQuery, statusFilter, priorityFilter,]);

  const stats = useMemo(() => {
    return {
      total: projects.length,

      active: projects.filter((project) => project.status === "active").length,
      planning: projects.filter((project) => project.status === "planning").length,
      completed: projects.filter((project) => project.status === "completed").length,
      cancelled: projects.filter((project) => project.status === "cancelled").length,
    };
  }, [projects]);

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

  const hasActiveFilters =
    searchQuery !== "" ||
    statusFilter !== "all" ||
    priorityFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleView = (project) => {
    navigate(`/manager/projects/${project._id}`);
  };

  const handleMembersChange = async (project, memberIds) => {
    try {
      const data = await updateProjectMembers(project._id, memberIds);
      setProjects((previousProjects) =>
        previousProjects.map((item) =>
          item._id === project._id
            ? data.project
            : item
        )
      );
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || "Failed to update project members."
      );
    }
  };

  const handleStatusChange = async (project, newStatus) => {
    if (!newStatus || newStatus === project.status) {
      return;
    }

    const confirmed = window.confirm(
      `Change "${project.title}" status from "${project.status}" to "${newStatus}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const data = await updateProjectStatus(project._id, newStatus);

      setProjects((previousProjects) =>
        previousProjects.map((item) =>
          item._id === project._id
            ? data.project
            : item
        )
      );
    } catch (error) {
      window.alert(
        error?.response?.data?.message || "Failed to update project status."
      );
    }
  };

  if (loading) {
    return <Loader message="Loading your projects..." />
  }

  return (
    <div className="admin-projects-page">

      {/* Header */}

      <div className="admin-projects-header">
        <div className="admin-projects-header-toolbar">

          {/* Search */}
          <div className="admin-projects-search">
            <button
              type="button"
              className="admin-projects-search-btn"
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
              onKeyDown={handleKeyPress}
              placeholder="Search your projects..."
              aria-label="Search projects"
            />

            {searchTerm && (
              <button
                type="button"
                className="admin-projects-search-clear"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}

          </div>

          {/* Filters */}

          <div className="admin-projects-filters">
            <div className="admin-projects-filter">
              <FaFilter />
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="all">All Statuses</option>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

            </div>

            <div className="admin-projects-filter">

              <select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(event.target.value)
                }
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="admin-projects-clear-filters"
                onClick={clearFilters}
                title="Clear filters"
              >
                <FaTimes />
                <span>Clear</span>
              </button>
            )}

            <div className="admin-projects-result-info">

              <span>
                Showing{" "}
                <strong>
                  {filteredProjects.length}
                </strong>{" "}
                of{" "}
                <strong>
                  {projects.length}
                </strong>{" "}
                projects
              </span>

              {hasActiveFilters && (
                <span className="admin-projects-filter-active">
                  Filters applied
                </span>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* Error */}

      {serverError && (
        <div className="admin-projects-error">

          <span>{serverError}</span>

          <button
            type="button"
            onClick={fetchProjects}
          >
            Retry
          </button>

        </div>
      )}

      {/* Statistics */}

      <section className="admin-projects-stats">

        <div className="project-stat-card">

          <div className="project-stat-icon total">
            <FaFolderOpen />
          </div>

          <div>
            <span>My Projects</span>
            <strong>{stats.total}</strong>
          </div>

        </div>

        <div className="project-stat-card">

          <div className="project-stat-icon active">
            <FaCheckCircle />
          </div>

          <div>
            <span>Active</span>
            <strong>{stats.active}</strong>
          </div>

        </div>

        <div className="project-stat-card">

          <div className="project-stat-icon planning">
            <FaClock />
          </div>

          <div>
            <span>Planning</span>
            <strong>{stats.planning}</strong>
          </div>

        </div>

        <div className="project-stat-card">

          <div className="project-stat-icon completed">
            <FaCheckCircle />
          </div>

          <div>
            <span>Completed</span>
            <strong>{stats.completed}</strong>
          </div>

        </div>

        <div className="project-stat-card">

          <div className="project-stat-icon cancelled">
            <FaTimes />
          </div>

          <div>
            <span>Cancelled</span>
            <strong>{stats.cancelled}</strong>
          </div>

        </div>

      </section>

      {/* Projects */}

      {filteredProjects.length === 0 ? (

        <div className="admin-projects-empty">

          <div className="admin-projects-empty-icon">
            <FaFolderOpen />
          </div>

          <h3>
            {projects.length === 0
              ? "No projects assigned"
              : "No projects found"}
          </h3>

          <p>
            {projects.length === 0
              ? "You don't have any projects assigned to you yet."
              : "Try changing your search or filters."}
          </p>

          {projects.length > 0 && (
            <button
              type="button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}

        </div>

      ) : (

        <section className="admin-projects-grid">

          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              showManagerActions
              onView={handleView}
              onStatusChange={handleStatusChange}
              onMembersChange={handleMembersChange}
            />
            
          ))}

        </section>

      )}

    </div>
  );
}

export default ManagerProjects;