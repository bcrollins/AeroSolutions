import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSoundEffects } from './use-sound-effects';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize theme from localStorage or default to system
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('rxai-theme') as Theme;
      return savedTheme || 'system';
    }
    return 'system';
  });
  
  // Sound effects
  const { playSound } = useSoundEffects();
  
  // Calculate if currently in dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Update local storage and apply theme changes when theme changes
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('rxai-theme', newTheme);
    playSound('click');
  };
  
  useEffect(() => {
    // Check if we should use the system preference
    const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Determine if we should use dark mode
    const shouldUseDarkMode = 
      theme === 'dark' || 
      (theme === 'system' && isSystemDark);
    
    // Apply dark mode class to document
    if (shouldUseDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    setIsDarkMode(shouldUseDarkMode);
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        setIsDarkMode(mediaQuery.matches);
        if (mediaQuery.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};