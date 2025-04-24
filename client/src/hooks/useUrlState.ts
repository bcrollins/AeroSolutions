import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useRoute } from 'wouter';

interface UrlStateOptions<T> {
  /**
   * Serializer for state object to URL query parameters
   * @default JSON.stringify
   */
  serialize?: (state: T) => string;
  
  /**
   * Deserializer for URL query parameters to state object
   * @default JSON.parse
   */
  deserialize?: (query: string) => T;
  
  /**
   * Whether to replace current history entry or add a new one
   * @default false
   */
  replace?: boolean;
  
  /**
   * Exclude these keys from URL sync
   * @default []
   */
  excludeKeys?: Array<keyof T>;
  
  /**
   * Include only these keys in URL sync (overrides excludeKeys)
   * @default undefined
   */
  includeKeys?: Array<keyof T>;
  
  /**
   * Name to identify this state in URL (useful when multiple useUrlState hooks are used)
   * @default "state"
   */
  name?: string;
  
  /**
   * Custom parameter parser to handle different types of values
   * @default undefined
   */
  paramParser?: <V>(key: string, value: string) => V;
  
  /**
   * Apply throttle to URL updates (ms)
   * @default 0
   */
  throttle?: number;
  
  /**
   * Use hash mode instead of query parameters
   * @default false
   */
  hashMode?: boolean;
  
  /**
   * Log debug information
   * @default false
   */
  debug?: boolean;
}

type UrlQueryParams = Record<string, string>;

/**
 * Hook to sync state with URL query parameters or hash
 */
export function useUrlState<T extends Record<string, any>>(
  initialState: T,
  options: UrlStateOptions<T> = {}
): [T, (nextState: Partial<T> | ((prevState: T) => T)) => void] {
  // Options with defaults
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    replace = false,
    excludeKeys = [],
    includeKeys,
    name = 'state',
    paramParser,
    throttle = 0,
    hashMode = false,
    debug = false,
  } = options;
  
  // Get location and navigation from wouter
  const [location, navigate] = useLocation();
  
  // Reference to the initial state
  const initialStateRef = useRef(initialState);
  
  // State management
  const [state, setState] = useState<T>(() => {
    try {
      // Parse URL to get initial values
      const params = hashMode 
        ? parseHashParams(window.location.hash.slice(1))
        : parseQueryParams(window.location.search);
        
      const stateParam = params[name];
      
      if (stateParam) {
        // If we have a serialized state param, deserialize it
        try {
          const deserializedState = deserialize(decodeURIComponent(stateParam));
          if (debug) console.log('Parsed state from URL:', deserializedState);
          return { ...initialState, ...deserializedState };
        } catch (e) {
          if (debug) console.error('Failed to deserialize state:', e);
        }
      } else {
        // Otherwise, try to parse individual params based on initialState keys
        const parsedState: Partial<T> = {};
        
        // Keys to include in URL state
        const stateKeys = includeKeys || Object.keys(initialState).filter(key => 
          !excludeKeys.includes(key as keyof T)
        );
        
        for (const key of stateKeys) {
          const paramKey = `${name}_${key}`;
          if (params[paramKey] !== undefined) {
            let value = params[paramKey];
            
            // Parse boolean, number, and null values
            if (paramParser) {
              parsedState[key as keyof T] = paramParser(key as string, value);
            } else {
              if (value === 'true') value = 'true';
              else if (value === 'false') value = 'false';
              else if (value === 'null') value = 'null';
              else if (!isNaN(Number(value)) && value !== '') value = value;
              
              parsedState[key as keyof T] = value as any;
            }
          }
        }
        
        if (Object.keys(parsedState).length > 0) {
          if (debug) console.log('Parsed state from individual params:', parsedState);
          return { ...initialState, ...parsedState };
        }
      }
    } catch (e) {
      if (debug) console.error('Error initializing URL state:', e);
    }
    
    // Fall back to initial state if parsing fails
    return initialState;
  });
  
  // Keep a timestamp of the last update to implement throttling
  const lastUpdateRef = useRef(0);
  
  // Timer for throttled updates
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Keys to include in URL state
  const effectiveKeys = useRef<string[]>([]);
  useEffect(() => {
    effectiveKeys.current = includeKeys 
      ? includeKeys.map(k => String(k))
      : Object.keys(initialStateRef.current).filter(key => 
          !excludeKeys.includes(key as keyof T)
        );
  }, [includeKeys, excludeKeys]);
  
  // Update URL when state changes
  useEffect(() => {
    // Skip initial render
    if (JSON.stringify(state) === JSON.stringify(initialStateRef.current)) {
      return;
    }
    
    // Get state values to include in URL
    const urlState: Partial<T> = {};
    for (const key of effectiveKeys.current) {
      if (state[key] !== undefined && state[key] !== initialStateRef.current[key]) {
        urlState[key as keyof T] = state[key];
      }
    }
    
    // Check if we need to update the URL
    if (Object.keys(urlState).length === 0) {
      return;
    }
    
    // For throttling - skip if not enough time has passed
    const now = Date.now();
    if (throttle > 0 && now - lastUpdateRef.current < throttle) {
      // Cancel any existing timer
      if (throttleTimerRef.current !== null) {
        clearTimeout(throttleTimerRef.current);
      }
      
      // Schedule a new update
      throttleTimerRef.current = setTimeout(() => {
        updateUrl(urlState);
        lastUpdateRef.current = Date.now();
        throttleTimerRef.current = null;
      }, throttle - (now - lastUpdateRef.current));
      
      return;
    }
    
    // Update URL immediately if no throttling or enough time has passed
    updateUrl(urlState);
    lastUpdateRef.current = now;
  }, [state, location, navigate, replace, serialize, name, throttle, hashMode]);
  
  // Helper to update URL with current state
  const updateUrl = useCallback((stateToSerialize: Partial<T>) => {
    try {
      // Build URL based on selected mode
      let newUrl: string;
      const serializedState = Object.keys(stateToSerialize).length > 0 
        ? encodeURIComponent(serialize(stateToSerialize))
        : '';
        
      if (hashMode) {
        // Parse current hash and update only the relevant part
        const currentHash = window.location.hash.slice(1);
        const params = parseHashParams(currentHash);
        
        if (serializedState) {
          params[name] = serializedState;
        } else {
          delete params[name];
        }
        
        // Rebuild hash with updated params
        const paramStrings = Object.entries(params).map(([key, value]) => `${key}=${value}`);
        const newHash = paramStrings.length > 0 ? `#${paramStrings.join('&')}` : '';
        
        // Create new URL without changing the path
        newUrl = `${window.location.pathname}${window.location.search}${newHash}`;
      } else {
        // Parse current search params and update only the relevant part
        const params = parseQueryParams(window.location.search);
        
        if (serializedState) {
          params[name] = serializedState;
        } else {
          delete params[name];
        }
        
        // Rebuild query params with updated values
        const paramStrings = Object.entries(params).map(([key, value]) => `${key}=${value}`);
        const newSearch = paramStrings.length > 0 ? `?${paramStrings.join('&')}` : '';
        
        // Create new URL without changing the path
        newUrl = `${window.location.pathname}${newSearch}${window.location.hash}`;
      }
      
      // Navigate to new URL
      if (newUrl !== window.location.href) {
        if (debug) console.log('Updating URL:', newUrl);
        navigate(newUrl, { replace });
      }
    } catch (e) {
      if (debug) console.error('Error updating URL state:', e);
    }
  }, [navigate, replace, serialize, name, hashMode, debug]);
  
  // Custom setState function to update state
  const setUrlState = useCallback((nextState: Partial<T> | ((prevState: T) => T)) => {
    setState(prevState => {
      const newState = typeof nextState === 'function'
        ? (nextState as (prevState: T) => T)(prevState)
        : { ...prevState, ...nextState };
        
      return newState;
    });
  }, [setState]);
  
  // Clean up throttle timer on unmount
  useEffect(() => {
    return () => {
      if (throttleTimerRef.current !== null) {
        clearTimeout(throttleTimerRef.current);
      }
    };
  }, []);
  
  return [state, setUrlState];
}

// Helper function to parse query parameters from URL
function parseQueryParams(search: string): UrlQueryParams {
  const params: UrlQueryParams = {};
  const searchParams = new URLSearchParams(search);
  
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }
  
  return params;
}

// Helper function to parse hash parameters
function parseHashParams(hash: string): UrlQueryParams {
  const params: UrlQueryParams = {};
  
  if (!hash) return params;
  
  const parts = hash.split('&');
  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key && value !== undefined) {
      params[key] = value;
    }
  }
  
  return params;
}

export default useUrlState;