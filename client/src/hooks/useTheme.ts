import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';
export type ThemeVariant = 'professional' | 'tint' | 'vibrant';

interface ThemeOptions {
  /**
   * Default theme mode
   * @default "system"
   */
  defaultMode?: ThemeMode;
  
  /**
   * Default primary color
   * @default "#3B82F6" (blue-500)
   */
  defaultPrimaryColor?: string;
  
  /**
   * Default corner radius value
   * @default "md"
   */
  defaultRadius?: ThemeRadius;
  
  /**
   * Default theme variant
   * @default "professional"
   */
  defaultVariant?: ThemeVariant;
  
  /**
   * Local storage key for saving theme preferences
   * @default "rollinsx-theme-preferences"
   */
  storageKey?: string;
  
  /**
   * Enable CSS transitions for theme changes
   * @default true
   */
  enableTransitions?: boolean;
  
  /**
   * CSS transition duration in ms
   * @default 200
   */
  transitionDuration?: number;
  
  /**
   * Force specific theme mode (overrides user preferences)
   */
  forcedMode?: ThemeMode;
  
  /**
   * Auto-follow system preference changes
   * @default true
   */
  followSystemPreference?: boolean;
  
  /**
   * Log theme changes to console (debug)
   * @default false
   */
  debug?: boolean;
}

interface ThemeState {
  /**
   * Current theme mode
   */
  mode: ThemeMode;
  
  /**
   * Primary theme color (hex)
   */
  primaryColor: string;
  
  /**
   * Border radius setting
   */
  radius: ThemeRadius;
  
  /**
   * Theme variant
   */
  variant: ThemeVariant;
  
  /**
   * Whether the current effective theme is dark
   */
  isDark: boolean;
  
  /**
   * Whether system preference is dark mode
   */
  systemIsDark: boolean;
}

/**
 * Hook for managing application theme
 */
export function useTheme(options: ThemeOptions = {}) {
  const {
    defaultMode = 'system',
    defaultPrimaryColor = '#3B82F6', // blue-500
    defaultRadius = 'md',
    defaultVariant = 'professional',
    storageKey = 'rollinsx-theme-preferences',
    enableTransitions = true,
    transitionDuration = 200,
    forcedMode,
    followSystemPreference = true,
    debug = false,
  } = options;
  
  // Detect initial system preference
  const getInitialSystemPreference = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };
  
  // Initialize theme from localStorage or defaults
  const initializeTheme = (): ThemeState => {
    if (typeof window === 'undefined') {
      return {
        mode: defaultMode,
        primaryColor: defaultPrimaryColor,
        radius: defaultRadius,
        variant: defaultVariant,
        isDark: false,
        systemIsDark: false,
      };
    }
    
    const systemIsDark = getInitialSystemPreference();
    
    try {
      const savedTheme = localStorage.getItem(storageKey);
      
      if (savedTheme) {
        const parsedTheme = JSON.parse(savedTheme);
        
        // Use forced mode if provided, otherwise use saved mode or default
        const mode = forcedMode || parsedTheme.mode || defaultMode;
        
        // Calculate if the current theme is dark
        const isDark = mode === 'system' 
          ? systemIsDark 
          : mode === 'dark';
        
        return {
          mode,
          primaryColor: parsedTheme.primaryColor || defaultPrimaryColor,
          radius: parsedTheme.radius || defaultRadius,
          variant: parsedTheme.variant || defaultVariant,
          isDark,
          systemIsDark,
        };
      }
    } catch (error) {
      if (debug) console.error('Error reading theme from localStorage:', error);
    }
    
    // Use forced mode if provided, otherwise use default
    const mode = forcedMode || defaultMode;
    const isDark = mode === 'system' ? systemIsDark : mode === 'dark';
    
    return {
      mode,
      primaryColor: defaultPrimaryColor,
      radius: defaultRadius,
      variant: defaultVariant,
      isDark,
      systemIsDark,
    };
  };
  
  // Theme state
  const [theme, setTheme] = useState<ThemeState>(initializeTheme);
  
  // Apply theme to DOM
  const applyTheme = useCallback((newTheme: ThemeState) => {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    
    // Apply dark/light class
    if (newTheme.isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    
    // Apply CSS variables for primary color
    root.style.setProperty('--primary', newTheme.primaryColor);
    
    // Apply CSS variables for radius
    const radiusValues = {
      'none': '0px',
      'sm': '0.125rem',
      'md': '0.375rem',
      'lg': '0.5rem',
      'full': '9999px',
    };
    
    root.style.setProperty('--radius', radiusValues[newTheme.radius]);
    
    // Apply CSS classes for variant
    root.classList.remove('variant-professional', 'variant-tint', 'variant-vibrant');
    root.classList.add(`variant-${newTheme.variant}`);
    
    // Set attributes for other libraries/frameworks to detect
    root.setAttribute('data-mode', newTheme.mode);
    root.setAttribute('data-radius', newTheme.radius);
    root.setAttribute('data-variant', newTheme.variant);
    
    if (debug) {
      console.log('Theme applied:', {
        mode: newTheme.mode,
        isDark: newTheme.isDark,
        primaryColor: newTheme.primaryColor,
        radius: newTheme.radius,
        variant: newTheme.variant,
      });
    }
  }, [debug]);
  
  // Save theme to localStorage
  const saveTheme = useCallback((newTheme: ThemeState) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        mode: newTheme.mode,
        primaryColor: newTheme.primaryColor,
        radius: newTheme.radius,
        variant: newTheme.variant,
      }));
    } catch (error) {
      if (debug) console.error('Error saving theme to localStorage:', error);
    }
  }, [storageKey, debug]);
  
  // Track system preference changes
  useEffect(() => {
    if (typeof window === 'undefined' || !followSystemPreference) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const systemIsDark = mediaQuery.matches;
      
      setTheme(prevTheme => {
        const isDark = prevTheme.mode === 'system' ? systemIsDark : prevTheme.mode === 'dark';
        
        const newTheme = {
          ...prevTheme,
          systemIsDark,
          isDark,
        };
        
        applyTheme(newTheme);
        return newTheme;
      });
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [applyTheme, followSystemPreference]);
  
  // Apply initial theme
  useEffect(() => {
    // Add transition class if enabled
    if (enableTransitions && typeof document !== 'undefined') {
      const root = document.documentElement;
      
      root.classList.add('theme-transition');
      root.style.setProperty(
        '--theme-transition', 
        `${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
      );
    }
    
    applyTheme(theme);
    
    // Clean up
    return () => {
      if (enableTransitions && typeof document !== 'undefined') {
        document.documentElement.classList.remove('theme-transition');
      }
    };
  }, [theme, applyTheme, enableTransitions, transitionDuration]);
  
  // Apply forced mode if it changes
  useEffect(() => {
    if (forcedMode && forcedMode !== theme.mode) {
      const systemIsDark = getInitialSystemPreference();
      const isDark = forcedMode === 'system' ? systemIsDark : forcedMode === 'dark';
      
      const newTheme = {
        ...theme,
        mode: forcedMode,
        isDark,
      };
      
      setTheme(newTheme);
      applyTheme(newTheme);
      saveTheme(newTheme);
    }
  }, [forcedMode, theme, applyTheme, saveTheme]);
  
  // Setter functions
  const setMode = useCallback((mode: ThemeMode) => {
    const systemIsDark = getInitialSystemPreference();
    const isDark = mode === 'system' ? systemIsDark : mode === 'dark';
    
    setTheme(prevTheme => {
      const newTheme = {
        ...prevTheme,
        mode,
        isDark,
      };
      
      applyTheme(newTheme);
      saveTheme(newTheme);
      return newTheme;
    });
  }, [applyTheme, saveTheme]);
  
  const setPrimaryColor = useCallback((color: string) => {
    setTheme(prevTheme => {
      const newTheme = {
        ...prevTheme,
        primaryColor: color,
      };
      
      applyTheme(newTheme);
      saveTheme(newTheme);
      return newTheme;
    });
  }, [applyTheme, saveTheme]);
  
  const setRadius = useCallback((radius: ThemeRadius) => {
    setTheme(prevTheme => {
      const newTheme = {
        ...prevTheme,
        radius,
      };
      
      applyTheme(newTheme);
      saveTheme(newTheme);
      return newTheme;
    });
  }, [applyTheme, saveTheme]);
  
  const setVariant = useCallback((variant: ThemeVariant) => {
    setTheme(prevTheme => {
      const newTheme = {
        ...prevTheme,
        variant,
      };
      
      applyTheme(newTheme);
      saveTheme(newTheme);
      return newTheme;
    });
  }, [applyTheme, saveTheme]);
  
  // Toggle between light and dark mode
  const toggleMode = useCallback(() => {
    setTheme(prevTheme => {
      const newMode = prevTheme.isDark ? 'light' : 'dark';
      
      const newTheme = {
        ...prevTheme,
        mode: newMode,
        isDark: newMode === 'dark',
      };
      
      applyTheme(newTheme);
      saveTheme(newTheme);
      return newTheme;
    });
  }, [applyTheme, saveTheme]);
  
  // Reset theme to defaults
  const resetTheme = useCallback(() => {
    const systemIsDark = getInitialSystemPreference();
    const mode = forcedMode || defaultMode;
    const isDark = mode === 'system' ? systemIsDark : mode === 'dark';
    
    const newTheme: ThemeState = {
      mode,
      primaryColor: defaultPrimaryColor,
      radius: defaultRadius,
      variant: defaultVariant,
      isDark,
      systemIsDark,
    };
    
    setTheme(newTheme);
    applyTheme(newTheme);
    saveTheme(newTheme);
  }, [
    applyTheme, 
    saveTheme, 
    forcedMode, 
    defaultMode, 
    defaultPrimaryColor, 
    defaultRadius, 
    defaultVariant
  ]);
  
  return {
    // Theme state
    mode: theme.mode,
    primaryColor: theme.primaryColor,
    radius: theme.radius,
    variant: theme.variant,
    isDark: theme.isDark,
    systemPreference: theme.systemIsDark ? 'dark' : 'light',
    
    // Setters
    setMode,
    setPrimaryColor,
    setRadius,
    setVariant,
    toggleMode,
    resetTheme,
  };
}

export default useTheme;