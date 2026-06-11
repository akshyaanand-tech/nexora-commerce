import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth } from '../utils/api';
import { useTheme } from './ThemeContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setThemePreference } = useTheme();

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('nexora_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { user: u } = await auth.me();
      setUser(u);
      if (u.theme) setThemePreference(u.theme);
    } catch {
      localStorage.removeItem('nexora_token');
    } finally {
      setLoading(false);
    }
  }, [setThemePreference]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password, remember = true) => {
    const { user: u, token } = await auth.login({ email, password });
    if (remember) localStorage.setItem('nexora_token', token);
    setUser(u);
    if (u.theme) setThemePreference(u.theme);
    return u;
  };

  const register = async (name, email, password) => {
    const { user: u, token } = await auth.register({ name, email, password });
    localStorage.setItem('nexora_token', token);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('nexora_token');
    setUser(null);
  };

  const updateProfile = async (name) => {
    const { user: u } = await auth.updateProfile({ name });
    setUser(u);
    return u;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
