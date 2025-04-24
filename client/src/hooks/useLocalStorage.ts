import { useState, useEffect } from 'react';

type SetValue<T> = T | ((val: T) => T);

/**
 * A hook for managing state with local storage
 * 
 * @param key The key to store the value under in localStorage
 * @param initialValue The initial value to use if no value is found in storage
 * @returns A tuple with the current value and a function to set the value
 */
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: SetValue<T>) => void] {
  // Get the initial value from localStorage or use the provided initial value
  const readValue = (): T => {
    // If we're not in a browser environment, return the initial value
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (parseJSON(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value: SetValue<T>) => {
    // If we're not in a browser environment, do nothing
    if (typeof window === 'undefined') {
      console.warn(
        `Tried setting localStorage key "${key}" even though environment is not a browser.`
      );
      return;
    }

    try {
      // Allow value to be a function so we have the same API as useState
      const newValue = value instanceof Function ? value(storedValue) : value;

      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(newValue));

      // Save state
      setStoredValue(newValue);

      // Dispatch a custom event so other instances can update
      window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key } }));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Listen for changes to this localStorage value from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        setStoredValue(parseJSON(e.newValue) as T);
      }
    };

    // Custom event from other instances of this hook
    const handleCustomStorageChange = (e: CustomEvent<{ key: string }>) => {
      if (e.detail.key === key) {
        // Read the latest value from localStorage
        setStoredValue(readValue());
      }
    };

    // This only works for other documents, not the current one
    window.addEventListener('storage', handleStorageChange);
    // This is a custom event, triggered in setValue
    window.addEventListener('local-storage-change', handleCustomStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-change', handleCustomStorageChange as EventListener);
    };
  }, [key, readValue]);

  return [storedValue, setValue];
}

// Helper function to safely parse JSON
function parseJSON<T>(value: string | null): T | undefined {
  try {
    return value === 'undefined' ? undefined : JSON.parse(value ?? '');
  } catch {
    console.warn('Parsing error on', { value });
    return undefined;
  }
}

export default useLocalStorage;