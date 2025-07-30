import React, { useState, useEffect } from "react";
import "./CreateBudgetForm.css";

const CreateBudgetForm = ({ onBudgetUpdated, budget }) => {
  const [formData, setFormData] = useState({
    name: "",
    monthlyIncome: "",
    startDate: "",
    endDate: "",
    categories: {
      food: "",
      transportation: "",
      shopping: "",
      bills: "",
      entertainment: "",
      education: "",
      other: "",
    },
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (budget) {
      setFormData({
        name: budget.name || "",
        monthlyIncome: budget.monthlyIncome?.toString() || "",
        startDate: budget.startDate || "",
        endDate: budget.endDate || "",
        categories: {
          food: budget.categories.food?.toString() || "",
          transportation: budget.categories.transportation?.toString() || "",
          shopping: budget.categories.shopping?.toString() || "",
          bills: budget.categories.bills?.toString() || "",
          entertainment: budget.categories.entertainment?.toString() || "",
          education: budget.categories.education?.toString() || "",
          other: budget.categories.other?.toString() || "",
        },
      });
    }
  }, [budget]);

  const handleChange = (e) => {
  const { name, value } = e.target;

  let updatedFormData = { ...formData };

  if (name in formData.categories) {
    updatedFormData.categories[name] = value === "" ? "" : Math.max(0, Number(value)).toString();
  } else if (name === "monthlyIncome") {
    updatedFormData[name] = value === "" ? "" : Math.max(0, Number(value)).toString();
  } else {
    updatedFormData[name] = value;
  }

  setFormData(updatedFormData);

  // ✅ Live date validation with updated values
  if ((name === "endDate" || name === "startDate") && updatedFormData.startDate && updatedFormData.endDate) {
    const start = new Date(updatedFormData.startDate);
    const end = new Date(updatedFormData.endDate);

    if (end < start) {
      setErrors((prev) => ({ ...prev, endDate: "End date must be after the start date" }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.endDate;
        return newErrors;
      });
    }
  }
};


  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Budget name is required";
    if (!formData.monthlyIncome) newErrors.monthlyIncome = "Monthly income is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    
    Object.entries(formData.categories).forEach(([category, value]) => {
      if (!value) newErrors[category] = `${category} allocation is required`;
    });

    const totalCategories = Object.values(formData.categories)
      .reduce((sum, value) => sum + (Number(value) || 0), 0);
    const monthlyIncome = Number(formData.monthlyIncome) || 0;

    if (totalCategories > monthlyIncome) {
      newErrors.categories = `Total budget categories (${totalCategories.toFixed(2)}) cannot exceed monthly income (${monthlyIncome.toFixed(2)})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    console.log("Token being sent:", token);
    console.log("User ID being sent:", userId);

    if (!token) {
      setErrors({ auth: "Unauthorized: Please log in." });
      return;
    }

    if (!userId) {
      setErrors({ auth: "User ID is missing. Please log in again." });
      return;
    }

    const submissionData = {
      userId, // ✅ Ensure user ID is included
      ...formData,
      monthlyIncome: Number(formData.monthlyIncome),
      categories: Object.fromEntries(
        Object.entries(formData.categories).map(([key, value]) => [key, Number(value)])
      ),
    };
    console.log("🚀 Submission Data:", JSON.stringify(submissionData, null, 2)); 

    try {
      const url = budget
        ? `https://et-backend-7br8.onrender.com/api/budgets/${budget._id}`
        : "https://et-backend-7br8.onrender.com/api/budgets";
      const method = budget ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✅ Send the token
        },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save budget");
      }

      onBudgetUpdated(data);
      alert(`Budget ${budget ? "updated" : "created"} successfully!`);
    } catch (err) {
      console.error("❌ Error creating budget:", err.message);
      setErrors({ submit: err.message });
    }
  };

  // Calculate total category amount and remaining amount
  const totalCategories = Object.values(formData.categories)
    .reduce((sum, value) => sum + (Number(value) || 0), 0);
  const monthlyIncome = Number(formData.monthlyIncome) || 0;
  const remainingAmount = monthlyIncome - totalCategories;

  return (
    <div className="budget-form-container">
      <h2>{budget ? "Edit Budget" : "Create Custom Budget"}</h2>
      {errors.auth && <p className="error">{errors.auth}</p>}
      {errors.submit && <p className="error">{errors.submit}</p>}
      <form onSubmit={handleSubmit} className="budget-form">
        <label>
          Budget Name
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </label>
        <label>
          Monthly Income
          <input
            type="number"
            name="monthlyIncome"
            value={formData.monthlyIncome}
            onChange={handleChange}
            min="0"
            required
          />
          {errors.monthlyIncome && <span className="error">{errors.monthlyIncome}</span>}
        </label>
        <label>
          Start Date
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
          {errors.startDate && <span className="error">{errors.startDate}</span>}
        </label>
        <label>
          End Date
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
          {errors.endDate && <span className="error">{errors.endDate}</span>}
        </label>
        <h3>Budget Categories (Total: ${totalCategories.toFixed(2)})</h3>
        <table className="budget-categories-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Allocation</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(formData.categories).map((category) => (
              <tr key={category}>
                <td>{category.charAt(0).toUpperCase() + category.slice(1)}</td>
                <td>
                  <input
                    type="number"
                    name={category}
                    value={formData.categories[category]}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                  {errors[category] && <span className="error">{errors[category]}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {errors.categories && <span className="error total-error">{errors.categories}</span>}
        <button type="submit" className="create-budget-btn">
          {budget ? "Update Budget" : "Create Budget"} (Remaining: ${remainingAmount.toFixed(2)})
        </button>
      </form>
    </div>
  );
};

export default CreateBudgetForm;
