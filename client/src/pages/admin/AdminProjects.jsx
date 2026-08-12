// AdminProjects.jsx
import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaPlus, FaSearch, FaFilter, FaTimes, FaFolderOpen, FaCheckCircle, FaClock, FaTimesCircle 
} from "react-icons/fa";

import { createProject, getProjects, deleteProject, updateProjectStatus, updateProject } from "../../services/projectService";
import ProjectForm from "../../components/project/ProjectForm";
import useAuth from "../../hooks/useAuth";
import ProjectCard from "../../components/project/ProjectCard";
import Loader from "../../components/loader/Loader";
import Modal from "../../components/Modal/Modal";

import "../../styles/ProjectList.css";

function AdminProjects() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const searchInputRef = useRef(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setServerError("");

      const data = await getProjects();
      setProjects(data.projects || []);
    } catch (error) {
      setServerError(
        error?.response?.data?.message || "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async (projectData) => {
    try {
      setSubmitting(true);
      setServerError("");

      if (editingProject) {
        await updateProject(editingProject._id, projectData);
      } else {
        await createProject(projectData);
      }
      
      setShowForm(false);
      setEditingProject(null);
      await fetchProjects();
    } catch (error) {
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleCreateNew = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const sortedProjects = useMemo(() => {
    const statusOrder = { active: 1, planning: 2, completed: 3, cancelled: 4 };

    return [...projects].sort((a, b) =>
      (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99)
    );
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return sortedProjects.filter((project) => {
      const matchesSearch = !normalizedSearch ||
        project.title?.toLowerCase().includes(normalizedSearch) ||
        project.description?.toLowerCase().includes(normalizedSearch) ||
        project.manager?.name?.toLowerCase().includes(normalizedSearch);

      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || project.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [sortedProjects, searchQuery, statusFilter, priorityFilter]);

  const stats = useMemo(() => {
    return {
      total: projects.length,
      active: projects.filter((project) => project.status === "active").length,
      planning: projects.filter((project) => project.status === "planning").length,
      completed: projects.filter((project) => project.status === "completed").length,
      cancelled: projects.filter((project) => project.status === "cancelled").length,
    };
  }, [projects]);

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || priorityFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = () => {
    setSearchQuery(searchTerm);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
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

  const handleView = (project) => {
    navigate(`/admin/projects/${project._id}`);
  };

  const handleStatusChange = async (project, newStatus) => {
    if (!newStatus || newStatus === project.status) return;

    const confirmed = window.confirm(
      `Change "${project.title}" status from "${project.status}" to "${newStatus}"?`
    );

    if (!confirmed) return;

    try {
      const data = await updateProjectStatus(project._id, newStatus);
      setProjects((previousProjects) =>
        previousProjects.map((item) =>
          item._id === project._id ? data.project : item
        )
      );
    } catch (error) {
      window.alert(
        error?.response?.data?.message || "Failed to update project status."
      );
    }
  };

  const handleDelete = async (project) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.title}"? This will also delete its tasks and task comments.`
    );

    if (!confirmed) return;

    try {
      await deleteProject(project._id);
      setProjects((previousProjects) =>
        previousProjects.filter((item) => item._id !== project._id)
      );
    } catch (error) {
      window.alert(
        error?.response?.data?.message || "Failed to delete project."
      );
    }
  };

  if (loading) {
    return <Loader message="Loading all Projects..." />;
  }

  return (
    <div className="admin-projects-page">

      {/* Header with Search & Filters */}
      <div className="admin-projects-header">
        <div className="admin-projects-header-toolbar">
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
              onKeyPress={handleKeyPress}
              placeholder="Search projects, descriptions or managers..."
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

          <div className="admin-projects-filters">
            <div className="admin-projects-filter">
              <FaFilter />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
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
                onChange={(event) => setPriorityFilter(event.target.value)}
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
              Showing <strong>{filteredProjects.length}</strong> of{" "}
              <strong>{projects.length}</strong> projects
            </span>
            {hasActiveFilters && (
              <span className="admin-projects-filter-active">
                Filters applied
              </span>
            )}
          </div>

            {/* Create Project Button - Inline with filters */}
            <button
              type="button"
              className="admin-projects-create-inline"
              onClick={handleCreateNew}
            >
              <FaPlus />
              Create Project
            </button>
          </div>

          {/* Mobile Create Button */}
          <button
            type="button"
            className="admin-projects-create-mobile"
            onClick={handleCreateNew}
          >
            <FaPlus />
            <span>Create Project</span>
          </button>
        </div>
      </div>

      {serverError && (
        <div className="admin-projects-error">
          <span>{serverError}</span>
          <button onClick={() => setServerError("")}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* Statistics */}
      <section className="admin-projects-stats">
        <div className="project-stat-card">
          <div className="project-stat-icon total"><FaFolderOpen /></div>
          <div>
            <span>Total Projects</span>
            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="project-stat-card">
          <div className="project-stat-icon active"><FaCheckCircle /></div>
          <div>
            <span>Active</span>
            <strong>{stats.active}</strong>
          </div>
        </div>

        <div className="project-stat-card">
          <div className="project-stat-icon planning"><FaClock /></div>
          <div>
            <span>Planning</span>
            <strong>{stats.planning}</strong>
          </div>
        </div>

        <div className="project-stat-card">
          <div className="project-stat-icon completed"><FaCheckCircle /></div>
          <div>
            <span>Completed</span>
            <strong>{stats.completed}</strong>
          </div>
        </div>

        <div className="project-stat-card">
          <div className="project-stat-icon cancelled"><FaTimes/></div>
          <div>
            <span>Cancelled</span>
            <strong>{stats.cancelled}</strong>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="admin-projects-empty">
          <div className="admin-projects-empty-icon">
            <FaFolderOpen />
          </div>
          <h3>
            {projects.length === 0 ? "No projects yet" : "No projects found"}
          </h3>
          <p>
            {projects.length === 0
              ? "Create your first project to get started."
              : "Try changing your search or filters."}
          </p>
          {projects.length === 0 ? (
            <button type="button" onClick={handleCreateNew}>
              <FaPlus />
              Create Project
            </button>
          ) : (
            <button type="button" onClick={clearFilters}>
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
              showAdminActions
              onView={handleView}
              onEdit={handleEdit}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </section>
      )}

      {/* Modal for Create/Edit Project */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseModal}
        title={editingProject ? "Update Project" : "Create New Project"}
        size="lg"
      >
        <ProjectForm
          project={editingProject}
          currentUser={user}
          onSubmit={handleSaveProject}
          onCancel={handleCloseModal}
          submitting={submitting}
        />
      </Modal>
    </div>
  );
}

export default AdminProjects;