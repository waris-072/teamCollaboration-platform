import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import "./Auth.css";

import useAuth from "../../hooks/useAuth";
import { EMAIL_REGEX, PASSWORD_REGEX } from "../../utils/validators";
import Loader from "../../components/loader/Loader";

function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: {
      errors,
      isSubmitting,
      isValid,
    },
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const onSubmit = async (formData) => {
    try {
      setServerError("");

      const data = await login(formData);

      switch (data.user.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;

        case "manager":
          navigate("/manager/dashboard");
          break;

        case "member":
          navigate("/member/dashboard");
          break;

        default:
          navigate("/login");
      }
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
        "Invalid email or password."
      );
    }
  };

  if (isSubmitting) {
    return <Loader message="Signing you in..." />
  }

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h1 className="auth-title">
          Welcome Back
        </h1>

        <p className="auth-subtitle">
          Sign in to access your TeamFlow workspace.
        </p>

        <form
          className="auth-form"
          onSubmit={handleSubmit(onSubmit)}
        >

          {/* Email */}

          <div className="form-group">
            <input
              className={
                errors.email
                  ? "input-error"
                  : watch("email")
                    ? "input-success"
                    : ""
              }
              type="email"
              placeholder="Email address"
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
                className={
                  errors.password
                    ? "input-error"
                    : watch("password")
                      ? "input-success"
                      : ""
                }
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  pattern: {
                    value: PASSWORD_REGEX,
                    message: "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."
                  },
                })}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword
                  ? <FaEyeSlash />
                  : <FaEye />}
              </button>

            </div>

            {errors.password && (
              <small className="error">
                {errors.password.message}
              </small>
            )}

          </div>

          {serverError && (
            <div className="server-error">
              {serverError}
            </div>
          )}

          <button
            className="auth-btn"
            disabled={!isValid || isSubmitting}
          >
            Sign In
          </button>
          <p className="auth-footer">
            Contact your administrator if you need an account.
          </p>

        </form>

      </div>
    </div>
  );
}

export default Login;