import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ darkMode: false, toggleDarkMode: () => {} });

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('nova-dark-mode');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('nova-dark-mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
