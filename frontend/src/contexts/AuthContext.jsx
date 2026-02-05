import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);
      }

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load auth from localStorage:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Call this after successful backend login/register
  const setAuth = (newToken, newUser) => {
    setToken(newToken);
    setIsAuthenticated(!!newToken);

    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }

    if (newUser) {
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const logout = () => {
    setAuth(null, null);
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    setAuth,   // 🔑 used by Login / Register pages
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
