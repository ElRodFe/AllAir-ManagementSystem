import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, saveAuthData } from "../services/authService";
import { useNotify } from "../contexts/NotificationContext";
import "../styles/pages/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { pushNotification } = useNotify();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

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

    if (Object.keys(validationErrors).length > 0) {
      pushNotification("Please fill all required fields.", "warning");
      return;
    }

    try {
      const data = await login(formData.username, formData.password);

      saveAuthData(data);

      pushNotification("Login successful!", "success");

      navigate("/dashboard");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <h1 className="font-hero bold">Login</h1>
      <p className="margin-bottom-lg">Please log in with your credentials</p>

      <div className="form-group">
        <label htmlFor="username" className="font-subtitle">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="username 12345"
          value={formData.username}
          onChange={handleChange}
          required
        />
        {errors.username && <span className="error-msg">{errors.username}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="password" className="font-subtitle">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="password 12345"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {errors.password && <span className="error-msg">{errors.password}</span>}
      </div>

      <button type="submit" className="login-btn btn">
        Login
      </button>
      <div style={{ marginTop: "20px" }}>
        <h3>Notification Test</h3>

        <button
          type="button"
          className="btn"
          onClick={() => pushNotification("Success test message!", "success")}
        >
          Test Success
        </button>

        <button
          type="button"
          className="btn"
          onClick={() => pushNotification("Error test message!", "error")}
          style={{ marginLeft: "10px" }}
        >
          Test Error
        </button>

        <button
          type="button"
          className="btn"
          onClick={() => pushNotification("Warning test message!", "warning")}
          style={{ marginLeft: "10px" }}
        >
          Test Warning
        </button>

        <button
          type="button"
          className="btn"
          onClick={() => pushNotification("Info test message!", "info")}
          style={{ marginLeft: "10px" }}
        >
          Test Info
        </button>
      </div>
    </form>
  );
}
