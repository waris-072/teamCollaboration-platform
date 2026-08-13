import { useEffect, useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaUserShield,
  FaUserTie,
  FaUserCircle,
  FaCamera,
  FaSave,
  FaTimes,
  FaLock,
  FaCheckCircle,
  FaExclamationCircle,
  FaEdit,
  FaUserCog,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";

import useAuth from "../../hooks/useAuth";
import { updateProfile, updatePassword } from "../../services/profileService";
import Loader from "../../components/loader/Loader";

import "./Profile.css";

function Profile() {
  const { user, setUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: "",
    avatar: "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  // =====================================================
  // Initialize form with user data
  // =====================================================

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  // =====================================================
  // Get role icon
  // =====================================================

  const getRoleIcon = () => {
    switch (user?.role) {
      case "admin":
        return <FaUserShield />;
      case "manager":
        return <FaUserTie />;
      default:
        return <FaUser />;
    }
  };

  const getRoleLabel = () => {
    if (!user?.role) return "Unknown";
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case "admin":
        return "var(--admin-primary)";
      case "manager":
        return "var(--manager-primary)";
      case "member":
        return "var(--member-primary)";
      default:
        return "var(--color-primary)";
    }
  };

  // =====================================================
  // Format date
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // =====================================================
  // Handle profile input changes
  // =====================================================

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    setProfileErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // =====================================================
  // Handle password input changes
  // =====================================================

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // =====================================================
  // Validate profile form
  // =====================================================

  const validateProfile = () => {
    const errors = {};
    if (!profileData.name.trim()) {
      errors.name = "Name is required.";
    } else if (profileData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters.";
    }
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // =====================================================
  // Validate password form
  // =====================================================

  const validatePassword = () => {
    const errors = {};
    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required.";
    }
    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required.";
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "New password must be at least 6 characters.";
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // =====================================================
  // Handle profile update
  // =====================================================

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    if (!validateProfile()) return;

    try {
      setUpdating(true);
      setServerError("");
      setSuccessMessage("");

      const response = await updateProfile({
        name: profileData.name.trim(),
        avatar: profileData.avatar,
      });

      const updatedUser = response.user || response;
      
      if (setUser) {
        setUser(updatedUser);
      }

      setProfileData({
        name: updatedUser.name || "",
        avatar: updatedUser.avatar || "",
      });

      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);

      setTimeout(() => setSuccessMessage(""), 3000);

    } catch (error) {
      console.error("Profile update error:", error);
      setServerError(
        error?.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setUpdating(false);
    }
  };

  // =====================================================
  // Handle password update
  // =====================================================

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    if (!validatePassword()) return;

    try {
      setUpdating(true);
      setServerError("");
      setSuccessMessage("");

      await updatePassword({
        password: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setSuccessMessage("Password updated successfully!");

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => setSuccessMessage(""), 3000);

    } catch (error) {
      console.error("Password update error:", error);
      setServerError(
        error?.response?.data?.message || "Failed to update password."
      );
    } finally {
      setUpdating(false);
    }
  };

  // =====================================================
  // Cancel editing
  // =====================================================

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfileData({
      name: user?.name || "",
      avatar: user?.avatar || "",
    });
    setProfileErrors({});
    setServerError("");
  };

  // =====================================================
  // Get initials for avatar
  // =====================================================

  const getInitials = () => {
    if (!user?.name) return "?";
    return user.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  // =====================================================
  // Loading
  // =====================================================

  if (loading) {
    return <Loader message="Loading profile..." />;
  }

  const roleColor = getRoleColor();

  // =====================================================
  // Render
  // =====================================================

  return (
    <div className="profile-page">
      {/* Profile Card */}
      <div className="profile-card">
        {/* Header / Avatar Section */}
        <div className="profile-header" style={{ borderBottomColor: roleColor }}>
          <div className="profile-avatar-wrapper">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="profile-avatar" />
            ) : (
              <div className="profile-avatar-placeholder" style={{ background: roleColor }}>
                {getInitials()}
              </div>
            )}
          </div>

          <div className="profile-header-info">
            <h1>{user?.name || "User"}</h1>
            <div className="profile-role-badge" style={{ background: roleColor + "20", color: roleColor }}>
              {getRoleIcon()}
              <span>{getRoleLabel()}</span>
            </div>
            <p className="profile-email">
              <FaEnvelope />
              {user?.email}
            </p>
            <div className="profile-meta">
              <span>
                <FaCalendarAlt />
                Joined {formatDate(user?.createdAt)}
              </span>
              <span>
                <FaClock />
                Last login: {formatDate(user?.lastLogin)}
              </span>
            </div>
          </div>

          {/* Edit Toggle Button */}
          {!isEditing && (
            <button
              type="button"
              className="profile-edit-toggle"
              onClick={() => setIsEditing(true)}
            >
              <FaEdit />
              Edit Profile
            </button>
          )}
        </div>

        {/* Messages */}
        {serverError && (
          <div className="profile-error">
            <FaExclamationCircle className="error-icon" />
            <span>{serverError}</span>
            <button type="button" onClick={() => setServerError("")}>
              <FaTimes />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="profile-success">
            <FaCheckCircle className="success-icon" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Content */}
        <div className="profile-content">
          {isEditing ? (
            // Edit Mode - Show tabs and forms
            <>
              <div className="profile-tabs">
                <button
                  type="button"
                  className={`profile-tab ${activeTab === "profile" ? "active" : ""}`}
                  onClick={() => setActiveTab("profile")}
                >
                  <FaUserCog />
                  Edit Profile
                </button>
                <button
                  type="button"
                  className={`profile-tab ${activeTab === "password" ? "active" : ""}`}
                  onClick={() => setActiveTab("password")}
                >
                  <FaLock />
                  Change Password
                </button>
              </div>

              {/* Profile Form */}
              {activeTab === "profile" && (
                <form className="profile-form" onSubmit={handleProfileUpdate}>
                  <div className="profile-form-group">
                    <label htmlFor="profile-name">
                      Full Name <span>*</span>
                    </label>
                    <div className="profile-input-wrapper">
                      <FaUser />
                      <input
                        id="profile-name"
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        placeholder="Enter your full name"
                        disabled={updating}
                      />
                    </div>
                    {profileErrors.name && (
                      <small className="profile-error-text">{profileErrors.name}</small>
                    )}
                  </div>

                  <div className="profile-form-group">
                    <label htmlFor="profile-email">Email</label>
                    <div className="profile-input-wrapper">
                      <FaEnvelope />
                      <input
                        id="profile-email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="profile-input-disabled"
                      />
                    </div>
                    <small className="profile-helper-text">
                      Email cannot be changed. Contact an administrator if you need to update it.
                    </small>
                  </div>

                  <div className="profile-form-group">
                    <label htmlFor="profile-role">Role</label>
                    <div className="profile-input-wrapper">
                      {getRoleIcon()}
                      <input
                        id="profile-role"
                        type="text"
                        value={getRoleLabel()}
                        disabled
                        className="profile-input-disabled"
                      />
                    </div>
                    <small className="profile-helper-text">
                      Role cannot be changed. Contact an administrator if you need to update it.
                    </small>
                  </div>

                  <div className="profile-form-actions">
                    <button
                      type="button"
                      className="profile-cancel-btn"
                      onClick={handleCancelEdit}
                      disabled={updating}
                    >
                      <FaTimes />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="profile-submit-btn"
                      disabled={updating}
                    >
                      {updating ? (
                        <>
                          <span className="profile-spinner" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Password Form */}
              {activeTab === "password" && (
                <form className="profile-form" onSubmit={handlePasswordUpdate}>
                  <div className="profile-form-group">
                    <label htmlFor="current-password">
                      Current Password <span>*</span>
                    </label>
                    <div className="profile-input-wrapper">
                      <FaLock />
                      <input
                        id="current-password"
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your current password"
                        disabled={updating}
                      />
                    </div>
                    {passwordErrors.currentPassword && (
                      <small className="profile-error-text">
                        {passwordErrors.currentPassword}
                      </small>
                    )}
                  </div>

                  <div className="profile-form-group">
                    <label htmlFor="new-password">
                      New Password <span>*</span>
                    </label>
                    <div className="profile-input-wrapper">
                      <FaLock />
                      <input
                        id="new-password"
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your new password"
                        disabled={updating}
                      />
                    </div>
                    {passwordErrors.newPassword && (
                      <small className="profile-error-text">
                        {passwordErrors.newPassword}
                      </small>
                    )}
                    <small className="profile-helper-text">
                      Password must be at least 6 characters long.
                    </small>
                  </div>

                  <div className="profile-form-group">
                    <label htmlFor="confirm-password">
                      Confirm New Password <span>*</span>
                    </label>
                    <div className="profile-input-wrapper">
                      <FaLock />
                      <input
                        id="confirm-password"
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm your new password"
                        disabled={updating}
                      />
                    </div>
                    {passwordErrors.confirmPassword && (
                      <small className="profile-error-text">
                        {passwordErrors.confirmPassword}
                      </small>
                    )}
                  </div>

                  <div className="profile-form-actions">
                    <button
                      type="button"
                      className="profile-cancel-btn"
                      onClick={handleCancelEdit}
                      disabled={updating}
                    >
                      <FaTimes />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="profile-submit-btn"
                      disabled={updating}
                    >
                      {updating ? (
                        <>
                          <span className="profile-spinner" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <FaLock />
                          Update Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            // View Mode - Show profile info card
            <div className="profile-info-card">
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <span className="profile-info-label">
                    <FaUser />
                    Full Name
                  </span>
                  <span className="profile-info-value">{user?.name}</span>
                </div>

                <div className="profile-info-item">
                  <span className="profile-info-label">
                    <FaEnvelope />
                    Email
                  </span>
                  <span className="profile-info-value">{user?.email}</span>
                </div>

                <div className="profile-info-item">
                  <span className="profile-info-label">
                    {getRoleIcon()}
                    Role
                  </span>
                  <span className="profile-info-value">
                    <span className="profile-role-tag" style={{ background: roleColor + "20", color: roleColor }}>
                      {getRoleLabel()}
                    </span>
                  </span>
                </div>

                <div className="profile-info-item">
                  <span className="profile-info-label">
                    <FaCalendarAlt />
                    Member Since
                  </span>
                  <span className="profile-info-value">{formatDate(user?.createdAt)}</span>
                </div>

                <div className="profile-info-item">
                  <span className="profile-info-label">
                    <FaClock />
                    Last Login
                  </span>
                  <span className="profile-info-value">{formatDate(user?.lastLogin)}</span>
                </div>

                <div className="profile-info-item">
                  <span className="profile-info-label">
                    <FaUserCircle />
                    Status
                  </span>
                  <span className="profile-info-value">
                    <span className={`profile-status ${user?.isActive ? "active" : "inactive"}`}>
                      {user?.isActive ? "Active" : "Inactive"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;