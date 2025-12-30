import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

// Available accent colors
export const ACCENT_COLORS = [
  { name: 'Orange', value: '#E65100', light: '#FFF3E0' },
  { name: 'Blue', value: '#1565C0', light: '#E3F2FD' },
  { name: 'Green', value: '#2E7D32', light: '#E8F5E9' },
  { name: 'Purple', value: '#6A1B9A', light: '#F3E5F5' },
  { name: 'Red', value: '#C62828', light: '#FFEBEE' },
  { name: 'Teal', value: '#00695C', light: '#E0F2F1' },
];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('accentColor') || '#E65100';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor);
    // Calculate light version for backgrounds
    const color = ACCENT_COLORS.find(c => c.value === accentColor);
    if (color) {
      document.documentElement.style.setProperty('--accent-light', color.light);
    }
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const changeAccentColor = (color) => {
    setAccentColor(color);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, accentColor, changeAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
