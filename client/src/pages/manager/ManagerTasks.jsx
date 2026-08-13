import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaClipboardList,
  FaPlus,
  FaSearch,
  FaFilter,
  FaTimes,
} from "react-icons/fa";

import {
  createTask,
  getTasks,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "../../services/taskService";

import { getProjects } from "../../services/projectService";

import TaskCard from "../../components/task/TaskCard";
import TaskForm from "../../components/task/TaskForm";
import Loader from "../../components/loader/Loader";
import Modal from "../../components/Modal/Modal";

import useAuth from "../../hooks/useAuth";

import "./Manager-styling/ManagerTasks.css";

function ManagerTasks() {
  const { user } = useAuth();
  const navigate = useNavigate(); // Add this

  const [allTasks, setAllTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
      const matchesSearch =
        !normalizedSearch ||
        task.title?.toLowerCase().includes(normalizedSearch) ||
        task.description?.toLowerCase().includes(normalizedSearch) ||
        task.project?.title?.toLowerCase().includes(normalizedSearch) ||
        task.assignedTo?.name?.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [allTasks, searchQuery, statusFilter, priorityFilter]);

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
  // Task Form Handlers
  // =====================================================

  const handleCreateNew = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  // =====================================================
  // Save Task
  // =====================================================

  const handleSaveTask = async (taskData) => {
    try {
      setSubmitting(true);
      setServerError("");

      let savedTask;
      
      if (editingTask) {
        const response = await updateTask(editingTask._id, taskData);
        savedTask = response.task || response;
        
        setAllTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === editingTask._id ? savedTask : task
          )
        );
      } else {
        const response = await createTask(taskData);
        savedTask = response.task || response;
        
        setAllTasks((prevTasks) => [savedTask, ...prevTasks]);
      }

      await fetchData();
      setShowForm(false);
      setEditingTask(null);
      
    } catch (error) {
      setServerError(
        error?.response?.data?.message || "Failed to save task."
      );
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // Task Actions - FIXED: Navigate to task details
  // =====================================================

  const handleView = (task) => {
    // Navigate to task details page
    navigate(`/manager/tasks/${task._id}`);
  };

  const handleStatusChange = async (task, newStatus) => {
    if (user?.role !== "member") {
      window.alert("Only project members can update task status.");
      return;
    }

    if (!newStatus || newStatus === task.status) {
      return;
    }

    const statusLabels = {
      'todo': 'Todo',
      'in-progress': 'In Progress',
      'review': 'Review',
      'completed': 'Completed'
    };

    const confirmed = window.confirm(
      `Change "${task.title}" status from "${statusLabels[task.status] || task.status}" to "${statusLabels[newStatus] || newStatus}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setServerError("");
      
      const response = await updateTaskStatus(task._id, newStatus);
      const updatedTask = response.task || response;
      
      setAllTasks((prevTasks) =>
        prevTasks.map((t) =>
          t._id === task._id ? updatedTask : t
        )
      );
      
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to update task status.";
      setServerError(errorMessage);
      window.alert(errorMessage);
    }
  };

  const handleDelete = async (task) => {
    if (user?.role !== "manager") {
      window.alert("Only managers can delete tasks.");
      return;
    }

    const confirmed = window.confirm(
      `⚠️ Delete "${task.title}"?\n\nThis action is PERMANENT and cannot be undone.\nAll task data will be lost forever.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setServerError("");
      
      await deleteTask(task._id);
      
      // Remove from local state
      setAllTasks((prevTasks) =>
        prevTasks.filter((t) => t._id !== task._id)
      );
      
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to delete task.";
      setServerError(errorMessage);
      window.alert(errorMessage);
    }
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
    return <Loader message="Loading tasks..." />;
  }

  // =====================================================
  // Render
  // =====================================================

  return (
    <div className="tasks-page">
      {/* Error Banner */}
      {serverError && (
        <div className="tasks-error">
          <span>{serverError}</span>
          <button type="button" onClick={() => setServerError("")}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* Stats Section */}
      <section className="tasks-stats">
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
      <div className="tasks-toolbar">
        <div className="tasks-search">
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

        <div className="tasks-filters">
          <div className="tasks-filter">
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

          <div className="tasks-filter">
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
              className="tasks-clear-filters"
              onClick={clearFilters}
            >
              <FaTimes />
              <span>Clear</span>
            </button>
          )}

          <button
            type="button"
            className="tasks-create-button"
            onClick={handleCreateNew}
          >
            <FaPlus />
            Create Task
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="tasks-results-header">
        <div>
          Showing <strong>{filteredTasks.length}</strong> of{" "}
          <strong>{allTasks.length}</strong> tasks
        </div>
        {hasActiveFilters && <span>Filters applied</span>}
      </div>

      {/* Task Grid */}
      {filteredTasks.length === 0 ? (
        <div className="tasks-empty">
          <div className="tasks-empty-icon">
            <FaClipboardList />
          </div>
          <h3>
            {allTasks.length === 0 ? "No tasks yet" : "No tasks found"}
          </h3>
          <p>
            {allTasks.length === 0
              ? "Create your first task to get started."
              : "Try changing your search or filters."}
          </p>
          {allTasks.length === 0 && (
            <button
              type="button"
              className="tasks-empty-create"
              onClick={handleCreateNew}
            >
              <FaPlus />
              Create Task
            </button>
          )}
          {hasActiveFilters && allTasks.length > 0 && (
            <button
              type="button"
              className="tasks-empty-clear"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="tasks-grid">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              userRole={user?.role}
              onView={handleView}
              onEdit={handleEdit}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseModal}
        title={editingTask ? "Update Task" : "Create New Task"}
        size="lg"
      >
        <TaskForm
          task={editingTask}
          projects={projects}
          onSubmit={handleSaveTask}
          onClose={handleCloseModal}
          submitting={submitting}
        />
      </Modal>
    </div>
  );
}

export default ManagerTasks;