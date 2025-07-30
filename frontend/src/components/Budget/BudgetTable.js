import React, { useState, useEffect } from "react";
import "./BudgetTable.css";
import BudgetDetails from "./BudgetDetails";
import CreateBudgetForm from "./CreateBudgetForm";
import BudgetGraph from "./BudgetGraph";
import BudgetSummary from "./BudgetSummary";

const BudgetTable = () => {
  const [budgets, setBudgets] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null); // For BudgetDetails
  const [selectedBudgetHolder, setSelectedBudgetHolder] = useState(null); // For BudgetGraph and BudgetSummary
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [modalContent, setModalContent] = useState(null);
  const [isPrimaryUser, setIsPrimaryUser] = useState(false); // 🔹 New state to track primary user
  const [isInGroup, setIsInGroup] = useState(false);

  // ✅ Fetch the user's role (primary user or member)
  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("🚨 No auth token found!");
        return;
      }
  
      const response = await fetch("https://et-backend-7br8.onrender.com/api/user/profile", { // ✅ Use your existing endpoint
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
  
      const data = await response.json();
  
      // ✅ Check if the logged-in user is the primary user
      if (data.group) {
  setIsInGroup(true);
  setIsPrimaryUser(data.user._id === data.group.primaryUser._id);
} else {
  setIsInGroup(false);
  setIsPrimaryUser(false); // Individual user, no group
}

    } catch (err) {
      console.error("❌ Error fetching user profile:", err);
    }
  };
  
  // ✅ Fetch budgets and check if the user is the primary user
  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchBudgets = async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("🚨 No auth token found!");
            return;
        }

        // ✅ Get selected budget ID from localStorage
        const storedBudget = localStorage.getItem("selectedBudget");
        const selectedBudgetId = storedBudget ? JSON.parse(storedBudget)._id : null;

        const response = await fetch(`https://et-backend-7br8.onrender.com/api/budgets?selectedBudgetId=${selectedBudgetId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log("📊 Fetched Budget Data:", data);
        setBudgets(data); // ✅ Update state with all budgets

        // ✅ Restore selected budget if it still exists
        if (storedBudget) {
            const parsedBudget = JSON.parse(storedBudget);
            const matchedBudget = data.find((b) => b._id === parsedBudget._id);
            if (matchedBudget) {
                setSelectedBudgetHolder(matchedBudget); // ✅ Restore and fetch updated version
            } else {
                localStorage.removeItem("selectedBudget"); // ✅ Clear if budget no longer exists
            }
        }
    } catch (err) {
        console.error("❌ Error fetching budgets:", err);
    }
};

  // Fetch budgets from the API
  useEffect(() => {

    fetchBudgets();
}, []); // ✅ Runs once when component mounts



const handleDetails = (id) => {
  if (!selectedBudgetHolder) {  // ✅ Ensure a budget is selected first
      alert("Please select a budget first to view details.");
      return;
  }

  const budget = budgets.find((b) => b._id === id);
  setSelectedBudget(budget);
  setModalContent(<BudgetDetails budget={budget} />);
  setShowCreateForm(false);
};


  const handleEdit = (id) => {
    const budget = budgets.find((b) => b._id === id);
    setEditingBudget(budget);
    setModalContent(<CreateBudgetForm budget={budget} onBudgetUpdated={handleAddBudgetToList} />);
    setShowCreateForm(true);
  };

  const handleDelete = async (id) => {
    try {
        const token = localStorage.getItem("token"); // ✅ Get token from storage

        if (!token) {
            alert("No token found. Please log in again.");
            return;
        }

        console.log("🛑 Deleting Budget ID:", id);
        console.log("🔹 Sending Token:", token); // Debugging

        const response = await fetch(`https://et-backend-7br8.onrender.com/api/budgets/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // ✅ Add Authorization header
            },
        });

        const result = await response.json();
        console.log("🛑 Server Response:", result);

        if (response.ok) {
            setBudgets(budgets.filter((budget) => budget._id !== id));
            if (selectedBudget?._id === id) {
                setSelectedBudget(null);
                setModalContent(null);
            }
            if (selectedBudgetHolder?._id === id) {
                setSelectedBudgetHolder(null);
            }
            alert("✅ Budget deleted successfully!");
        } else {
            alert(`❌ Failed to delete budget: ${result.message}`);
        }
    } catch (err) {
        console.error("❌ Error deleting budget:", err);
        alert("Error deleting budget.");
    }
};

  const handleAddBudgetToList = (updatedBudget) => {
    const budgetWithDefaultSpending = {
      ...updatedBudget,
      spent: updatedBudget.spent || Object.fromEntries(
        Object.keys(updatedBudget.categories).map(category => [category, 0])
      )
    };

    // Update the budgets list
    setBudgets((prevBudgets) =>
      prevBudgets.some(b => b._id === budgetWithDefaultSpending._id)
        ? prevBudgets.map((b) => (b._id === budgetWithDefaultSpending._id ? budgetWithDefaultSpending : b))
        : [...prevBudgets, budgetWithDefaultSpending]
    );

    // Update selectedBudgetHolder if it matches the updated budget
    if (selectedBudgetHolder && selectedBudgetHolder._id === budgetWithDefaultSpending._id) {
      setSelectedBudgetHolder(budgetWithDefaultSpending);
      // If BudgetGraph or BudgetSummary is open, update modal content
      if (modalContent && (modalContent.type === BudgetGraph || modalContent.type === BudgetSummary)) {
        setModalContent(
          modalContent.type === BudgetGraph
            ? <BudgetGraph budgets={[budgetWithDefaultSpending]} />
            : <BudgetSummary budget={budgetWithDefaultSpending} />
        );
      }
    }

    // Update selectedBudget if it matches the updated budget
    if (selectedBudget && selectedBudget._id === budgetWithDefaultSpending._id) {
      setSelectedBudget(budgetWithDefaultSpending);
      // If BudgetDetails is open, update modal content
      if (modalContent && modalContent.type === BudgetDetails) {
        setModalContent(<BudgetDetails budget={budgetWithDefaultSpending} />);
      }
    }

    setShowCreateForm(false);
    setEditingBudget(null);
    setModalContent(null); // Close the edit form modal
  };

  const handleAddNewBudget = () => {
    setEditingBudget(null);
    setModalContent(<CreateBudgetForm onBudgetUpdated={handleAddBudgetToList} />);
    setShowCreateForm(true);
    setSelectedBudget(null);
  };

  const handleShowGraph = () => {
    if (!selectedBudgetHolder) {
      alert("Please select a budget holder first.");
      return;
    }
    if (modalContent && modalContent.type === BudgetGraph) {
      setModalContent(null);
    } else {
      setModalContent(<BudgetGraph budgets={[selectedBudgetHolder]} />);
    }
  };

  const handleShowSummary = () => {
    if (!selectedBudgetHolder) {
      alert("Please select a budget first to view summary.");
      return;
    }
    if (modalContent && modalContent.type === BudgetSummary) {
      setModalContent(null);
    } else {
      setModalContent(<BudgetSummary budget={selectedBudgetHolder} />);
    }
  };

  const closeModal = () => {
    setModalContent(null);
    setShowCreateForm(false);
    setEditingBudget(null);
    setSelectedBudget(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const handleSelectBudget = (budget) => {
    setSelectedBudgetHolder(budget);  
    localStorage.setItem("selectedBudget", JSON.stringify(budget)); // ✅ Save to localStorage
    fetchBudgets();
};


  return (
    <div className="container">
      <h2>Your Budgets</h2>
       
      <div className="button-group">
      {(isPrimaryUser || !isInGroup) && (
  <button className="action-btn add-budget-btn" onClick={handleAddNewBudget}>
    Add New Budget
  </button>
)}
        <button className="action-btn graph-btn" onClick={handleShowGraph}>
          {modalContent && modalContent.type === BudgetGraph ? "Hide Graph" : "Show Graph"}
        </button>
        <button className="action-btn summary-btn" onClick={handleShowSummary}>
          {modalContent && modalContent.type === BudgetSummary ? "Hide Summary" : "Show Summary"}
        </button>
      </div>
      <div className={`table-wrapper ${modalContent ? "blurred" : ""}`}>
        <table className="budget-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Budget Name</th>
              <th>Monthly Income</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Details</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((budget) => (
              <tr key={budget._id}>
                <td>
                  <input
                    type="radio"
                    name="budgetSelect"
                    checked={selectedBudgetHolder?._id === budget._id}
                    onChange={() => handleSelectBudget(budget)}
                  />
                </td>
                <td>{budget.name}</td>
                <td>{budget.monthlyIncome.toFixed(2)}</td>
                <td>{formatDate(budget.startDate)}</td>
                <td>{formatDate(budget.endDate)}</td>
                <td>
                  <button className="details-btn" onClick={() => handleDetails(budget._id)}>
                    Details
                  </button>
                </td>
                {(isPrimaryUser || !isInGroup) && (
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(budget._id)}>
                      Edit
                    </button>
                  </td>
                )}
                {(isPrimaryUser || !isInGroup) && (
                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(budget._id)}>
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalContent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={closeModal}>×</button>
            {modalContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetTable; 
