/**
 * Performance optimization utilities
 * 
 * Features:
 * - Request debouncing and throttling
 * - Virtual list rendering helpers
 * - Performance measurement
 * - Memory usage optimization
 * - Animation frame utilities
 */

/**
 * Debounce function to limit the rate at which a function can fire
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to ensure a function is called at most once in a specified time period
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      lastRan = Date.now();
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

/**
 * Request function that caches results and avoids duplicate network requests
 */
export const cachedRequest = <T>(
  url: string,
  options?: RequestInit,
  cacheTime: number = 60000, // Cache for 1 minute by default
): Promise<T> => {
  // Create a cache key from the URL and options
  const cacheKey = `${url}-${JSON.stringify(options || {})}`;
  
  // Check if we have a cached response
  const cached = sessionStorage.getItem(cacheKey);
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    
    // Check if the cache is still valid
    if (Date.now() - timestamp < cacheTime) {
      return Promise.resolve(data as T);
    }
    
    // If cache is expired, remove it
    sessionStorage.removeItem(cacheKey);
  }
  
  // Make the actual request
  return fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Cache the response
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          data,
          timestamp: Date.now()
        })
      );
      
      return data as T;
    });
};

/**
 * Batch DOM updates using requestAnimationFrame
 */
export const batchDomUpdates = (
  updates: Array<() => void>
): void => {
  requestAnimationFrame(() => {
    // Process all updates in a single frame
    updates.forEach(update => update());
  });
};

/**
 * Measure the performance of a function
 */
export const measurePerformance = <T extends (...args: any[]) => any>(
  fn: T,
  label: string
): ((...args: Parameters<T>) => ReturnType<T>) => {
  return (...args: Parameters<T>): ReturnType<T> => {
    const start = performance.now();
    const result = fn(...args);
    
    // If the result is a promise, measure when it resolves
    if (result instanceof Promise) {
      result.then(() => {
        const end = performance.now();
        console.log(`${label} took ${end - start}ms`);
      });
    } else {
      const end = performance.now();
      console.log(`${label} took ${end - start}ms`);
    }
    
    return result;
  };
};

/**
 * Optimized fetch function with retry logic, timeout, and caching
 */
export const optimizedFetch = async <T>(
  url: string,
  options?: RequestInit & {
    retries?: number;
    retryDelay?: number;
    timeout?: number;
    cacheTime?: number;
  }
): Promise<T> => {
  const {
    retries = 3,
    retryDelay = 1000,
    timeout = 10000,
    cacheTime = 60000,
    ...fetchOptions
  } = options || {};
  
  // Try to get from cache first
  try {
    const cacheKey = `fetch-cache-${url}-${JSON.stringify(fetchOptions)}`;
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      
      // If cache is still valid, return the cached data
      if (Date.now() - timestamp < cacheTime) {
        return data as T;
      }
      
      // Otherwise remove the expired cache
      sessionStorage.removeItem(cacheKey);
    }
  } catch (error) {
    console.error('Cache retrieval error:', error);
    // Continue with fetch if cache retrieval fails
  }
  
  // Create a promise that rejects after the timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timeout after ${timeout}ms`));
    }, timeout);
  });
  
  // Function to attempt the fetch
  const attemptFetch = async (attempt: number): Promise<T> => {
    try {
      // Race between the fetch and the timeout
      const response = await Promise.race([
        fetch(url, fetchOptions),
        timeoutPromise
      ]);
      
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the successful response
      try {
        const cacheKey = `fetch-cache-${url}-${JSON.stringify(fetchOptions)}`;
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({
            data,
            timestamp: Date.now()
          })
        );
      } catch (error) {
        console.error('Cache storage error:', error);
        // Continue even if caching fails
      }
      
      return data as T;
    } catch (error) {
      // If we have retries left, wait and then retry
      if (attempt < retries) {
        console.log(`Retrying fetch (${attempt + 1}/${retries})...`);
        
        // Wait for the retry delay
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        
        // Try again
        return attemptFetch(attempt + 1);
      }
      
      // Otherwise, propagate the error
      throw error;
    }
  };
  
  // Start the first attempt
  return attemptFetch(0);
};

/**
 * A utility for checking if an element is in the viewport
 */
export const isInViewport = (element: HTMLElement, offset: number = 0): boolean => {
  const rect = element.getBoundingClientRect();
  
  return (
    rect.top >= 0 - offset &&
    rect.left >= 0 - offset &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
  );
};

/**
 * Create a memoized version of a function to avoid recalculating results
 */
export const memoize = <T extends (...args: any[]) => any>(
  fn: T
): T => {
  const cache = new Map();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    // Create a key from the arguments
    const key = JSON.stringify(args);
    
    // If the result is cached, return it
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    // Otherwise calculate and cache the result
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
};

/**
 * Optimize memory usage by clearing large objects when they're no longer needed
 */
export const clearMemory = (object: any): void => {
  if (Array.isArray(object)) {
    object.length = 0;
  } else if (typeof object === 'object' && object !== null) {
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        delete object[key];
      }
    }
  }
};

/**
 * Detect idle time and perform cleanup tasks
 */
export const setupIdleCleanup = (
  cleanupFn: () => void,
  idleTime: number = 30000 // 30 seconds by default
): () => void => {
  let idleTimer: ReturnType<typeof setTimeout>;
  
  const resetTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(cleanupFn, idleTime);
  };
  
  // Set up event listeners
  window.addEventListener('mousemove', resetTimer);
  window.addEventListener('keypress', resetTimer);
  window.addEventListener('scroll', resetTimer);
  window.addEventListener('click', resetTimer);
  
  // Start the timer
  resetTimer();
  
  // Return a cleanup function
  return () => {
    clearTimeout(idleTimer);
    window.removeEventListener('mousemove', resetTimer);
    window.removeEventListener('keypress', resetTimer);
    window.removeEventListener('scroll', resetTimer);
    window.removeEventListener('click', resetTimer);
  };
};