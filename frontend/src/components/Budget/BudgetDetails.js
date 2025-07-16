import React from "react";
import "./BudgetDetails.css";

const BudgetDetails = ({ budget }) => {
  if (!budget) return null;

  console.log("Spent Data:", budget.spent); // Debugging

  const spentData = budget.spent || {};

  return (
    <div className="budget-details">
      <h2>Budget Details</h2>
      <p><strong>Monthly Income:</strong> ${budget.monthlyIncome.toFixed(2)}</p>
      <p><strong>Start Date:</strong> {new Date(budget.startDate).toLocaleDateString()}</p>
      <p><strong>End Date:</strong> {new Date(budget.endDate).toLocaleDateString()}</p>

      <h3>Budget Categories</h3>
      <table className="budget-categories-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Allocated Amount</th>
            <th>Spent Amount</th>
            <th>Remaining Amount</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(budget.categories).map(([category, allocatedAmount]) => {
            const spentAmount = spentData[category] !== undefined ? spentData[category] : 0;
            const remainingAmount = allocatedAmount - spentAmount;

            return (
              <tr key={category}>
                <td>{category.charAt(0).toUpperCase() + category.slice(1)}</td>
                <td>${allocatedAmount.toFixed(2)}</td>
                <td>${spentAmount.toFixed(2)}</td>
                <td style={{ color: remainingAmount < 0 ? "red" : "black" }}>
                  ${remainingAmount.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BudgetDetails;