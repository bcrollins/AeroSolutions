import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Theme options
type Theme = 'light' | 'dark' | 'system';
type ThemeAccent = 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'default';
type FontSize = 'small' | 'medium' | 'large' | 'x-large';
type ReduceMotion = boolean;
type HighContrast = boolean;
type CornerRadius = 'small' | 'medium' | 'large' | 'none';

// Theme preferences interface
interface ThemePreferences {
  theme: Theme;
  accent: ThemeAccent;
  fontSize: FontSize;
  reduceMotion: ReduceMotion;
  highContrast: HighContrast;
  cornerRadius: CornerRadius;
}

// Default preferences 
const defaultPreferences: ThemePreferences = {
  theme: 'system',
  accent: 'blue',
  fontSize: 'medium',
  reduceMotion: false,
  highContrast: false,
  cornerRadius: 'medium'
};

// Theme context type definition
interface ThemeContextType {
  preferences: ThemePreferences;
  setTheme: (theme: Theme) => void;
  setAccent: (accent: ThemeAccent) => void;
  setFontSize: (size: FontSize) => void;
  setReduceMotion: (reduce: ReduceMotion) => void;
  setHighContrast: (contrast: HighContrast) => void;
  setCornerRadius: (radius: CornerRadius) => void;
  resetPreferences: () => void;
  getCurrentTheme: () => 'light' | 'dark'; // Returns active theme (resolves 'system')
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  storageKey = 'rxai-theme-preferences',
  ...props
}: ThemeProviderProps) {
  // Load preferences from localStorage or use defaults
  const [preferences, setPreferences] = useState<ThemePreferences>(() => {
    const savedPrefs = localStorage.getItem(storageKey);
    
    if (savedPrefs) {
      try {
        // Merge with default preferences to handle missing fields
        // (in case the saved preferences are from an older version)
        return { 
          ...defaultPreferences, 
          ...JSON.parse(savedPrefs) 
        };
      } catch (error) {
        console.error('Failed to parse theme preferences:', error);
        return defaultPreferences;
      }
    }
    
    return defaultPreferences;
  });

  // Helper to get current actual theme (resolving 'system')
  const getCurrentTheme = (): 'light' | 'dark' => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return preferences.theme === 'system' ? systemTheme : preferences.theme as 'light' | 'dark';
  };
  
  // Apply theme based on preferences
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark');
    
    // Apply the active theme
    const activeTheme = getCurrentTheme();
    root.classList.add(activeTheme);
    
    // Add data-theme attribute for components that use it
    root.setAttribute('data-theme', activeTheme);
  }, [preferences.theme]);
  
  // Apply high contrast mode
  useEffect(() => {
    const root = window.document.documentElement;
    if (preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [preferences.highContrast]);
  
  // Apply reduced motion preferences
  useEffect(() => {
    const root = window.document.documentElement;
    if (preferences.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [preferences.reduceMotion]);
  
  // Apply font size preference
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all font size classes
    root.classList.remove('text-size-small', 'text-size-medium', 'text-size-large', 'text-size-x-large');
    
    // Add the selected font size class
    root.classList.add(`text-size-${preferences.fontSize}`);
  }, [preferences.fontSize]);
  
  // Apply accent color
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all accent classes
    root.classList.remove(
      'accent-blue', 
      'accent-purple', 
      'accent-green', 
      'accent-orange', 
      'accent-pink', 
      'accent-default'
    );
    
    // Add the selected accent class
    root.classList.add(`accent-${preferences.accent}`);
  }, [preferences.accent]);
  
  // Apply corner radius settings
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all radius classes
    root.classList.remove(
      'radius-none', 
      'radius-small', 
      'radius-medium', 
      'radius-large'
    );
    
    // Add the selected radius class
    root.classList.add(`radius-${preferences.cornerRadius}`);
  }, [preferences.cornerRadius]);

  // Store all preferences in localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(preferences));
  }, [preferences, storageKey]);

  // Listen for system theme change when using system theme
  useEffect(() => {
    if (preferences.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        const root = window.document.documentElement;
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        
        root.classList.remove('light', 'dark');
        root.classList.add(systemTheme);
        root.setAttribute('data-theme', systemTheme);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [preferences.theme]);

  // Preference setter functions
  const setTheme = (theme: Theme) => {
    setPreferences(prev => ({ ...prev, theme }));
  };
  
  const setAccent = (accent: ThemeAccent) => {
    setPreferences(prev => ({ ...prev, accent }));
  };
  
  const setFontSize = (fontSize: FontSize) => {
    setPreferences(prev => ({ ...prev, fontSize }));
  };
  
  const setReduceMotion = (reduceMotion: ReduceMotion) => {
    setPreferences(prev => ({ ...prev, reduceMotion }));
  };
  
  const setHighContrast = (highContrast: HighContrast) => {
    setPreferences(prev => ({ ...prev, highContrast }));
  };
  
  const setCornerRadius = (cornerRadius: CornerRadius) => {
    setPreferences(prev => ({ ...prev, cornerRadius }));
  };
  
  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  const value = {
    preferences,
    setTheme,
    setAccent,
    setFontSize,
    setReduceMotion,
    setHighContrast,
    setCornerRadius,
    resetPreferences,
    getCurrentTheme
  };

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}