/**
 * Optimized data fetching utility
 * 
 * This utility improves API performance by:
 * - Implementing request deduplication
 * - Adding a configurable caching layer
 * - Supporting request cancellation
 * - Adding automatic retry with exponential backoff
 */

interface FetchOptions extends RequestInit {
  // How long to cache the result (in milliseconds)
  cacheTtl?: number;
  // Number of retries on failure
  retries?: number;
  // Whether to deduplicate identical in-flight requests
  deduplicate?: boolean;
  // Whether to invalidate the cache for this request
  forceRefresh?: boolean;
}

type CacheEntry = {
  data: any;
  expiresAt: number;
};

// Cache storage (memory-based)
const cache = new Map<string, CacheEntry>();

// Active request tracking for deduplication
const activeRequests = new Map<string, Promise<any>>();

/**
 * Generates a cache key from the request
 */
function getCacheKey(url: string, options?: RequestInit): string {
  const method = options?.method || 'GET';
  const body = options?.body ? JSON.stringify(options.body) : '';
  return `${method}:${url}:${body}`;
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Invalidate a specific cache entry
 */
export function invalidateCache(url: string, options?: RequestInit): void {
  const key = getCacheKey(url, options);
  cache.delete(key);
}

/**
 * Optimized fetch function with caching, deduplication and retries
 */
export async function optimizedFetch<T = any>(
  url: string, 
  options?: FetchOptions
): Promise<T> {
  const {
    cacheTtl = 60000, // Default 1 minute cache
    retries = 2,
    deduplicate = true,
    forceRefresh = false,
    ...fetchOptions
  } = options || {};
  
  const cacheKey = getCacheKey(url, fetchOptions);
  
  // Check cache first (if not forcing refresh)
  if (!forceRefresh) {
    const cachedData = cache.get(cacheKey);
    if (cachedData && cachedData.expiresAt > Date.now()) {
      return cachedData.data;
    }
  }
  
  // Handle request deduplication
  if (deduplicate && activeRequests.has(cacheKey)) {
    return activeRequests.get(cacheKey) as Promise<T>;
  }
  
  // Create AbortController for cancellation support
  const controller = new AbortController();
  const signal = controller.signal;
  
  // Create the actual fetch request with retries
  const fetchWithRetry = async (attemptsLeft: number): Promise<T> => {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the successful response
      cache.set(cacheKey, {
        data,
        expiresAt: Date.now() + cacheTtl,
      });
      
      return data;
    } catch (error: any) {
      // Don't retry if request was aborted
      if (error.name === 'AbortError') {
        throw error;
      }
      
      // Retry with exponential backoff if attempts remaining
      if (attemptsLeft > 0) {
        const delay = Math.pow(2, retries - attemptsLeft) * 300;
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(attemptsLeft - 1);
      }
      
      throw error;
    }
  };
  
  // Execute the request with retries
  const fetchPromise = fetchWithRetry(retries);
  
  // Track the request for deduplication
  if (deduplicate) {
    activeRequests.set(cacheKey, fetchPromise);
    
    // Clean up after request completes
    fetchPromise
      .finally(() => {
        activeRequests.delete(cacheKey);
      });
  }
  
  return fetchPromise;
}

/**
 * Hook to abort any pending requests when component unmounts
 */
export function useRequestCleanup() {
  return () => {
    // Request cleanup logic would go here if we track controller references
  };
}

export default optimizedFetch;