import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => null,
  isDarkMode: false,
});

// Custom hook for using the theme context
export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
}) => {
  // Get stored theme from localStorage or use default
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('rollinsx-theme') as Theme | null;
    return storedTheme || defaultTheme;
  });
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Update theme class and attribute
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all existing theme classes
    root.classList.remove('light', 'dark');

    // Handle 'system' option
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      setIsDarkMode(systemTheme === 'dark');
    } else {
      // Add the chosen theme class
      root.classList.add(theme);
      setIsDarkMode(theme === 'dark');
    }
    
    // Save to localStorage
    localStorage.setItem('rollinsx-theme', theme);
  }, [theme]);

  // Listen for system theme changes when using 'system' setting
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const root = window.document.documentElement;
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
      setIsDarkMode(systemTheme === 'dark');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const value = {
    theme,
    setTheme,
    isDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};