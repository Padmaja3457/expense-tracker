import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { FaBell } from "react-icons/fa";

const Sidebar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <div className="sidebar">
      <div className="logo-container">
        <img src="/applogo.jpg" alt="Expense Tracker Logo" className="sidebar-logo" />
        <h2 className="sidebar-title">Expense Tracker</h2>
      </div>
      <ul className="sidebar-menu">
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/expenses" className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}>
            Expenses
          </NavLink>
        </li>
        <li>
          <NavLink to="/budgets" className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}>
            Budgets
          </NavLink>
        </li>
        <li>
          <NavLink to="/analytics" className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}>
            Analytics
          </NavLink>
        </li>

        {/* Profile Link */}
        <li>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}>
            Profile
          </NavLink>
        </li>

        <li>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}>
            Settings
          </NavLink>
        </li>
     
        <li>
  <NavLink to="/notifications" className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}>
    <FaBell style={{ marginRight: "5px" }} />
    Notifications
  </NavLink>
</li>


        {/* Logout Button */}
        <li className="menu-item" onClick={handleLogout}>
          Logout
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
