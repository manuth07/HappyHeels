import React from 'react';
import { Navigate } from 'react-router-dom';

// Usage:
// <PrivateRoute>{children}</PrivateRoute>                         -> requires token
// <PrivateRoute requiredRole="ROLE_ADMIN">{children}</PrivateRoute> -> requires admin role
const PrivateRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;