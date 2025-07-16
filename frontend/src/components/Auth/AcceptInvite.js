import React from "react";
import { useNavigate } from "react-router-dom";

const AcceptInvite = () => {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate("/login");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Welcome to the Group!</h2>
      <p>Your account is already set up. Check your email for your credentials.</p>
      <p>You can log in now using the details sent to your email.</p>
      <button onClick={handleGoToLogin} style={{ padding: "10px 20px", fontSize: "16px" }}>Go to Login</button>
    </div>
  );
};

export default AcceptInvite;