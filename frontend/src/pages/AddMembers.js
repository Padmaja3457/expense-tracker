import React, { useState, useEffect } from "react";
import axios from "axios";

const AddMembers = () => {
  const [members, setMembers] = useState([{ 
    username: "", 
    email: "", 
    relation: "", 
    password: "" 
  }]);
  const [primaryUser, setPrimaryUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const storedGroupId = localStorage.getItem("groupId");
        
        if (!storedUser || !storedGroupId) {
          throw new Error("User data not found in localStorage");
        }
        
        setPrimaryUser({ 
          ...storedUser, 
          groupId: storedGroupId 
        });
      } catch (err) {
        console.error("Failed to load user data:", err.message);
        setError("Please login again to continue");
      }
    };
    
    loadUserData();
  }, []);

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    setMembers(prev => prev.map((member, i) => 
      i === index ? { ...member, [name]: value } : member
    ));
  };

  const handleAddMember = () => {
    if (members.length < 10) { // Prevent unlimited additions
      setMembers(prev => [...prev, { 
        username: "", 
        email: "", 
        relation: "", 
        password: "" 
      }]);
    }
  };

  const removeMember = (index) => {
    if (members.length > 1) {
      setMembers(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    // Check all required fields are filled
    return members.every(member => 
      member.username && 
      member.email && 
      member.relation && 
      member.password
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!validateForm()) {
      setError("Please fill all fields for each member");
      return;
    }

    if (!primaryUser?.groupId) {
      setError("User session expired. Please login again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/group/add-members", 
        {
          groupId: primaryUser.groupId, // Simplified structure
          newMembers: members          // Changed key to match backend
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      console.log("Members added:", response.data);
      alert(`${members.length} member(s) added successfully!`);
      setMembers([{ username: "", email: "", relation: "", password: "" }]); // Reset form
    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                      error.message || 
                      "Failed to add members";
      console.error("Error:", errorMsg);
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-members-container">
      <h2>Add Members to Group</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {members.map((member, index) => (
          <div key={index} className="member-form">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={member.username}
              onChange={(e) => handleInputChange(index, e)}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={member.email}
              onChange={(e) => handleInputChange(index, e)}
              required
            />
            <input
              type="text"
              name="relation"
              placeholder="Relation (e.g., Child, Spouse)"
              value={member.relation}
              onChange={(e) => handleInputChange(index, e)}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={member.password}
              onChange={(e) => handleInputChange(index, e)}
              required
            />
            {members.length > 1 && (
              <button 
                type="button" 
                onClick={() => removeMember(index)}
                className="remove-btn"
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <div className="form-actions">
          <button 
            type="button" 
            onClick={handleAddMember}
            disabled={members.length >= 10}
          >
            Add Another Member
          </button>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMembers;
