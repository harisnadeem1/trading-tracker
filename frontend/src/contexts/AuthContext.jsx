
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('tradingJournalUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('tradingJournalUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email, password) => {
    // Simulate login - in production, this would call an API
    const storedUsers = JSON.parse(localStorage.getItem('tradingJournalUsers') || '[]');
    const foundUser = storedUsers.find(u => u.email === email && u.password === password);

    if (foundUser) {
      const userData = { email: foundUser.email, username: foundUser.username };
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('tradingJournalUser', JSON.stringify(userData));
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password' };
  };

  const register = (email, password, username) => {
    // Simulate registration - in production, this would call an API
    const storedUsers = JSON.parse(localStorage.getItem('tradingJournalUsers') || '[]');
    
    // Check if user already exists
    if (storedUsers.find(u => u.email === email)) {
      return { success: false, error: 'User with this email already exists' };
    }

    const newUser = { email, password, username };
    storedUsers.push(newUser);
    localStorage.setItem('tradingJournalUsers', JSON.stringify(storedUsers));

    const userData = { email, username };
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('tradingJournalUser', JSON.stringify(userData));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('tradingJournalUser');
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
