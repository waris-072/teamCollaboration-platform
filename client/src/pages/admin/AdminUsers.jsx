import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { 
  FaEye, FaUserCog, FaUserCheck, FaUserTimes, FaPlus, FaSearch, 
  FaFilter, FaTimes, FaUserShield, FaUserGraduate, FaUser, 
  FaUserSlash, FaUserPlus as FaUserActivate,
} from "react-icons/fa";

import useAuth from "../../hooks/useAuth";
import { getUsers, updateUserRole, updateUserStatus } from "../../services/userService";
import UserForm from "../../components/users/UserForm";
import Loader from "../../components/loader/Loader";

import "./Admin-styling/AdminUsers.css";


function AdminUsers() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showMobileForm, setShowMobileForm] = useState(false);
  const searchInputRef = useRef(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getUsers();

      setUsers(data.users || []);
    } catch (error) {
      setError(
        error?.response?.data?.message || "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Sort users: Admins on top, then active users, then inactive users
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      // Admins always on top
      if (a.role === 'admin' && b.role !== 'admin') return -1;
      if (b.role === 'admin' && a.role !== 'admin') return 1;
      
      // If both are admins or both are non-admins, sort by active status
      // Active users come before inactive users
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      
      // If same role and same status, maintain original order
      return 0;
    });
  }, [users]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return sortedUsers.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.name?.toLowerCase().includes(normalizedSearch) ||
        user.email?.toLowerCase().includes(normalizedSearch);

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive);

      return ( matchesSearch && matchesRole && matchesStatus);
    });
  }, [ sortedUsers, searchQuery, roleFilter, statusFilter,]);

  const hasActiveFilters =
    searchQuery !== "" ||
    roleFilter !== "all" ||
    statusFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setSearchQuery("");
    setRoleFilter("all");
    setStatusFilter("all");
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

  const handleUserCreated = (createdUser) => {
    if (createdUser) {
      setUsers((previousUsers) => [createdUser, ...previousUsers]);
    }

    setShowMobileForm(false);
  };

  const handleRoleChange = async (selectedUser) => {
    if (!selectedUser) {
      return;
    }

    const newRole = selectedUser.role === "manager" ? "member" : "manager";
    const confirmed = window.confirm(
      `Change ${selectedUser.name}'s role from ${selectedUser.role} to ${newRole}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const data = await updateUserRole(
        selectedUser._id,
        newRole
      );

      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user._id === selectedUser._id ? data.user : user
        )
      );
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "Unable to change user role."
      );
    }
  };

  const handleStatusChange = async (selectedUser) => {
    if (!selectedUser) {
      return;
    }

    if (currentUser?._id === selectedUser._id){ 
      alert("You cannot deactivate your own account.");
      return;
    }

    const newStatus = !selectedUser.isActive;
    const action = newStatus ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${selectedUser.name}'s account?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const data = await updateUserStatus(selectedUser._id, newStatus);

      // Find the user and update their status
      const updatedUser = data.user;
      
      // Update the users state with the new data
      setUsers((previousUsers) => {
        // Find the index of the user being updated
        const userIndex = previousUsers.findIndex(u => u._id === selectedUser._id);
        
        if (userIndex === -1) return previousUsers;
        
        // Create new array with updated user
        const newUsers = [...previousUsers];
        newUsers[userIndex] = updatedUser;
        
        return newUsers;
      });
    } catch (error) {
      alert(error?.response?.data?.message || `Unable to ${action} user.`);
    }
  };

  const getInitial = (name) => {
    return (name?.charAt(0)?.toUpperCase() || "U");
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <FaUserShield />;
      case 'manager': return <FaUserGraduate />;
      case 'member': return <FaUser />;
      default: return <FaUser />;
    }
  };

  return (
    <div className="admin-users-page">

      {/* Header with Search & Filters */}
      <div className="admin-users-header">
        <div className="admin-users-header-toolbar">
          <div className="admin-users-search">
            <button
              type="button"
              className="admin-users-search-btn"
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
              placeholder="Search users..."
              aria-label="Search users"
            />
            
            {searchTerm && (
              <button
                type="button"
                className="admin-users-search-clear"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="admin-users-filters">
            <div className="admin-users-filter">
              <FaFilter />
              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value)
                }
              >
                <option value="all">All roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="member">Member</option>
              </select>
            </div>

            <div className="admin-users-filter">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="admin-users-clear-filters"
                onClick={clearFilters}
                title="Clear filters"
              >
                <FaTimes />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="admin-users-result-info">
            <span>
              Showing <strong>{filteredUsers.length}</strong> of{" "}
              <strong>{users.length}</strong> users
            </span>
            {hasActiveFilters && (
              <span className="admin-users-filter-active">
                Filters applied
              </span>
            )}
          </div>

          {/* Mobile Create Button */}
          <button
            type="button"
            className="admin-users-create-mobile"
            onClick={() => setShowMobileForm(true)}
          >
            <FaPlus />
            <span>Create User</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-users-error">
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* Main Layout */}
      <div className="admin-users-layout">

        {/* Desktop User Form */}
        <div className="admin-users-form-card">
          <div className="admin-users-card-header">
            <h2>Create New User</h2>
            <p>Add a manager or member to your workspace</p>
          </div>

          <UserForm onSuccess={handleUserCreated} />
        </div>
            
        {/* Users List */}
        <div className="admin-users-list-card">
          {/* Users Grid */}
          <div className="admin-users-grid">
            {loading ? (
              <div className="admin-users-state">
                <Loader />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="admin-users-state">
                <div className="empty-state-icon">👥</div>
                <h3>No users found</h3>
                <p>
                  {hasActiveFilters
                    ? "Try changing your search or filters"
                    : "Get started by creating your first user"}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    className="empty-state-btn"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                )}
                {!hasActiveFilters && (
                  <button
                    type="button"
                    className="empty-state-btn"
                    onClick={() => setShowMobileForm(true)}
                  >
                    <FaPlus />
                    Create User
                  </button>
                )}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className={`admin-user-card ${
                    !user.isActive ? "admin-user-card-inactive" : ""
                  }`}
                  data-role={user.role}
                >
                  {/* Card Header with Avatar and Status */}
                  <div className="admin-user-card-header">
                    <div className="admin-user-avatar-wrapper">
                      <div className="admin-user-avatar">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} />
                        ) : (
                          getInitial(user.name)
                        )}
                      </div>
                      <div className={`admin-user-status-dot ${user.isActive ? 'active' : 'inactive'}`} />
                    </div>
                    
                    <div className="admin-user-role-icon">
                      <span className="user-role-badge">
                        {user.role}
                      </span>
                      {getRoleIcon(user.role)}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="admin-user-card-body">
                    <h3 className="admin-user-name">{user.name}</h3>
                    <span className="admin-user-email">{user.email}</span>

                    <div className="admin-user-meta">
                      <span
                        className={`user-status-badge ${
                          user.isActive
                            ? "user-status-active"
                            : "user-status-inactive"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer with Actions */}
                  <div className="admin-user-card-footer">
                    <button
                      type="button"
                      className="user-action-btn user-action-details"
                      onClick={() =>
                        navigate(`/admin/users/${user._id}`)
                      }
                      title="View Profile"
                      aria-label={`View profile for ${user.name}`}
                    >
                      <FaEye />
                      <span>Profile</span>
                    </button>

                    {user.role !== "admin" && (
                      <button
                        type="button"
                        className="user-action-btn user-action-role"
                        onClick={() => handleRoleChange(user)}
                        title={`Change role to ${user.role === "manager" ? "Member" : "Manager"}`}
                        aria-label={`Change role for ${user.name}`}
                      >
                        <FaUserCog />
                        <span>Role</span>
                      </button>
                    )}

                    {user.role !== "admin" && (
                      <button
                        type="button"
                        className={`user-action-btn ${
                          !user.isActive
                            ? "user-action-activate"
                            : "user-action-deactivate"
                        }`}
                        onClick={() => handleStatusChange(user)}
                        title={
                          user.isActive
                            ? "Deactivate Account"
                            : "Activate Account"
                        }
                        aria-label={
                          user.isActive
                            ? `Deactivate ${user.name}`
                            : `Activate ${user.name}`
                        }
                      >
                        {user.isActive ? (
                          <>
                            <FaUserSlash />
                            <span>Deactivate</span>
                          </>
                        ) : (
                          <>
                            <FaUserActivate />
                            <span>Activate</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile Create User Modal */}
      {showMobileForm && (
        <div
          className="admin-users-mobile-modal-overlay"
          onClick={() => setShowMobileForm(false)}
        >
          <div
            className="admin-users-mobile-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-users-mobile-modal-header">
              <div>
                <h2>Create New User</h2>
                <p>Add a manager or member to your workspace</p>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileForm(false)}
                aria-label="Close create user form"
              >
                <FaTimes />
              </button>
            </div>

            <UserForm onSuccess={handleUserCreated} />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;