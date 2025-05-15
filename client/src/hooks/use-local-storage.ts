import { useState, useEffect } from 'react';

type SetValueFunction<T> = (value: T | ((prevValue: T) => T)) => void;

/**
 * A hook for persistent storage with localStorage
 * 
 * @param key The key to store the value under
 * @param initialValue The initial value to use if no value is found in localStorage
 * @returns A stateful value and a function to update it
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, SetValueFunction<T>] {
  // Get from local storage then parse stored json or return initialValue
  const readValue = (): T => {
    // Prevent build error "window is undefined" but keep working
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue: SetValueFunction<T> = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Save to state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Listen for changes to the local storage in other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        // If the key is the same and there's a new value
        setStoredValue(JSON.parse(event.newValue));
      }
    };

    // Add listener for window storage events
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      
      // Read the value from localStorage again in case it was updated in another tab
      const currentValue = readValue();
      setStoredValue(currentValue);
      
      // Clean up
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;