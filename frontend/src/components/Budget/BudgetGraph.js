import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./BudgetGraph.css";

const BudgetGraph = ({ budgets }) => {
  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    if (!budgets || budgets.length === 0) return;

    const budget = budgets[0]; // Since only one budget is selected
    if (!budget || !budget.categories || !budget.spent) return;

    // Format data for graph
    const formattedData = Object.entries(budget.categories).map(([category, allocation]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      Allocation: allocation,
      Spending: budget.spent[category] || 0, // ✅ Use actual spending data
    }));

    setGraphData(formattedData);
  }, [budgets]);

  if (!graphData.length) {
    return <div>No data available for graph</div>;
  }

  return (
    <div className="budget-graph-container">
      <h3>Budget vs Spending Overview</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={graphData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip formatter={(value) => `$${value.toFixed(2)}`} labelFormatter={(label) => `Category: ${label}`} />
          <Legend />
          <Bar dataKey="Allocation" fill="#76C7C0" name="Allocated Amount" />
          <Bar dataKey="Spending" fill="#FF758F" name="Actual Spending" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BudgetGraph;
