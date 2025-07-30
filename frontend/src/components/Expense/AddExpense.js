import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddExpense.css';

const AddExpense = ({ onClose, onAddExpense, selectedGroup }) => {
  const [formData, setFormData] = useState({
    date: '',
    category: '',
    amount: '',
    description: '',
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  // Load categories
  const getCategoriesFromLocalStorage = () => {
    const savedCategories = localStorage.getItem('categories');
    return savedCategories ? JSON.parse(savedCategories) : [
      'Food', 'Travel', 'Entertainment', 'Bills', 'Shopping'
    ];
  };

  const [categories, setCategories] = useState(getCategoriesFromLocalStorage());

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategorySelect = (category) => {
    setFormData({ ...formData, category });
    setShowDropdown(false);
  };

  const handleAddCustomCategory = () => {
    if (customCategory.trim() && !categories.includes(customCategory)) {
      const newCategories = [...categories, customCategory];
      setCategories(newCategories);
      setFormData({ ...formData, category: customCategory });
      setCustomCategory('');
      setShowDropdown(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.amount || isNaN(formData.amount)) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      const expenseData = {
        amount: Number(formData.amount),
        category: formData.category,
        description: formData.description || "",
        date: formData.date || new Date().toISOString().split('T')[0],
        ...(selectedGroup && { groupId: selectedGroup }) // Include groupId if in group context
      };

      console.log('Submitting expense:', expenseData);

      const response = await axios.post('https://et-backend-7br8.onrender.com/api/expenses', expenseData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      onAddExpense(response.data);
      onClose();
    } catch (error) {
      console.error('Error adding expense:', {
        message: error.message,
        response: error.response?.data,
        config: error.config
      });
      alert(error.response?.data?.message || "Failed to add expense");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>Add New Expense</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="form-control"
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
                      placeholder="New category"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCategory}
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
              placeholder="0.00"
              step="0.01"
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
              placeholder="What was this for?"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Save Expense
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;