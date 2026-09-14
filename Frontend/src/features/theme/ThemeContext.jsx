import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return window.localStorage.getItem('innerly-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('innerly-theme', theme);
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    isLight: theme === 'light',
    toggleTheme: () => setTheme((current) => (current === 'light' ? 'dark' : 'light'))
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
