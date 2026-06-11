import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../utils/api';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('nexora_theme') || 'light');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('nexora_theme', theme);
  }, [theme]);

  const toggleTheme = async () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    const token = localStorage.getItem('nexora_token');
    if (token) {
      try {
        await auth.updateTheme(next);
      } catch {
        /* silent */
      }
    }
  };

  const setThemePreference = (value) => setTheme(value);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
