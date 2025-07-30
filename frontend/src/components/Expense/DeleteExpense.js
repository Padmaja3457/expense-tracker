import React from "react";
import axios from "axios";
import "./DeleteExpense.css";

const DeleteExpense = ({ expense, onConfirm, onCancel }) => {
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Deleting Expense ID:", expense._id); // Log the expense ID
      const response = await axios.delete(`https://et-backend-7br8.onrender.com/api/expenses/${expense._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Backend Response:", response.data); // Log the backend response
      console.log("Backend Status Code:", response.status); // Log the status code

      if (response.status === 200) {
        onConfirm(expense._id); // Update UI after successful deletion
      } else {
        alert("❌ Failed to delete expense. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      if (error.response) {
        console.error("Backend Response:", error.response.data); // Log the backend error response
      }
      alert("❌ Failed to delete expense. Please try again.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Delete Expense</h2>
        <p>Are you sure you want to delete the following expense?</p>
        <table className="delete-expense-details">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{expense.date}</td>
              <td>{expense.category}</td>
              <td>₹{expense.amount.toFixed(2)}</td>
              <td>{expense.description}</td>
            </tr>
          </tbody>
        </table>
        <div className="button-group">
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteExpense;