import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./Layout.css";

const Layout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="layout-container">
      {/* Show Sidebar only if not on Home page */}
      {!isHomePage && <Sidebar />}

      <div className="main-layout">
        {/* Only Page Content, No Header Here */}
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
