import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const RegistrationType = () => {
  const navigate = useNavigate();

  return (
    <div className="container-fluid vh-100 d-flex align-items-center">
      <div className="row w-100">
        {/* Left Side - Larger Image */}
        <div className="col-lg-7 col-md-6 p-0">
          <img
            src="/login.jpeg"
            alt="Analytics Dashboard"
            className="img-fluid w-100 h-100"
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* Right Side - Registration Type */}
        <div className="col-lg-5 col-md-6 d-flex flex-column justify-content-center align-items-center">
          <h4 className="mb-4">Choose Registration Type</h4>
          <button
            className="btn btn-primary mb-3 w-50"
            onClick={() => navigate("/register/individual")} // ✅ Navigates to individual registration
          >
            Register as Individual
          </button>
          <button
            className="btn btn-primary w-50"
            onClick={() => navigate("/register/group")} // ✅ Navigates to group registration
          >
            Register as Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationType;
