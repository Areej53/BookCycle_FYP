import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RiderProtectedRoute = ({ children }) => {
  const { user, token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check if role is rider
  if (user && user.role !== 'rider') {
    return <Navigate to="/home" replace />;
  }

  return children ? children : <Outlet />;
};

export default RiderProtectedRoute;
