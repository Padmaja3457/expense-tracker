import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout'; // Import Layout component
import Home from './pages/Home';
import { Login, Register } from './components/Auth/Main';
import ForgotPassword from './components/Auth/ForgotPassword';
import AcceptInvite from './components/Auth/AcceptInvite';
import GroupRegistration from './components/Auth/GroupRegistration';
import RegistrationType from './components/Auth/RegistrationType';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Profile from './components/common/Profile';
import EditExpense from './components/Expense/EditExpense';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import BudgetTable from './components/Budget/BudgetTable'; // ✅ List budgets with edit/delete
import CreateBudgetForm from './components/Budget/CreateBudgetForm'; // ✅ Create a budget
import BudgetDetails from './components/Budget/BudgetDetails'; // ✅ View detailed budget info
import Notifications from './pages/Notifications';

import './App.css';

const App = () => {
  const isAuthenticated = !!localStorage.getItem('token'); // Check if user is authenticated

  return (
    <Router>
      <Routes>
        {/* 🏠 Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/individual" element={<Register />} />
        <Route path="/registration-type" element={<RegistrationType />} />
        <Route path="/register/group" element={<GroupRegistration />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />

        {/* 🔒 Protected Routes */}
        <Route
          path="/"
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="edit-expense/:id" element={<EditExpense />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />}/>
          <Route path="/profile" element={<Profile />} />
          {/* ✅ Budget Routes */}
          <Route path="budgets" element={<BudgetTable />} /> {/* List budgets */}
          <Route path="budgets/create" element={<CreateBudgetForm />} /> {/* Create budget */}
          <Route path="budgets/:id/details" element={<BudgetDetails />} /> {/* View budget */}
          

        </Route>

        {/* 🔄 Redirect Unauthenticated Users to Login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
