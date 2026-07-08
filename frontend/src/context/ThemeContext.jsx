// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSettings } from './SettingsContext';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const applyTheme = (theme) => {
  const prefersSystemDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? true;
  const resolvedTheme = theme === 'light' ? 'light' : theme === 'system' ? (prefersSystemDark ? 'dark' : 'light') : 'dark';
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(resolvedTheme);
  document.documentElement.setAttribute('data-theme', resolvedTheme);
  document.documentElement.style.colorScheme = resolvedTheme;
  localStorage.setItem('ctgpro_theme', resolvedTheme);
};

export const ThemeProvider = ({ children }) => {
  const { settings } = useSettings();

  const { registerRestoreHandler, user } = useAuth();
  const userRef = useRef(user);

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('ctgpro_theme');
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
      return savedTheme;
    }
    return settings?.appearance?.theme || 'dark';
  });

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('ctgpro_theme');
    if (!savedTheme && settings?.appearance?.theme && settings.appearance.theme !== theme) {
      setTheme(settings.appearance.theme);
    }
  }, [settings, theme]);

  useEffect(() => {
    if (theme !== 'system') return undefined;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');

    mediaQuery.addEventListener?.('change', handleChange);
    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, [theme]);

  useEffect(() => {
    if (!registerRestoreHandler) return;

    const handler = () => {
      const preferredTheme = userRef.current?.preferences?.theme;
      if (preferredTheme === 'light' || preferredTheme === 'dark') {
        setTheme(preferredTheme);
      }
    };

    const unregister = registerRestoreHandler(handler);
    return unregister;
  }, [registerRestoreHandler]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;