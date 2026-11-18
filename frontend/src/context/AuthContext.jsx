import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, authorityAPI } from '../services/api.js';

const AuthContext = createContext();

const AUTHORITY_ROLES = [
  'super_admin',
  'municipal_admin',
  'department_head',
  'department_officer',
  'field_officer'
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('civiclens_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('civiclens_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('civiclens_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('civiclens_user', JSON.stringify(res.data.user));
          }
        } catch {
          // Token expired or invalid
          localStorage.removeItem('civiclens_token');
          localStorage.removeItem('civiclens_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginCitizen = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data.success) {
      setToken(res.data.accessToken);
      setUser(res.data.user);
      localStorage.setItem('civiclens_token', res.data.accessToken);
      localStorage.setItem('civiclens_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const loginAuthority = async (email, password) => {
    const res = await authorityAPI.login({ email, password });
    if (res.data.success) {
      setToken(res.data.accessToken);
      setUser(res.data.user);
      localStorage.setItem('civiclens_token', res.data.accessToken);
      localStorage.setItem('civiclens_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const registerCitizen = async (formData) => {
    const res = await authAPI.register(formData);
    if (res.data.success) {
      setToken(res.data.accessToken);
      setUser(res.data.user);
      localStorage.setItem('civiclens_token', res.data.accessToken);
      localStorage.setItem('civiclens_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Continue cleanup regardless
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('civiclens_token');
    localStorage.removeItem('civiclens_user');
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('civiclens_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const isAuthority = user ? AUTHORITY_ROLES.includes(user.role) : false;
  const isAdmin = user ? user.role === 'super_admin' || user.role === 'municipal_admin' : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user),
        isAuthority,
        isAdmin,
        loginCitizen,
        loginAuthority,
        registerCitizen,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
