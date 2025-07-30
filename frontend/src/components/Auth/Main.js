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
      const response = await fetch("https://et-backend-7br8.onrender.com/login", {
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
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    general: "",
  });

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    // Live validation
    if (name === "email") {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(value) ? "" : "Invalid email format",
      }));
    }

    if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(value)
          ? ""
          : "Password must be at least 8 characters with uppercase, lowercase, and a number",
      }));
    }

    if (name === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          value === formData.password ? "" : "Passwords do not match",
      }));
    }

    if (name === "password" || name === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          name === "password" && formData.confirmPassword
            ? formData.confirmPassword === value
              ? ""
              : "Passwords do not match"
            : prev.confirmPassword,
      }));
    }
  };


  const handleInitialSubmit = async (e) => {
    e.preventDefault();
   setErrors((prev) => ({ ...prev, general: "" }));// Clear previous errors
    
const { username, email, password, confirmPassword } = formData;

    if (!username || !email || !password || !confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        general: "All fields are required",
      }));
      return;
    }

    if (errors.email || errors.password || errors.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        general: "Please fix the above errors before submitting.",
      }));
      return;
    }
     try {
      const res = await fetch("https://et-backend-7br8.onrender.com/send-registration-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        setStep(2);
      } else {
        setErrors((prev) => ({ ...prev, general: data.message || "Failed to send OTP" }));
      }
    } catch (err) {
      setErrors((prev) => ({ ...prev, general: "Failed to connect to server" }));
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setErrors((prev) => ({ ...prev, general: "" }));
    const { username, email, password, confirmPassword } = formData;


    if (!otp) {
      setErrors((prev) => ({ ...prev, general: "OTP is required" }));
      return;
    }
   console.log("📤 Sending OTP verification payload:", { username, email, password, otp });

    try {
      const res = await fetch("https://et-backend-7br8.onrender.com/verify-registration-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, otp }),
      });

      const data = await res.json();
      alert(data.message);
      if (res.ok) {
        navigate("/login");
      }
      else {
        setErrors((prev) => ({ ...prev, general: data.message || "Registration failed" }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: "An error occurred. Please try again.",
      }));
    }
  };

  return (
    <div className="form-container">
      <div className="form-image">
        <img src="/login.jpeg" alt="Side Visual" />
      </div>
      <div className="form-content">
        <h2>Register</h2>
        {step === 1 ? (
          <form onSubmit={handleInitialSubmit}>
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
            {errors.email && <div className="error-message">{errors.email}</div>}
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
            {errors.password && <div className="error-message">{errors.password}</div>}
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
            {errors.confirmPassword && (
              <div className="error-message">{errors.confirmPassword}</div>
            )}
          </div>
            {errors.general && <div className="error-message">{errors.general}</div>}
          <button type="submit" className="button">Send OTP</button>
        </form>
         ) : (
           <form onSubmit={handleVerifyAndRegister}>
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            {errors.general && <div className="error-message">{errors.general}</div>}
            <button type="submit" className="button">Verify & Register</button>
          </form>
        )}
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