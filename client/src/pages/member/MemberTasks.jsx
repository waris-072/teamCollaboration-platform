import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaClipboardList,
  FaSearch,
  FaFilter,
  FaTimes,
} from "react-icons/fa";

import {
  getTasks,
  updateTaskStatus,
} from "../../services/taskService";

import TaskCard from "../../components/task/TaskCard";
import Loader from "../../components/loader/Loader";

import useAuth from "../../hooks/useAuth";

import "./Member-styling/MemberTasks.css";

function MemberTasks() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const searchInputRef = useRef(null);

  // =====================================================
  // Fetch Tasks
  // =====================================================

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setServerError("");

      const response = await getTasks();
      const tasksData = response?.tasks || [];
      
      // Filter tasks assigned to current user
      const userTasks = tasksData.filter(
        (task) => task.assignedTo?._id === user?._id || task.assignedTo === user?._id
      );
      
      setAllTasks(userTasks);
    } catch (error) {
      setServerError(
        error?.response?.data?.message || "Unable to load tasks."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
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
        task.project?.title?.toLowerCase().includes(normalizedSearch);

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
  // Task Actions
  // =====================================================

  const handleView = (task) => {
    // Navigate to task details
    navigate(`/member/tasks/${task._id}`);
  };

  const handleStatusChange = async (task, newStatus) => {
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
    return <Loader message="Loading your tasks..." />;
  }

  // =====================================================
  // Render
  // =====================================================

  return (
    <div className="member-tasks-page">
      {/* Error Banner */}
      {serverError && (
        <div className="member-tasks-error">
          <span>{serverError}</span>
          <button type="button" onClick={() => setServerError("")}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* Stats Section */}
      <section className="member-tasks-stats">
        <div className="task-stat-card">
          <div className="task-stat-icon total"><FaClipboardList /></div>
          <div>
            <span>My Tasks</span>
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
      <div className="member-tasks-toolbar">
        <div className="member-tasks-search">
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
            placeholder="Search your tasks..."
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

        <div className="member-tasks-filters">
          <div className="member-tasks-filter">
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

          <div className="member-tasks-filter">
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
              className="member-tasks-clear-filters"
              onClick={clearFilters}
            >
              <FaTimes />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Info */}
      <div className="member-tasks-results-header">
        <div>
          Showing <strong>{filteredTasks.length}</strong> of{" "}
          <strong>{allTasks.length}</strong> tasks
        </div>
        {hasActiveFilters && <span>Filters applied</span>}
      </div>

      {/* Task Grid */}
      {filteredTasks.length === 0 ? (
        <div className="member-tasks-empty">
          <div className="member-tasks-empty-icon">
            <FaClipboardList />
          </div>
          <h3>
            {allTasks.length === 0 ? "No tasks assigned" : "No tasks found"}
          </h3>
          <p>
            {allTasks.length === 0
              ? "You don't have any tasks assigned to you yet."
              : "Try changing your search or filters."}
          </p>
          {hasActiveFilters && allTasks.length > 0 && (
            <button
              type="button"
              className="member-tasks-empty-clear"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="member-tasks-grid">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              userRole="member"
              onView={handleView}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MemberTasks;