import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { username, password });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } finally {
      setLoading(false);
    }
  };

  // Admin-only: create a new user without affecting the current session
  const adminCreateUser = async (username, password, role = 'user') => {
    const { data } = await API.post('/auth/register', { username, password, role });
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, adminCreateUser, logout, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
