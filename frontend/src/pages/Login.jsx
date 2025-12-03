import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, saveAuthData } from "../services/authService";
import "../styles/pages/Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function validate() {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      const data = await login(formData.username, formData.password);

      // Save tokens + user info
      saveAuthData(data);

      // Redirect to dashboard
      navigate("/dashboard");

    } catch (err) {
      setServerError("Invalid username or password");
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <h1 className="font-hero bold">Login</h1>
      <p className="margin-bottom-lg">Please log in with your credentials</p>

      {serverError && <p className="server-error">{serverError}</p>}

      <div className="form-group">
        <label htmlFor="username" className="font-subtitle">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="username 12345"
          value={formData.username}
          onChange={handleChange}
          required
        />
        {errors.username && (
          <span className="error-message">{errors.username}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="password" className="font-subtitle">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="password 12345"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {errors.password && (
          <span className="error-message">{errors.password}</span>
        )}
      </div>

      <button type="submit" className="login-btn btn">
        Login
      </button>
    </form>
  );
}
