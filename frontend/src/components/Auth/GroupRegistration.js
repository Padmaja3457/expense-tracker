import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./GroupRegistration.css";

const GroupRegistration = () => {
  const [numMembers, setNumMembers] = useState(2);
  const [primaryUser, setPrimaryUser] = useState({ username: "", email: "", password: "" });
  const [members, setMembers] = useState([
    { username: "", email: "", password: "", relation: "" },
    { username: "", email: "", password: "", relation: "" },
  ]);

  const navigate = useNavigate();

  const handleNumMembersChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 0) value = 0;
    setNumMembers(value);

    if (value > members.length) {
      const newMembers = [...members];
      while (newMembers.length < value) {
        newMembers.push({ username: "", email: "", password: "", relation: "" });
      }
      setMembers(newMembers);
    } else {
      setMembers(members.slice(0, value));
    }
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...members];
    updatedMembers[index][field] = value;
    setMembers(updatedMembers);
  };

  const handlePrimaryChange = (field, value) => {
    setPrimaryUser({ ...primaryUser, [field]: value });
  };

  const handleRegisterClick = async () => {
    try {
      const response = await axios.post("https://et-backend-7br8.onrender.com/register-group", {
        primaryUser,
        members,
      });

      console.log(response.data);
      alert("✅ Group registered successfully! Credentials sent to all members.");
      navigate("/login");
    } catch (error) {
      console.error("❌ Group registration failed:", error);
      alert("❌ Error registering group");
    }
  };

  return (
    <div className="container-fluid">
      <div className="container group-registration-container">
        <h4 className="mb-4 text-dark">Group Registration/Add Members</h4>

        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Primary User Name</label>
            <input type="text" className="form-control" value={primaryUser.username} onChange={(e) => handlePrimaryChange("username", e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={primaryUser.email} onChange={(e) => handlePrimaryChange("email", e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={primaryUser.password} onChange={(e) => handlePrimaryChange("password", e.target.value)} />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-3">
            <label className="form-label">No. of Members</label>
            <input type="number" className="form-control" value={numMembers} onChange={handleNumMembersChange} />
          </div>
        </div>

        {members.map((member, index) => (
          <div className="row mb-3" key={index}>
            <div className="col-md-3">
              <label className="form-label">Member {index + 1} Name</label>
              <input type="text" className="form-control" value={member.username} onChange={(e) => handleMemberChange(index, "username", e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={member.email} onChange={(e) => handleMemberChange(index, "email", e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" value={member.password} onChange={(e) => handleMemberChange(index, "password", e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Relation</label>
              <input type="text" className="form-control" value={member.relation} onChange={(e) => handleMemberChange(index, "relation", e.target.value)} />
            </div>
          </div>
        ))}

        <div className="text-center">
          <button className="register-btn" onClick={handleRegisterClick}>Register</button>
        </div>
      </div>
    </div>
  );
};

export default GroupRegistration;
