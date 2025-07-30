import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    try {
      const response = await axios.post("https://et-backend-7br8.onrender.com/send-otp", { email });
      alert(response.data.message);
      setStep(2);
    } catch (error) {
      alert("Error sending OTP. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post("https://et-backend-7br8.onrender.com/verify-otp", { email, otp });
      alert(response.data.message);
      setStep(3);
    } catch (error) {
      alert("Invalid OTP. Please try again.");
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await axios.post("https://et-backend-7br8.onrender.com/reset-password", { email, newPassword });
      alert(response.data.message);
      navigate("/login");
    } catch (error) {
      alert("Error resetting password. Please try again.");
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      {step === 1 && (
        <div className="input-container">
          <label>Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button onClick={handleSendOtp}>Send OTP</button>
        </div>
      )}
      {step === 2 && (
        <div className="input-container">
          <label>Enter OTP</label>
          <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required />
          <button onClick={handleVerifyOtp}>Verify OTP</button>
        </div>
      )}
      {step === 3 && (
        <div className="input-container">
          <label>New Password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <button onClick={handleResetPassword}>Reset Password</button>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
