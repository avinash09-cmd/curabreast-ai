import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((token, userData, remember = true) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('token', token);
    storage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
