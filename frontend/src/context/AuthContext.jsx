import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredAuthToken } from '../utils/authStorage';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(getStoredAuthToken());
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        // Decode JWT payload which is the second part of the token (base64url encoded)
        const base64Url = token.split('.')[1];
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const decodedUser = JSON.parse(jsonPayload);
          setUser(decodedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('auth', JSON.stringify(newToken));
    setTokenState(newToken);
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setTokenState('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
