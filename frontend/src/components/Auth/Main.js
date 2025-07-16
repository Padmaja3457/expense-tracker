import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css";

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🔹 Submitted Username:", credentials.username);
    console.log("🔹 Submitted Password:", credentials.password);
    setError(""); // Clear previous errors

    if (!credentials.username || !credentials.password) {
      setError("Username and Password are required.");
      return;
    }

    try {
      // Clear previous user data in localStorage before saving new data
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("email");
      localStorage.removeItem("groupId"); // If you store groupId
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      console.log("Login Response:", data);
      console.log("🔍 Full Backend Response:", data);

      if (response.ok) {
        // Check if data.user exists before accessing its properties
        if (data && data.token && data.user) {
          console.log("✅ User ID:", data.user._id);
          localStorage.setItem("userId", data.user._id); 
          localStorage.setItem("token", data.token);
          localStorage.setItem("username", data.user.username);
          localStorage.setItem("email", data.user.email);
          console.log("Redirecting to dashboard...");
          navigate("/dashboard");
        } else {
          setError("Invalid response from the server. Please try again.");
        }
      } else {
        setError(data.message || "Login failed. Please try again."); // Show error message
      }
    } catch (error) {
      console.error("Login Error:", error); // Log the error for debugging
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <div className="form-image">
        <img src="/login.jpeg" alt="Side Visual" />
      </div>
      <div className="form-content">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="forgot-password">
            <button type="button" className="forgot-password-link" onClick={() => navigate("/forgot-password")}>
              Forgot Password?
            </button>
          </div>
          <button type="submit" className="button">Login</button>
        </form>
        <div className="alternative-actions">
          <p>
            Don't have an account?{" "}
            <span onClick={() => navigate("/registration-type")} className="text-link">
              Register
            </span>
          </p>
        </div>

    
      </div>
    </div>
  );
};

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      alert(data.message);
      if (response.ok) {
        navigate("/login");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <div className="form-image">
        <img src="/login.jpeg" alt="Side Visual" />
      </div>
      <div className="form-content">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="button">Register</button>
        </form>
        <div className="alternative-actions">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")} className="text-link">
            Login
          </span>
        </div>
      </div>
    </div>
  );
};

export { Login, Register };