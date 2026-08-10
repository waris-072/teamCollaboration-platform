import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaUserTag, FaImage } from "react-icons/fa";

import { createUser } from "../../services/userService"; 
import { NAME_REGEX, EMAIL_REGEX, PASSWORD_REGEX, } from "../../utils/validators";
import Loader from "../loader/Loader";

import "./User-styling/UserForm.css";

function UserForm({ onSuccess, onCancel }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setLoadig] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    reset,
    formState: {
      errors,
      isSubmitting,
      isValid,
    },
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "member",
      avatar: "",
    },
  });

  const password = watch("password");
  const watchedName = watch("name");
  const watchedEmail = watch("email");
  const watchedConfirmPassword = watch("confirmPassword");

  const onSubmit = async (formData) => {
    try {
      setLoadig(true)
      setServerError("");

      const { confirmPassword, ...userData } = formData;

      const data = await createUser(userData);

      reset({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "member",
        avatar: "",
      });

      if (onSuccess) {
        onSuccess(data.user);
      }
    } catch (error) {
      setServerError(
        error?.response?.data?.message ||
        "Failed to create user. Please try again."
      );
    } finally{
      setLoadig(false);
    }
  };
  
  if (isLoading || isSubmitting) {
    return <Loader message="Creating a User for the workspace..." />;
  }

  return (
    <form className="user-form" onSubmit={handleSubmit(onSubmit)} >
      
      {/* Name */}
 
      <div className="user-form-group">
        <div className="user-form-label-wrapper">
          <FaUser className="user-form-icon" />
          <label htmlFor="user-name">Full Name</label>
        </div>

        <input
          id="user-name"
          type="text"
          placeholder="Enter full name"
          className={
            errors.name
              ? "user-form-input input-error"
              : watchedName
                ? "user-form-input input-success"
                : "user-form-input"
          }
          {...register("name", {
            required: "Name is required",
            pattern: {
              value: NAME_REGEX,
              message: "Enter a valid name.",
            },
          })}
        />

        {errors.name && (
          <small className="user-form-error">
            {errors.name.message}
          </small>
        )}
      </div>
      
      {/* Email */}
      <div className="user-form-group">
        <div className="user-form-label-wrapper">
          <FaEnvelope className="user-form-icon" />
          <label htmlFor="user-email">Email Address</label>
        </div>

        <input
          id="user-email"
          type="email"
          placeholder="user@teamflow.com"
          className={
            errors.email
              ? "user-form-input input-error"
              : watchedEmail
                ? "user-form-input input-success"
                : "user-form-input"
          }
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: EMAIL_REGEX,
              message: "Enter a valid email.",
            },
          })}
        />

        {errors.email && (
          <small className="user-form-error">
            {errors.email.message}
          </small>
        )}
      </div>

      {/* Password */}
      <div className="user-form-group">
        <div className="user-form-label-wrapper">
          <FaLock className="user-form-icon" />
          <label htmlFor="user-password">Password</label>
        </div>

        <div className="user-form-password">
          <input
            id="user-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            className={
              errors.password
                ? "user-form-input input-error"
                : password
                  ? "user-form-input input-success"
                  : "user-form-input"
            }
            {...register("password", {
              required: "Password is required",
              pattern: {
                value: PASSWORD_REGEX,
                message:
                  "Must contain uppercase, lowercase, number & special char.",
              },
              onChange: () => trigger("confirmPassword"),
            })}
          />

          <button
            type="button"
            className="user-form-password-toggle"
            onClick={() => setShowPassword((previous) => !previous) }
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (<FaEyeSlash />) : (  <FaEye />)}
          </button>
        </div>

        {errors.password && (
          <small className="user-form-error">
            {errors.password.message}
          </small>
        )}
      </div>
     
      {/* Confirm Password */}     
      <div className="user-form-group">
        <div className="user-form-label-wrapper">
          <FaLock className="user-form-icon" />
          <label htmlFor="user-confirm-password">Confirm Password</label>
        </div>

        <div className="user-form-password">
          <input
            id="user-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm password"
            className={
              errors.confirmPassword
                ? "user-form-input input-error"
                : watchedConfirmPassword
                  ? "user-form-input input-success"
                  : "user-form-input"
            }
            {...register("confirmPassword", {
              required: "Please confirm the password.",
              validate: (value) =>
                value === password || "Passwords do not match.",
            })}
          />

          <button
            type="button"
            className="user-form-password-toggle"
            onClick={() =>
              setShowConfirmPassword((previous) => !previous)
            }
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (<FaEyeSlash />) : (  <FaEye />)}
          </button>
        </div>

        {errors.confirmPassword && (
          <small className="user-form-error">
            {errors.confirmPassword.message}
          </small>
        )}
      </div>

      {/* Role */}
      <div className="user-form-group">
        <div className="user-form-label-wrapper">
          <FaUserTag className="user-form-icon" />
          <label htmlFor="user-role">Role</label>
        </div>

        <select
          id="user-role"
          className="user-form-input"
          {...register("role", {
            required: "Role is required",
          })}
        >
          <option value="member">Member</option>
          <option value="manager">Manager</option>
        </select>

        {errors.role && (
          <small className="user-form-error">
            {errors.role.message}
          </small>
        )}
      </div>

      {/* Server Error */}
      {serverError && (
        <div className="user-form-server-error">
          {serverError}
        </div>
      )}
      
      {/* Actions */} 
      <div className="user-form-actions">
        <button
          type="button"
          className="user-form-cancel"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="user-form-submit"
          disabled={!isValid || isSubmitting}
        >
          Create
        </button>
      </div>
    </form>
  );
}

export default UserForm;