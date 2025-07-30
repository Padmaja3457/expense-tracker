import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaUsers, FaEnvelope, FaUserShield } from "react-icons/fa";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get("https://et-backend-7br8.onrender.com/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Response from backend:", response.data);
        setUser(response.data.user);
        setGroup(response.data.group); // Store group details
      } catch (error) {
        console.error("❌ Error fetching user profile:", error.response?.data || error.message);
        setError("Failed to fetch profile data. Please try again.");
      }
    };

    fetchUserProfile();
  }, [navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error-message">❌ Error: {error}</div>;
  }

  return (
<div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="avatar">
          {user.profileImage ? (
            <img src={user.profileImage} alt="Profile" />
          ) : (
            <div className="avatar-placeholder">
              {user.username[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="user-info">
          <h2>{user.username}</h2>
          <p><FaEnvelope /> {user.email}</p>
        </div>
      </div>

      {/* Group Info */}
      {group && (
        <div className="group-card">
          <h3><FaUsers /> Group: {group.name}</h3>
          <p><FaUserShield /> Primary User: {group.primaryUser.username} ({group.primaryUser.email})</p>

          <h4>Members:</h4>
          {group.members.length > 0 ? (
            <ul className="member-list">
              {group.members.map((member, index) => (
                <li key={index}>
                  <FaUser /> {member.username} ({member.email}) - {member.relation}
                </li>
              ))}
            </ul>
          ) : (
            <p>No members found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
