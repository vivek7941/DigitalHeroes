import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Charities from './pages/Charities';
import Subscription from './pages/Subscription';
import WinnerVerification from './pages/WinnerVerification';
import AdminPanel from './pages/Admin';

// Components
import Navbar from './components/Navbar';

// 1. PROTECTED ROUTE GUARD
const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// 2. ADMIN ROUTE GUARD
const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  // Strict check for Administrator role
  if (!user || user.role !== 'Administrator') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#fafafa]">
        <Navbar />
        
        <Routes>
          {/* ROOT REDIRECT */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* PROTECTED USER ROUTES */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/charities" element={<ProtectedRoute><Charities /></ProtectedRoute>} />
          <Route path="/subscribe" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
          <Route path="/verify" element={<ProtectedRoute><WinnerVerification /></ProtectedRoute>} />

          {/* PROTECTED ADMIN ROUTES */}
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

          {/* 404 CATCH-ALL */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        {/* PRD DESIGN: Carbon Fibre Overlay */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[9999] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>
    </Router>
  );
}

export default App;