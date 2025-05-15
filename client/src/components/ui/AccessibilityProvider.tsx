import React, { createContext, useContext, useState, useEffect } from 'react';

type AccessibilityOptions = {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
};

type AccessibilityContextType = {
  options: AccessibilityOptions;
  toggleHighContrast: () => void;
  toggleLargeText: () => void;
  toggleReducedMotion: () => void;
  toggleScreenReader: () => void;
  resetAll: () => void;
};

const defaultOptions: AccessibilityOptions = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReader: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage if available
  const [options, setOptions] = useState<AccessibilityOptions>(() => {
    if (typeof window === 'undefined') return defaultOptions;
    
    const saved = localStorage.getItem('rxai-accessibility');
    return saved ? JSON.parse(saved) : defaultOptions;
  });

  // Save to localStorage when options change
  useEffect(() => {
    localStorage.setItem('rxai-accessibility', JSON.stringify(options));
    
    // Apply accessibility classes to document root
    const root = document.documentElement;
    
    // High contrast mode
    if (options.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Large text mode
    if (options.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    // Reduced motion
    if (options.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Screen reader optimizations
    if (options.screenReader) {
      root.classList.add('screen-reader-optimized');
    } else {
      root.classList.remove('screen-reader-optimized');
    }
  }, [options]);

  // Check system preferences on mount
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setOptions(prev => ({...prev, reducedMotion: true}));
    }
  }, []);

  // Toggle functions
  const toggleHighContrast = () => {
    setOptions(prev => ({...prev, highContrast: !prev.highContrast}));
  };

  const toggleLargeText = () => {
    setOptions(prev => ({...prev, largeText: !prev.largeText}));
  };

  const toggleReducedMotion = () => {
    setOptions(prev => ({...prev, reducedMotion: !prev.reducedMotion}));
  };

  const toggleScreenReader = () => {
    setOptions(prev => ({...prev, screenReader: !prev.screenReader}));
  };

  const resetAll = () => {
    setOptions(defaultOptions);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        options,
        toggleHighContrast,
        toggleLargeText,
        toggleReducedMotion,
        toggleScreenReader,
        resetAll,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityProvider;