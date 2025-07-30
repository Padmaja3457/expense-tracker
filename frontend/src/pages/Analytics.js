import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie, Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './Analytics.css';

const Analytics = () => {
  const [expenses, setExpenses] = useState([]);
  
  const [userGroups, setUserGroups] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState('last7days'); // Default filter
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedChart, setSelectedChart] = useState('breakdown'); // Default chart
  const [selectedGroup, setSelectedGroup] = useState(null); // New state for selected group
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null); // For individual member analytics

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://et-backend-7br8.onrender.com/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCurrentUser(res.data.user);

        const groups = res.data.groups || (res.data.group ? [res.data.group] : []);
        setUserGroups(groups);

        if (groups.length > 0) {
          const firstGroup = groups[0];
          const members = firstGroup.members.map((m) => ({
            _id: m.user?._id || m._id,
            username: m.username || m.user?.username,
          }));

          if (!members.find((m) => m._id === res.data.user._id)) {
            members.push({ _id: res.data.user._id, username: res.data.user.username || 'You' });
          }

          setGroupMembers(members);
          setSelectedGroup(firstGroup._id);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, []);


  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = localStorage.getItem('token');
        const params = {};
        if (selectedGroup) params.groupId = selectedGroup;
        if (selectedMember && /^[0-9a-fA-F]{24}$/.test(selectedMember)) {
          params.userId = selectedMember;
        }

        const response = await axios.get('https://et-backend-7br8.onrender.com/api/expenses', {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });

        setExpenses(response.data || []);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      }
    };

    fetchExpenses();
  }, [selectedGroup, selectedMember]);
  // Function to filter expenses based on selected time range
  const filterExpenses = () => {
    const now = new Date();
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      if (filter === 'last7days') {
        return (now - expenseDate) / (1000 * 60 * 60 * 24) <= 7;
      } else if (filter === 'thisMonth') {
        return (
          expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() === now.getFullYear()
        );
      } else if (filter === 'thisYear') {
        return expenseDate.getFullYear() === now.getFullYear();
      } else if (filter === 'custom' && startDate && endDate) {
        return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
      }
      return true; // Default: All time
    });
  };

  const filteredExpenses = filterExpenses();

  // Process filtered expenses for chart data
  const categorizedExpenses = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});
   // Grouped by member (For group-level analytics)
   const groupCategorizedExpenses = filteredExpenses.reduce((acc, expense) => {
    const memberId = expense.userId;
     acc[memberId] = acc[memberId] || {};
    acc[memberId][expense.category] = (acc[memberId][expense.category] || 0) + expense.amount;
    return acc;
  }, {});
  // Compare total expenses per member
const memberExpenseTotals = groupMembers.map((member) => {
  const memberExpenses = groupCategorizedExpenses[member._id] || {};
  const total = Object.values(memberExpenses).reduce((sum, val) => sum + val, 0);
  return { name: member.username, total };
});

const compareBarData = {
  labels: memberExpenseTotals.map((m) => m.name),
  datasets: [
    {
      label: 'Total Expenses',
      data: memberExpenseTotals.map((m) => m.total),
      backgroundColor: '#36A2EB',
    },
  ],
};


  // Data for Pie Chart (Expense Breakdown)
  const pieChartData = {
    labels: Object.keys(categorizedExpenses),
    datasets: [
      {
        data: Object.values(categorizedExpenses),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#8E44AD', '#E74C3C'],
      },
    ],
  };
  const groupPieData = selectedMember
  ? {
      labels: Object.keys(groupCategorizedExpenses[selectedMember] || {}),
      datasets: [
        {
          data: Object.values(groupCategorizedExpenses[selectedMember] || {}),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#8E44AD', '#E74C3C'],
        },
      ],
    }
  : { labels: [], datasets: [] };

  // Data for Bar Chart (Expense by Category)
  const barChartData = {
    labels: Object.keys(categorizedExpenses),
    datasets: [
      {
        label: 'Total Amount',
        data: Object.values(categorizedExpenses),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#8E44AD', '#E74C3C'],
      },
    ],
  };

  // Data for Line Chart (Expense Over Time)
  const sortedExpenses = [...filteredExpenses].sort((a, b) => new Date(a.date) - new Date(b.date));
  const lineChartData = {
    labels: sortedExpenses.map((expense) => new Date(expense.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Total Amount',
        data: sortedExpenses.map((expense) => expense.amount),
        borderColor: '#36A2EB',
        fill: false,
      },
    ],
  };
  const handleGroupChange = (groupId) => {
    setSelectedGroup(groupId);
    setSelectedMember(null);
    const selectedGroupObj = userGroups.find((g) => g._id === groupId);
    if (selectedGroupObj) {
      const members = selectedGroupObj.members.map((m) => ({
        _id: m.user?._id || m._id,
        username: m.username || m.user?.username,
      }));
      if (!members.find((m) => m._id === currentUser?._id)) {
        members.push({ _id: currentUser._id, username: currentUser.username || 'You' });
      }
      setGroupMembers(members);
    } else {
      setGroupMembers([]);
    }
  };
 
  return (
    <div className="analytics-container">
      <h2 className="analytics-title">Expense Analytics</h2>

      {/* Radio Buttons for Chart Selection */}
      <div className="chart-selection">
        <label>
          <input
            type="radio"
            value="breakdown"
            checked={selectedChart === 'breakdown'}
            onChange={() => setSelectedChart('breakdown')}
          />
          Expense Breakdown
        </label>
        <label>
          <input
            type="radio"
            value="category"
            checked={selectedChart === 'category'}
            onChange={() => setSelectedChart('category')}
          />
          Expense by Category
        </label>
        <label>
          <input
            type="radio"
            value="time"
            checked={selectedChart === 'time'}
            onChange={() => setSelectedChart('time')}
          />
          Expense Over Time
        </label>
        {userGroups.length > 0 && groupMembers.length > 1 && (
  <label>
    <input
      type="radio"
      value="compareMembers"
      checked={selectedChart === 'compareMembers'}
      onChange={() => setSelectedChart('compareMembers')}
    />
    Compare Members
  </label>
)}

      </div>
        {/* Group Selector */}
      <div className="group-selection">
        <label>Select Group:</label>
        <select value={selectedGroup || ''} onChange={(e) => handleGroupChange(e.target.value)}>
          <option value="">Personal Expenses</option>
          {userGroups.map((group) => (
            <option key={group._id} value={group._id}>
              {group.name}
            </option>
          ))}
        </select>

        {/* Member Selector */}
        {selectedGroup && (
          <select value={selectedMember || ''} onChange={(e) => setSelectedMember(e.target.value)}>
            <option value="">All Members</option>
            {groupMembers.map((member) => (
              <option key={member._id} value={member._id}>
                {member.username}
              </option>
            ))}
          </select>
        )}
      </div>


      {/* Filter Dropdown */}
      <div className="filter-options">
        <label>Filter By:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="last7days">Last 7 Days</option>
          <option value="thisMonth">This Month</option>
          <option value="thisYear">This Year</option>
          <option value="all">All Time</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {/* Custom Date Range Inputs */}
      {filter === 'custom' && (
        <div className="custom-date-filter">
          <label>Start Date:</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <label>End Date:</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      )}

      {/* Chart Display */}
      <div className="chart-container">
  {selectedChart === 'breakdown' && (
    <>
      {selectedGroup && !selectedMember ? (
        <div className="multi-pie-charts">
          {groupMembers.map((member) => {
            const memberData = groupCategorizedExpenses[member._id] || {};
            const hasData = Object.keys(memberData).length > 0;
            const data = {
              labels: Object.keys(memberData),
              datasets: [
                {
                  data: Object.values(memberData),
                  backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#8E44AD', '#E74C3C'],
                },
              ],
            };
            return (
              <div key={member._id} style={{ width: '250px', display: 'inline-block', margin: '20px' }}>
                <h4 style={{ textAlign: 'center' }}>{member.username}</h4>
                {hasData ? <Pie data={data} /> : <p>No data available</p>}
              </div>
            );
          })}

          {/* Total Group Chart */}
          {Object.keys(categorizedExpenses).length > 0 ? (
  <div style={{ width: '250px', display: 'inline-block', margin: '20px' }}>
    <h4 style={{ textAlign: 'center' }}>Total Expenses</h4>
    <Pie data={pieChartData} />
  </div>
) : (
  <div style={{ width: '250px', display: 'inline-block', margin: '20px', textAlign: 'center' }}>
    <h4>Total Expenses</h4>
    <p>No data available</p>
  </div>
)}
        </div>
      ) : (
        <Pie data={selectedGroup ? groupPieData : pieChartData} />
      )}
    </>
  )}

  {selectedChart === 'category' && <Bar data={barChartData} />}
  {selectedChart === 'time' && <Line data={lineChartData} />}
  {selectedChart === 'compareMembers' && selectedGroup && (
    <Bar data={compareBarData} />
  )}

</div>

    </div>
  );
};

export default Analytics;
