import React from "react";
import "./BudgetSummary.css"; // Import separate CSS file

const BudgetSummary = ({ budget }) => {
  // Check if budget and budget.categories exist
  if (!budget || !budget.categories) {
    return <div className="budget-summary no-data"></div>;
  }

  // Calculate totals based on BudgetDetails logic
  const totalAllocated = Object.values(budget.categories).reduce((sum, amount) => sum + amount, 0);
  const totalExpenses = Object.entries(budget.categories).reduce((sum, [category]) => {
    const spentAmount = budget.spent?.[category] ?? 0; // Default to 0 if not specified
    return sum + spentAmount;
  }, 0);
  const totalRemaining = totalAllocated - totalExpenses;
  const isOverspending = totalRemaining < 0;

  return (
    <div className="budget-summary">
      <h3>Budget Summary</h3>
      <div className="summary-items">
        <div className="summary-item">
          <strong>Total Allocated:</strong>
          <span className="amount allocated">${totalAllocated.toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <strong>Total Expenses:</strong>
          <span className="amount expenses">${totalExpenses.toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <strong>Total Remaining:</strong>
          <span className={`amount remaining ${isOverspending ? "negative" : "positive"}`}>
            ${totalRemaining.toFixed(2)}
          </span>
        </div>
      </div>
      {isOverspending && (
        <div className="overspending-alert">
          Overspending Alert: You have exceeded your budget by ₹{Math.abs(totalRemaining).toFixed(2)}!
        </div>
      )}
    </div>
  );
};

export default BudgetSummary;