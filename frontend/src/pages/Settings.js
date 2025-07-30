import React, { useState,useEffect } from "react";
import axios from "axios";
import "./Settings.css";

const Settings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileData, setProfileData] = useState(null); // Changed to null initially
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("User is not authenticated.");
          setLoading(false);
          return;
        }

        const response = await axios.get("https://et-backend-7br8.onrender.com/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
       
        console.log("API Response:", response.data); // Debug log
        
        // Ensure we're setting the correct response structure
        setProfileData({
          username: response.data.user?.username || response.data.username || "",
          email: response.data.user?.email || response.data.email || "",
        });
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError(error.response?.data?.message || "Failed to fetch profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // Don't render form until data is loaded
  if (loading) return <div className="loading-message">Loading profile...</div>;
  if (!profileData) return <div className="error-message">{error || "Profile data not available"}</div>;

  

  const token = localStorage.getItem("token"); // ✅ Get token from localStorage

if (!token) {
  setError("User is not authenticated.");
  return;
}

const headers = {
  Authorization: `Bearer ${token}`,
};

// ✅ Change Password
const handleChangePassword = async (e) => {
  e.preventDefault();
  if (newPassword !== confirmPassword) {
    setError("New password and confirm password do not match.");
    return;
  }

  try {
    const response = await axios.post(
      "https://et-backend-7br8.onrender.com/api/user/change-password",
      { currentPassword, newPassword },
      { headers } // ✅ Include token
    );

    setSuccess(response.data.message);
    setError("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  } catch (error) {
    console.error("Error changing password:", error);
    setError(error.response?.data?.message || "Failed to change password.");
  }
};

// ✅ Edit Profile
const handleEditProfile = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.put(
      "https://et-backend-7br8.onrender.com/api/user/edit-profile",
      profileData,
      { headers } // ✅ Include token
    );

    setSuccess(response.data.message);
    setError("");
  } catch (error) {
    console.error("Error updating profile:", error);
    setError(error.response?.data?.message || "Failed to update profile.");
  }
};

// ✅ Delete Account
const handleDeleteAccount = async () => {
  if (window.confirm("Are you sure you want to delete your account? This action is irreversible.")) {
    try {
      await axios.delete("https://et-backend-7br8.onrender.com/api/user/delete-account", { headers }); // ✅ Include token
      alert("Your account has been deleted.");
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting account:", error);
      setError("Failed to delete account.");
    }
  }
};

  return (
    <div className="settings-container">
      <h2 className="settings-title">Settings</h2>

      {/* Change Password Section */}
      <div className="settings-section">
        <h3>Change Password</h3>
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          <button type="submit" className="save-button">
            Change Password
          </button>
        </form>
      </div>

      {/* Edit Profile Section */}
      <div className="settings-section">
        <h3>Edit Profile</h3>
        <form onSubmit={handleEditProfile}>
          <div className="form-group">
            <label>User name</label>
            <input
              type="text"
              value={profileData.username|| ""}
              onChange={(e) =>
                setProfileData({ ...profileData, username: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={profileData.email|| ""}
              onChange={(e) =>
                setProfileData({ ...profileData, email: e.target.value })
              }
              readOnly
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          <button type="submit" className="save-button">
            Save Profile
          </button>
        </form>
      </div>

      {/* Delete Account Section */}
      <div className="settings-section">
        <h3>Delete Account</h3>
        <p>Warning: This action is irreversible and will permanently delete your account.</p>
        <button className="delete-button" onClick={handleDeleteAccount}>
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Settings;