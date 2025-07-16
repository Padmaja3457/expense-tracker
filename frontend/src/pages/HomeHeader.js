import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomeHeader.css";

const HomeHeader = ({ isLoggedIn, switchPage, setCurrentPage }) => {
  const navigate = useNavigate();

  return (
    <header className="home-header">
      <div className="logo-container">
        <img src="/logo.jpg" alt="Logo" className="logo" />
        <div className="title">Expense Tracker</div>
      </div>

      <nav className="nav">
        <a href="#home" onClick={() => setCurrentPage("home")}>
          Home
        </a>
        <a href="#about" onClick={() => setCurrentPage("aboutus")}>
          About Us
        </a>
        <a href="#contact" onClick={() => setCurrentPage("contactus")}>
          Contact Us
        </a>

        {!isLoggedIn && (
          <div className="auth-buttons">
            <button
              onClick={() => switchPage("login")}
              className="btn btn-primary me-2"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/registration-type")}
              className="btn btn-primary"
            >
              Register
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default HomeHeader;
