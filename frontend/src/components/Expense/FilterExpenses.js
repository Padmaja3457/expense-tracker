import React, { useState } from 'react';
import './FilterExpenses.css';

const FilterExpenses = ({ expenses, onFilter }) => {
  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState('');

  const handleFilterChange = () => {
    let filteredData = expenses;

    if (filterType === 'date') {
      filteredData = expenses.filter((expense) => expense.date === filterValue);
    } else if (filterType === 'month') {
      filteredData = expenses.filter((expense) => new Date(expense.date).getMonth() + 1 === parseInt(filterValue));
    } else if (filterType === 'year') {
      filteredData = expenses.filter((expense) => new Date(expense.date).getFullYear() === parseInt(filterValue));
    } else if (filterType === 'amount') {
      filteredData = expenses.filter((expense) => expense.amount === parseFloat(filterValue));
    } else if (filterType === 'category') {
      filteredData = expenses.filter((expense) => expense.category.toLowerCase() === filterValue.toLowerCase());
    }

    onFilter(filteredData);
  };

  return (
    <div className="filter-container">
      <select onChange={(e) => setFilterType(e.target.value)}>
        <option value="">Filter by...</option>
        <option value="date">Date</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
        <option value="amount">Amount</option>
        <option value="category">Category</option>
      </select>

      <input
        type="text"
        placeholder="Enter value"
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
      />

      <button onClick={handleFilterChange}>Apply</button>
    </div>
  );
};

export default FilterExpenses;
