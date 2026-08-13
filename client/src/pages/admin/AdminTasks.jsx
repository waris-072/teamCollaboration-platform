import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaClipboardList,
  FaSearch,
  FaFilter,
  FaTimes,
  FaUserTie,
} from "react-icons/fa";

import {
  getTasks,
} from "../../services/taskService";

import { getProjects } from "../../services/projectService";

import TaskCard from "../../components/task/TaskCard";
import Loader from "../../components/loader/Loader";

import useAuth from "../../hooks/useAuth";

import "./Admin-styling/AdminTasks.css";

function AdminTasks() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allTasks, setAllTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [managerFilter, setManagerFilter] = useState("all");

  const searchInputRef = useRef(null);

  // =====================================================
  // Fetch Tasks + Projects
  // =====================================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setServerError("");

      const [tasksResponse, projectsResponse] = await Promise.all([
        getTasks(),
        getProjects(),
      ]);

      const projectsWithMembers = (projectsResponse?.projects || []).map(project => ({
        ...project,
        members: project.members || []
      }));

      const allTasksData = tasksResponse?.tasks || [];
      
      console.log("All Tasks Data:", allTasksData); // Debug: Check task data
      console.log("Projects Data:", projectsWithMembers); // Debug: Check project data
      
      setAllTasks(allTasksData);
      setProjects(projectsWithMembers);
    } catch (error) {
      setServerError(
        error?.response?.data?.message || "Unable to load tasks."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =====================================================
  // Get unique managers from tasks and projects
  // =====================================================

  const managerOptions = useMemo(() => {
    const managers = new Map();
    
    // First, try to get managers from tasks
    allTasks.forEach(task => {
      // Check if task has project with manager
      if (task.project) {
        // If project is an object with manager
        if (task.project.manager) {
          const managerId = task.project.manager._id || task.project.manager;
          const managerName = task.project.manager.name || "Unknown Manager";
          if (!managers.has(managerId)) {
            managers.set(managerId, {
              id: managerId,
              name: managerName
            });
          }
        }
      }
    });

    // Also get managers from projects
    projects.forEach(project => {
      if (project.manager) {
        const managerId = project.manager._id || project.manager;
        const managerName = project.manager.name || "Unknown Manager";
        if (!managers.has(managerId)) {
          managers.set(managerId, {
            id: managerId,
            name: managerName
          });
        }
      }
    });

    return Array.from(managers.values());
  }, [allTasks, projects]);

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
  // Filtering
  // =====================================================

  const filteredTasks = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return allTasks.filter((task) => {
      // Search by title, description, project title, assigned member
      const matchesSearch =
        !normalizedSearch ||
        task.title?.toLowerCase().includes(normalizedSearch) ||
        task.description?.toLowerCase().includes(normalizedSearch) ||
        task.project?.title?.toLowerCase().includes(normalizedSearch) ||
        task.assignedTo?.name?.toLowerCase().includes(normalizedSearch);

      // Filter by status
      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      // Filter by priority
      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      // Filter by manager - Check both task.project.manager and project data
      let matchesManager = true;
      if (managerFilter !== "all") {
        // Try to get manager from task
        let taskManagerId = null;
        
        if (task.project?.manager) {
          taskManagerId = task.project.manager._id || task.project.manager;
        }
        
        // If task doesn't have manager info, try to find it from projects
        if (!taskManagerId && task.project?._id) {
          const project = projects.find(p => p._id === task.project._id);
          if (project?.manager) {
            taskManagerId = project.manager._id || project.manager;
          }
        }
        
        matchesManager = taskManagerId === managerFilter;
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesManager;
    });
  }, [allTasks, searchQuery, statusFilter, priorityFilter, managerFilter, projects]);

  const hasActiveFilters =
    searchQuery !== "" ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    managerFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setManagerFilter("all");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // =====================================================
  // Stats
  // =====================================================

  const stats = useMemo(() => {
    return {
      total: allTasks.length,
      todo: allTasks.filter((task) => task.status === "todo").length,
      inProgress: allTasks.filter((task) => task.status === "in-progress").length,
      review: allTasks.filter((task) => task.status === "review").length,
      completed: allTasks.filter((task) => task.status === "completed").length,
    };
  }, [allTasks]);

  // =====================================================
  // Task Actions
  // =====================================================

  const handleView = (task) => {
    navigate(`/admin/tasks/${task._id}`);
  };

  // =====================================================
  // Helper Functions
  // =====================================================

  const formatStatus = (status) => {
    if (!status) return "Todo";
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // =====================================================
  // Loading
  // =====================================================

  if (loading) {
    return <Loader message="Loading all tasks..." />;
  }

  // =====================================================
  // Render
  // =====================================================

  return (
    <div className="admin-tasks-page">
      {/* Error Banner */}
      {serverError && (
        <div className="admin-tasks-error">
          <span>{serverError}</span>
          <button type="button" onClick={() => setServerError("")}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* Stats Section */}
      <section className="admin-tasks-stats">
        <div className="task-stat-card">
          <div className="task-stat-icon total"><FaClipboardList /></div>
          <div>
            <span>Total Tasks</span>
            <strong>{stats.total}</strong>
          </div>
        </div>
        <div className="task-stat-card">
          <div className="task-stat-icon todo"><FaClipboardList /></div>
          <div>
            <span>Todo</span>
            <strong>{stats.todo}</strong>
          </div>
        </div>
        <div className="task-stat-card">
          <div className="task-stat-icon in-progress"><FaClipboardList /></div>
          <div>
            <span>In Progress</span>
            <strong>{stats.inProgress}</strong>
          </div>
        </div>
        <div className="task-stat-card">
          <div className="task-stat-icon review"><FaClipboardList /></div>
          <div>
            <span>Review</span>
            <strong>{stats.review}</strong>
          </div>
        </div>
        <div className="task-stat-card">
          <div className="task-stat-icon completed"><FaClipboardList /></div>
          <div>
            <span>Completed</span>
            <strong>{stats.completed}</strong>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="admin-tasks-toolbar">
        <div className="admin-tasks-search">
          <button
            type="button"
            onClick={handleSearchSubmit}
            aria-label="Search tasks"
          >
            <FaSearch />
          </button>
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            placeholder="Search tasks, projects or members..."
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

        <div className="admin-tasks-filters">
          {/* Status Filter */}
          <div className="admin-tasks-filter">
            <FaFilter />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="admin-tasks-filter">
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

          {/* Manager Filter */}
          <div className="admin-tasks-filter">
            <FaUserTie />
            <select
              value={managerFilter}
              onChange={(event) => setManagerFilter(event.target.value)}
            >
              <option value="all">All Managers</option>
              {managerOptions.length > 0 ? (
                managerOptions.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>No managers available</option>
              )}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="admin-tasks-clear-filters"
              onClick={clearFilters}
            >
              <FaTimes />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Info */}
      <div className="admin-tasks-results-header">
        <div>
          Showing <strong>{filteredTasks.length}</strong> of{" "}
          <strong>{allTasks.length}</strong> tasks
        </div>
        {hasActiveFilters && <span>Filters applied</span>}
      </div>

      {/* Task Grid */}
      {filteredTasks.length === 0 ? (
        <div className="admin-tasks-empty">
          <div className="admin-tasks-empty-icon">
            <FaClipboardList />
          </div>
          <h3>
            {allTasks.length === 0 ? "No tasks yet" : "No tasks found"}
          </h3>
          <p>
            {allTasks.length === 0
              ? "Tasks will appear here once they are created."
              : "Try changing your search or filters."}
          </p>
          {hasActiveFilters && allTasks.length > 0 && (
            <button
              type="button"
              className="admin-tasks-empty-clear"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="admin-tasks-grid">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              userRole="admin"
              onView={handleView}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminTasks;