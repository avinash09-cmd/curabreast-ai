import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'curabreast_theme';

/**
 * Reads OS preference
 */
const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

/**
 * Applies 'dark' class to <html> element + smooth transition
 */
const applyTheme = (mode) => {
  const resolved = mode === 'system' ? getSystemTheme() : mode;
  const root = document.documentElement;

  // Add transition class for smooth 250ms switch
  root.style.transition = 'background-color 250ms ease, color 250ms ease, border-color 250ms ease';

  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Remove transition after switch to avoid interfering with other animations
  setTimeout(() => { root.style.transition = ''; }, 300);

  return resolved;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'system';
  });

  // Apply theme on mount and whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen to OS preference changes when in 'system' mode
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setThemeMode = useCallback((mode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    setTheme(mode);
  }, []);

  const isDark = theme === 'dark' || (theme === 'system' && getSystemTheme() === 'dark');

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
