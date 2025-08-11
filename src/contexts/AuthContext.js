// src/contexts/AuthContext.js
import React, { createContext, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);

  const login = async (username) => {
    try {
      setIsAuthenticated(true);
      const res = await axios.post('http://localhost:3000/api/users/get-role', { username });
      const userRole = res.data.role;
      setRole(userRole);
    } catch (err) {
      console.error("Error fetching role:", err);
      setIsAuthenticated(false);
      setRole(null);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
