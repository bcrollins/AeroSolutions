import { useState, useEffect, useMemo } from 'react';

// Predefined breakpoints
export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

type BreakpointKey = keyof typeof breakpoints;
type MediaQueryOptions = {
  /**
   * Enable server-side rendering support with default value
   * @default false
   */
  defaultMatches?: boolean;
  
  /**
   * Re-evaluate on window resize
   * @default true
   */
  watchResize?: boolean;
  
  /**
   * Debounce delay for resize event in ms
   * @default 100
   */
  debounceDelay?: number;
  
  /**
   * Additional event types to listen for
   */
  additionalEvents?: string[];
};

/**
 * Hook to detect if a media query matches
 * @param query Media query string
 * @param options Hook options
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(
  query: string, 
  options: MediaQueryOptions = {}
): boolean {
  const {
    defaultMatches = false,
    watchResize = true,
    debounceDelay = 100,
    additionalEvents = [],
  } = options;
  
  // Use media query as a memo to avoid unnecessary re-renders
  const mediaQueryList = useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return null;
    }
    return window.matchMedia(query);
  }, [query]);
  
  // Initialize state with default value for SSR or media query result
  const [matches, setMatches] = useState(() => {
    if (mediaQueryList) {
      return mediaQueryList.matches;
    }
    return defaultMatches;
  });
  
  // Setup event listener for media query changes
  useEffect(() => {
    if (!mediaQueryList) {
      return undefined;
    }
    
    // Handler for media query changes
    const handleChange = () => {
      setMatches(mediaQueryList.matches);
    };
    
    // Setup listener
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQueryList.addListener(handleChange);
    }
    
    // Cleanup listener
    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQueryList.removeListener(handleChange);
      }
    };
  }, [mediaQueryList]);
  
  // Add optional window resize listener for more responsive updates
  useEffect(() => {
    if (typeof window === 'undefined' || !watchResize) {
      return undefined;
    }
    
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    
    // Handler for window resize
    const handleResize = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      debounceTimer = setTimeout(() => {
        if (mediaQueryList) {
          setMatches(mediaQueryList.matches);
        }
      }, debounceDelay);
    };
    
    // Add listeners
    window.addEventListener('resize', handleResize);
    additionalEvents.forEach(eventType => {
      window.addEventListener(eventType, handleResize);
    });
    
    // Cleanup listeners
    return () => {
      window.removeEventListener('resize', handleResize);
      additionalEvents.forEach(eventType => {
        window.removeEventListener(eventType, handleResize);
      });
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [mediaQueryList, watchResize, debounceDelay, additionalEvents]);
  
  return matches;
}

/**
 * Hook to detect if a min-width breakpoint matches
 * @param breakpoint Breakpoint key or custom value
 * @returns Boolean indicating if the breakpoint matches
 */
export function useBreakpoint(
  breakpoint: BreakpointKey | string, 
  options: MediaQueryOptions = {}
): boolean {
  // Determine actual breakpoint value
  const breakpointValue = breakpoint in breakpoints 
    ? breakpoints[breakpoint as BreakpointKey] 
    : breakpoint;
    
  // Create media query
  const query = `(min-width: ${breakpointValue})`;
  
  return useMediaQuery(query, options);
}

/**
 * Hook to detect between-breakpoints matches
 * @param minBreakpoint Min-width breakpoint
 * @param maxBreakpoint Max-width breakpoint
 * @returns Boolean indicating if between breakpoints
 */
export function useBetweenBreakpoints(
  minBreakpoint: BreakpointKey | string,
  maxBreakpoint: BreakpointKey | string,
  options: MediaQueryOptions = {}
): boolean {
  // Determine actual breakpoint values
  const minValue = minBreakpoint in breakpoints 
    ? breakpoints[minBreakpoint as BreakpointKey] 
    : minBreakpoint;
  
  const maxValue = maxBreakpoint in breakpoints 
    ? breakpoints[maxBreakpoint as BreakpointKey] 
    : maxBreakpoint;
  
  // Create combined media query
  const query = `(min-width: ${minValue}) and (max-width: calc(${maxValue} - 0.1px))`;
  
  return useMediaQuery(query, options);
}

/**
 * Hook for responsive values based on breakpoints
 * @param values Object mapping breakpoints to values
 * @param defaultValue Default value if no breakpoint matches
 * @returns Current value based on breakpoint
 */
export function useResponsiveValue<T>(
  values: Partial<Record<BreakpointKey | string, T>>,
  defaultValue: T,
  options: MediaQueryOptions = {}
): T {
  // Create state for the current value
  const [currentValue, setCurrentValue] = useState<T>(defaultValue);
  
  // Setup effect to manage value based on breakpoints
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    
    // Get sorted breakpoints from largest to smallest
    const breakpointEntries = Object.entries(values)
      .map(([key, value]) => {
        // Convert named breakpoints to pixel values for sorting
        const pixelValue = key in breakpoints
          ? parseInt(breakpoints[key as BreakpointKey], 10)
          : parseInt(key, 10);
          
        return { key, value, pixelValue };
      })
      .sort((a, b) => b.pixelValue - a.pixelValue);
    
    // Handler to determine the current value
    const determineValue = () => {
      // Find first matching breakpoint
      for (const { key, value } of breakpointEntries) {
        const breakpointValue = key in breakpoints
          ? breakpoints[key as BreakpointKey]
          : key;
          
        if (window.matchMedia(`(min-width: ${breakpointValue})`).matches) {
          setCurrentValue(value);
          return;
        }
      }
      
      // If no breakpoint matches, use default
      setCurrentValue(defaultValue);
    };
    
    // Initial determination
    determineValue();
    
    // Setup resize listener
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    
    const handleResize = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      debounceTimer = setTimeout(determineValue, options.debounceDelay || 100);
    };
    
    if (options.watchResize !== false) {
      window.addEventListener('resize', handleResize);
      
      if (options.additionalEvents) {
        options.additionalEvents.forEach(eventType => {
          window.addEventListener(eventType, handleResize);
        });
      }
    }
    
    // Cleanup
    return () => {
      if (options.watchResize !== false) {
        window.removeEventListener('resize', handleResize);
        
        if (options.additionalEvents) {
          options.additionalEvents.forEach(eventType => {
            window.removeEventListener(eventType, handleResize);
          });
        }
      }
      
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [values, defaultValue, options]);
  
  return currentValue;
}

/**
 * Hook to detect dark mode preference
 * @returns Boolean indicating if dark mode is preferred
 */
export function useDarkMode(options: MediaQueryOptions = {}): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)', options);
}

/**
 * Hook to detect reduced motion preference
 * @returns Boolean indicating if reduced motion is preferred
 */
export function useReducedMotion(options: MediaQueryOptions = {}): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)', options);
}

/**
 * Hook to detect hover capability
 * @returns Boolean indicating if hover is supported
 */
export function useHoverCapability(options: MediaQueryOptions = {}): boolean {
  return useMediaQuery('(hover: hover)', options);
}

/**
 * Hook to detect touch capability
 * @returns Boolean indicating if touch is supported
 */
export function useTouchCapability(options: MediaQueryOptions = {}): boolean {
  return useMediaQuery('(pointer: coarse)', options);
}

/**
 * Hook to detect high contrast mode
 * @returns Boolean indicating if high contrast mode is active
 */
export function useHighContrast(options: MediaQueryOptions = {}): boolean {
  return useMediaQuery('(forced-colors: active)', options);
}

/**
 * Hook to get current device type based on screen size
 * @returns Device type: 'mobile', 'tablet', 'desktop', or 'large-desktop'
 */
export function useDeviceType(options: MediaQueryOptions = {}): 'mobile' | 'tablet' | 'desktop' | 'large-desktop' {
  const isLargeDesktop = useBreakpoint('xl', options);
  const isDesktop = useBreakpoint('lg', options);
  const isTablet = useBreakpoint('md', options);
  
  if (isLargeDesktop) return 'large-desktop';
  if (isDesktop) return 'desktop';
  if (isTablet) return 'tablet';
  return 'mobile';
}

/**
 * Hook to conditionally apply CSS properties based on media queries
 * @param baseStyle Base CSS properties
 * @param mediaStyles Media query conditional styles
 * @returns Current CSS properties object
 */
export function useMediaStyles<T extends Record<string, string | number>>(
  baseStyle: T,
  mediaStyles: Record<string, Partial<T>>,
  options: MediaQueryOptions = {}
): T {
  const activeStyles = { ...baseStyle };
  
  // Check each media query
  Object.entries(mediaStyles).forEach(([query, styles]) => {
    const matches = useMediaQuery(query, options);
    
    // If media query matches, apply styles
    if (matches) {
      Object.entries(styles).forEach(([prop, value]) => {
        if (value !== undefined) {
          (activeStyles as any)[prop] = value;
        }
      });
    }
  });
  
  return activeStyles;
}

export default useMediaQuery;