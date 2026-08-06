import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import useAuth from "../../hooks/useAuth";
import { NAME_REGEX, EMAIL_REGEX, PASSWORD_REGEX, } from "../../utils/validators";

import "./Auth.css";
import Loader from "../../components/loader/Loader";

function Register() {
  const navigate = useNavigate();

  const { register: registerUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: {
      errors,
      isSubmitting,
      isValid,
    },
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const password = watch("password");
  const watchedName = watch("name");
  const watchedEmail = watch("email");
  const watchedConfirmPassword = watch("confirmPassword");

  const onSubmit = async (formData) => {
    try {
      setServerError("");

      const data = await registerUser(formData);

      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      setServerError(
        error?.response?.data?.message ||
          "Registration failed. Please try again."
      );
    }
  };
  if(isSubmitting){
    return <Loader message="creating a new account..."/>
  }

  return (
    <div className="auth-container">

      <div className="auth-card">

        <h1 className="auth-title">
          Create Account
        </h1>

        <p className="auth-subtitle">
          Join BakeryShop today.
        </p>

        <form
          className="auth-form"
          onSubmit={handleSubmit(onSubmit)}
        >
                    {/* Name */}

          <div className="form-group">
            <input
              id="name"
              type="text"
              className={
                errors.name
                  ? "input-error"
                  : watchedName
                  ? "input-success"
                  : ""
              }
              placeholder="Enter your full name"
              {...register("name", {
                required: "Name is required",
                pattern: {
                  value: NAME_REGEX,
                  message: "Enter a valid name",
                },
              })}
            />

            {errors.name && (
              <small className="error">
                {errors.name.message}
              </small>
            )}
          </div>

          {/* Email */}

          <div className="form-group">

            <input
              id="email"
              className={
                errors.email
                  ? "input-error"
                  : watchedEmail
                  ? "input-success"
                  : ""
              }
              type="email"
              placeholder="Enter your email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: EMAIL_REGEX,
                  message: "Enter a valid email",
                },
              })}
            />

            {errors.email && (
              <small className="error">
                {errors.email.message}
              </small>
            )}
          </div>

          {/* Password */}

          <div className="form-group">

            <div className="password-input">

              <input
                id="password"
                className={
                  errors.password
                    ? "input-error"
                    : password
                    ? "input-success"
                    : ""
                }
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                {...register("password", {
                  required: "Password is required",
                  pattern: {
                    value: PASSWORD_REGEX,
                    message:
                      "Password must contain uppercase, lowercase, number and special character.",
                  },
                  onChange: () => trigger("confirmPassword"),
                })}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>

            {errors.password && (
              <small className="error">
                {errors.password.message}
              </small>
            )}

          </div>

          {/* Confirm Password */}

          <div className="form-group">
            <div className="password-input">

              <input
                id="confirmPassword"
                className={
                  errors.confirmPassword
                    ? "input-error"
                    : watchedConfirmPassword
                    ? "input-success"
                    : ""
                }
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm password"
                {...register("confirmPassword", {
                  required:
                    "Please confirm your password",

                  validate: (value) =>
                    value === password ||
                    "Passwords do not match",
                })}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >
                {showConfirmPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>

            {errors.confirmPassword && (
              <small className="error">
                {errors.confirmPassword.message}
              </small>
            )}

          </div>

          {serverError && (
            <div className="server-error">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            className="auth-btn"
            disabled={!isValid || isSubmitting}
          >
           Register
          </button>

          <p className="auth-footer">
            Already have an account?{" "}
            <Link to="/login">
              Login
            </Link>
          </p>

        </form>

      </div>

    </div>
  );
}

export default Register;