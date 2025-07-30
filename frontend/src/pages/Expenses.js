import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddExpense from '../components/Expense/AddExpense';
import EditExpense from '../components/Expense/EditExpense';
import DeleteExpense from '../components/Expense/DeleteExpense';
import FilterExpenses from '../components/Expense/FilterExpenses';
import SortExpenses from '../components/Expense/SortExpenses';
import './Expenses.css';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [allocatedBudget, setAllocatedBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [showDeleteExpense, setShowDeleteExpense] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
 

  // Format date to YYYY-MM-DD
  const formatDate = (dateString) => {
    if (!dateString) return ''; // Handle null or undefined dates
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString); // Log invalid dates
      return ''; // Return an empty string for invalid dates
    }
    return date.toISOString().split('T')[0]; // Format valid dates
  };
// ✅ Fetch Selected Budget & Calculate Allocated Amount
  useEffect(() => {
    const storedBudget = localStorage.getItem("selectedBudget");
    if (storedBudget) {
      const parsedBudget = JSON.parse(storedBudget);
      const totalAllocated = Object.values(parsedBudget.categories || {}).reduce((sum, amount) => sum + amount, 0);
      setAllocatedBudget(totalAllocated);
    }
  }, []);

useEffect(() => {
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get('https://et-backend-7br8.onrender.com/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurrentUser(response.data.user);
      
      // If user is in a group, set the group data
      if (response.data.group) {
        setUserGroups([response.data.group]); // Store as array
        let membersList = response.data.group.members.map((member) => ({
          _id: member.user?._id || member._id,
          username: member.username || member.user?.username,
        }));

        // ✅ Ensure the current user is included in the list
        const isCurrentUserInGroup = membersList.some(
          (member) => member._id === response.data.user._id
        );

        if (!isCurrentUserInGroup) {
          membersList.push({
            _id: response.data.user._id,
            username: response.data.user.username || "You",
          });
        }

        setGroupMembers(membersList);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };
  
  fetchUserProfile();
}, []);

useEffect(() => {
  const fetchExpenses = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('Authentication token not found');
        return;
      }

      const params = {};
      if (selectedGroup) params.groupId = selectedGroup;

      if (selectedMember && /^[0-9a-fA-F]{24}$/.test(selectedMember)) {
        params.userId = selectedMember;
      } else if (selectedMember) {
        console.warn("❌ Invalid userId format:", selectedMember);
        setSelectedMember(null); // Reset invalid selection
      }

      console.log("🟢 Fetching Expenses with params:", params);

      const response = await axios.get("https://et-backend-7br8.onrender.com/api/expenses", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      console.log("API Response:", response.data);

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid data format received from server");
      }

      setExpenses(response.data);
      setFilteredExpenses(response.data);
      calculateTotal(response.data);

    } catch (error) {
      console.error("Expense fetch error:", error);
      setError(error.response?.data?.message || "Failed to fetch expenses.");
      setExpenses([]);
      setFilteredExpenses([]);
      setTotalAmount(0);
    } finally {
      setLoading(false);
    }
  };

  if (selectedGroup || !selectedMember) {
    fetchExpenses();
  }
}, [selectedGroup, selectedMember]);


  // Calculate total expenses
  const calculateTotal = (expensesList) => {
    const total = expensesList.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    setTotalAmount(total);
  };
  const totalRemaining = allocatedBudget - totalAmount;
// Add this function to your Expenses component
const handleGroupChange = (groupId) => {
  setSelectedGroup(groupId);
  setSelectedMember(null); // Reset member selection when group changes
  
  // Find the selected group and update members list
  const selectedGroupData = userGroups.find((g) => g._id === groupId);
  
  // Transform members to include both _id and username
  setGroupMembers(selectedGroupData?.members.map(member => ({
    _id: member.user?._id || member._id, // Use user._id if populated, otherwise member._id
    username: member.username || member.user?.username
  })) || []);
};

  // Handle filtering
  const handleFilter = (filteredData) => {
    setFilteredExpenses(filteredData);
    calculateTotal(filteredData);
  };

  // Handle sorting
  const handleSort = (sortedData) => {
    setFilteredExpenses([...sortedData]);
  };

  // Handle adding a new expense
  const addExpenseHandler = async (newExpense) => {
    console.log('New Expense:', newExpense); // Debugging log
  
    const updatedExpense = {
      ...newExpense,
      userId: currentUser._id,  // Attach the logged-in user's ID
      groupId: selectedGroup || null, // Attach groupId if selected, else null
    };
  
    try {
      const token = localStorage.getItem("token");
      const response=await axios.post("https://et-backend-7br8.onrender.com/api/expenses", updatedExpense, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const savedExpense = response.data; 
      // Update UI state
      setExpenses((prev) => [...prev, updatedExpense]);
      setFilteredExpenses((prev) => [...prev, updatedExpense]);
      calculateTotal([...expenses, updatedExpense]);
  
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Failed to add expense. Please try again.");
    }
  };
  

  // Handle updating an expense
  const updateExpenseHandler = (updatedExpense) => {
    if (!updatedExpense || !updatedExpense._id) {
      console.error("❌ Invalid expense update received:", updatedExpense);
      return;
    }
  
    console.log("🟢 Updating expense:", updatedExpense);
  
    const updatedExpenses = expenses.map((expense) =>
      expense._id === updatedExpense._id ? updatedExpense : expense
    );
  
    setExpenses(updatedExpenses);
    setFilteredExpenses(updatedExpenses);
    calculateTotal(updatedExpenses); 
  };
  
  // Handle deleting an expense
  const deleteExpenseHandler = (expenseId) => {
    try {
      console.log('Updating UI after deleting expense ID:', expenseId); // Log the expense ID
      const updatedExpenses = expenses.filter((expense) => expense._id !== expenseId);
      setExpenses(updatedExpenses);
      setFilteredExpenses(updatedExpenses);
      calculateTotal(updatedExpenses);
      setShowDeleteExpense(false);
      setSelectedExpense(null);
    } catch (error) {
      console.error('Error updating UI after deletion:', error);
      alert('Failed to update UI after deletion. Please try again.');
    }
  };

  return (
    <div className="expenses-container">
      <h2 className="expenses-title">Expenses</h2>
  
      {loading ? (
        <p>Loading expenses...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          {/* ✅ Display Allocated Budget Next to Total Expenses */}
          <div className="expenses-summary">
            <div className="total-expenses">Total Expenses: ${totalAmount.toFixed(2)}</div>
            <div className="total-remaining">Total Remaining: ${totalRemaining.toFixed(2)}</div>
            <div className="allocated-budget">Allocated Budget: ${allocatedBudget.toFixed(2)}</div>
          </div>
          
          <div className="group-controls">
            {/* Group Dropdown */}
            <select
              value={selectedGroup || ""}
              onChange={(e) => handleGroupChange(e.target.value)}
              className="group-dropdown"
            >
              <option value="">Personal Expenses</option>
              {userGroups
                .filter((group, index, self) => 
                  index === self.findIndex((g) => g._id === group._id) // Remove duplicates
                )
                .map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
            </select>
  
            {/* Member Dropdown (Only shown if a group is selected) */}
            {selectedGroup && groupMembers.length > 0 && (
              <select
                value={selectedMember || ""}
                onChange={(e) => {
                  const userId = e.target.value;
                  console.log("Selected Member ID:", userId); // Debugging log
  
                  // 🔹 Ensure only valid ObjectId is set
                  if (/^[0-9a-fA-F]{24}$/.test(userId)) {
                    setSelectedMember(userId);
                  } else {
                    console.warn("❌ Invalid userId format:", userId);
                    setSelectedMember(null);
                  }
                }}
                className="member-dropdown"
              >
                <option value="">All Members</option>
                {groupMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.username} {member._id === currentUser?._id && " (You)"}
                  </option>
                ))}
              </select>
            )}
          </div>
  
          {/* Filter & Sort Controls */}
          <div className="expenses-controls">
            <FilterExpenses expenses={expenses} onFilter={handleFilter} />
            <SortExpenses expenses={filteredExpenses} onSort={handleSort} />
          </div>
  
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense._id}>
                  <td>{formatDate(expense.date)}</td>
                  <td>{expense.category}</td>
                  <td>{expense.amount}</td>
                  <td>{expense.description || 'No description'}</td>
                  <td className="action-buttons">
                    {expense.userId === currentUser?._id && (
                      <>
                        <button
                          className="edit-button"
                          onClick={() => {
                            setSelectedExpense(expense);
                            setShowEditExpense(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => {
                            setSelectedExpense(expense);
                            setShowDeleteExpense(true);
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
  
          {/* Show Add Expense Button for Current User if Personal Expenses or the User is in a Group */}
          {console.log('Current user:', currentUser?._id, 'Selected group:', selectedGroup, 'Group members:', groupMembers)}
{/* Show Add Expense Button for Current User */}
{currentUser && (
  (!selectedGroup || // Show for personal expenses (null or empty string)
   (selectedGroup && selectedMember === currentUser._id)
  ) && (
    <button className="add-expense-button" onClick={() => setShowAddExpense(true)}>
      Add New Expense
    </button>
  )
)}
        </>
      )}
  
      {showAddExpense && <AddExpense onClose={() => setShowAddExpense(false)} onAddExpense={addExpenseHandler} />}
      {showEditExpense && <EditExpense expense={selectedExpense} onClose={() => setShowEditExpense(false)} onUpdateExpense={updateExpenseHandler} />}
      {showDeleteExpense && selectedExpense && (
        <DeleteExpense
          expense={selectedExpense}
          onConfirm={deleteExpenseHandler} // Pass the handler
          onCancel={() => setShowDeleteExpense(false)}
        />
      )}
    </div>
  );
  
  
};  

export default Expenses;