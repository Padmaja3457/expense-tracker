import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import "./Dashboard.css";

Chart.register(...registerables);

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [budgets, setBudgets] = useState([]);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [savingTip, setSavingTip] = useState("");

  useEffect(() => {
    fetchExpenses();
    fetchBudgets();
    generateSavingTip();
  }, []);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://et-backend-7br8.onrender.com/api/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const expensesData = response.data;
      setExpenses(expensesData);

      const total = expensesData.reduce((sum, expense) => sum + expense.amount, 0);
      setTotalExpenses(total);

      const categoryData = {};
      expensesData.forEach((expense) => {
        categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount;
      });

      setCategoryTotals(categoryData);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://et-backend-7br8.onrender.com/api/budgets", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const budgetData = response.data;
      if (budgetData.length > 0) {
        setBudgets(budgetData[0].categories);
        setMonthlyIncome(budgetData[0].monthlyIncome);
      }
    } catch (err) {
      console.error("Error fetching budgets:", err);
    }
  };

  const generateSavingTip = () => {
    const tips = [
      "Track your expenses daily to identify unnecessary spending.",
      "Try meal prepping instead of eating out to save money.",
      "Use cashback and reward programs on purchases.",
      "Set monthly spending limits to avoid overspending.",
      "Consider buying second-hand items instead of new ones.",
    ];
    setSavingTip(tips[Math.floor(Math.random() * tips.length)]);
  };

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>

      <div className="summary-cards">
        <div className="card balance">
          <h3>Current Balance</h3>
          <p>${(monthlyIncome - totalExpenses).toFixed(2)}</p>
        </div>
        <div className="card income">
          <h3>Total Income</h3>
          <p>${monthlyIncome.toFixed(2)}</p>
        </div>
        <div className="card expenses">
          <h3>Total Expenses</h3>
          <p>${totalExpenses.toFixed(2)}</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="chart-container">
        <h3>Allocation vs Spending</h3>
        <Bar
          data={{
            labels: Object.keys(categoryTotals),
            datasets: [
              {
                label: "Allocated ($)",
                data: Object.keys(categoryTotals).map(
                  (category) => budgets[category] || 0
                ),
                backgroundColor: "#76C7C0",
              },
              {
                label: "Spent ($)",
                data: Object.values(categoryTotals),
                backgroundColor: "#FF758F",
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: { legend: { position: "top" } },
          }}
        />
      </div>

      {/* Donut Charts */}
      <div className="donut-charts">
        {Object.keys(categoryTotals).map((category, index) => {
          const allocated = budgets[category] || 0;
          const spent = categoryTotals[category];
          const remaining = Math.max(allocated - spent, 0);

          return (
            <div key={index} className="donut-chart">
              <h4>{category}</h4>
              <Doughnut
                data={{
                  labels: ["Spent", "Remaining"],
                  datasets: [
                    {
                      data: [spent, remaining],
                      backgroundColor: ["#FF6384", "#4CAF50"],
                    },
                  ],
                }}
                options={{ responsive: true, plugins: { legend: { position: "bottom" } } }}
              />
            </div>
          );
        })}
      </div>

      {/* Today's Spendings */}
      <div className="today-spending">
        <h3>Today's Spendings</h3>
        <ul>
          {expenses
            .slice()
            .reverse()
            .slice(0, 5)
            .map((expense) => (
              <li key={expense._id}>
                <span>{expense.category}</span>
                <span>${expense.amount}</span>
              </li>
            ))}
        </ul>
      </div>

      {/* Saving Tip */}
      <div className="saving-tip">
        <h3>Save More Money</h3>
        <p>{savingTip}</p>
      </div>
    </div>
  );
};

export default Dashboard;
