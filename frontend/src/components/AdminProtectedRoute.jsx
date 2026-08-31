import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredAuthToken } from '../utils/authStorage';

// Simple JWT decoder for browser (no verification needed for client-side)
function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

const AdminProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = getStoredAuthToken();

  React.useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decoded = decodeJWT(token);
      if (!decoded || decoded.role !== 'admin') {
        navigate('/home');
      }
    } catch (error) {
      navigate('/login');
    }
  }, [token, navigate]);

  if (!token) {
    return null;
  }

  try {
    const decoded = decodeJWT(token);
    if (!decoded || decoded.role !== 'admin') {
      return null;
    }
  } catch (error) {
    return null;
  }

  return children;
};

export default AdminProtectedRoute;
