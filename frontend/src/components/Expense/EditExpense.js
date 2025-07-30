import React, { useState, useEffect } from "react";
import axios from "axios";
//import "../../styles/EditExpense.css";

const EditExpense = ({ expense, onClose, onUpdateExpense }) => {
  const [formData, setFormData] = useState({ ...expense });
  const [showDropdown, setShowDropdown] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  // Retrieve categories from local storage or set defaults
  const getCategoriesFromLocalStorage = () => {
    const savedCategories = localStorage.getItem("categories");
    return savedCategories
      ? JSON.parse(savedCategories)
      : ["Food", "Travel", "Entertainment", "Bills", "Shopping"];
  };

  const [categories, setCategories] = useState(getCategoriesFromLocalStorage());

  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    if (category === "custom") {
      setShowDropdown(false);
    } else {
      setFormData({ ...formData, category });
      setShowDropdown(false);
    }
  };

  // Handle adding a custom category
  const handleAddCustomCategory = () => {
    if (customCategory.trim() && !categories.includes(customCategory)) {
      const newCategories = [...categories, customCategory];
      setCategories(newCategories);
      setFormData({ ...formData, category: customCategory });
      setCustomCategory("");
      setShowDropdown(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token"); // Get user token
      const response = await axios.put(
        `https://et-backend-7br8.onrender.com/api/expenses/${expense._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } } // Fix missing Bearer
      );
  
      if (response.data && response.data.expense) {
        onUpdateExpense(response.data.expense); // ✅ Use the correct key from API response
        onClose(); // Close modal after update
      } else {
        console.error("❌ API Response does not contain updated expense:", response.data);
        alert("❌ Failed to update expense. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error updating expense:", error.response?.data || error.message);
      alert("❌ Failed to update expense. Please try again.");
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Edit Expense</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <div className="category-dropdown">
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                onClick={() => setShowDropdown(!showDropdown)}
                className="form-control category-input"
                placeholder="Select or enter category"
                required
              />
              <span className="dropdown-icon" onClick={() => setShowDropdown(!showDropdown)}>
                ▼
              </span>
              {showDropdown && (
                <ul className="dropdown-menu">
                  {categories.map((cat, index) => (
                    <li key={index} onClick={() => handleCategorySelect(cat)}>
                      {cat}
                    </li>
                  ))}
                  <li>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="form-control custom-category-input"
                      placeholder="Enter custom category"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCategory}
                      className="btn btn-primary btn-sm"
                    >
                      Add
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Save
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditExpense;
