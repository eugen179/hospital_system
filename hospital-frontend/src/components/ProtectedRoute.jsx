// ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const userRole = localStorage.getItem("role");

  if (!userRole) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
