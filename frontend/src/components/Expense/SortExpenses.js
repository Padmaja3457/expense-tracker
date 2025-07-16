import React, { useState } from 'react';
import './SortExpenses.css';

const SortExpenses = ({ expenses, onSort }) => {
  const [sortType, setSortType] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // Default ascending order

  const handleSortChange = (type) => {
    let sortedData = [...expenses];

    switch (type) {
      case 'date':
        sortedData.sort((a, b) => (sortOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date)));
        break;
      case 'amount':
        sortedData.sort((a, b) => (sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount));
        break;
      case 'category':
        sortedData.sort((a, b) => (sortOrder === 'asc' ? a.category.localeCompare(b.category) : b.category.localeCompare(a.category)));
        break;
      default:
        break;
    }

    setSortType(type);
    onSort(sortedData);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    handleSortChange(sortType);
  };

  return (
    <div className="sort-container">
      <select onChange={(e) => handleSortChange(e.target.value)} value={sortType}>
        <option value="">Sort by...</option>
        <option value="date">Date</option>
        <option value="amount">Amount</option>
        <option value="category">Category</option>
      </select>
      <button onClick={toggleSortOrder}>
        {sortOrder === 'asc' ? '⬆ Ascending' : '⬇ Descending'}
      </button>
    </div>
  );
};

export default SortExpenses;
