/**
 * Performance optimization utilities to reduce unnecessary renders
 * and improve application responsiveness
 */

/**
 * Debounce function to prevent excessive function calls
 * Useful for search inputs, window resize handlers, etc.
 * 
 * @param func The function to debounce
 * @param wait Wait time in milliseconds before executing
 * @param immediate Whether to execute on the leading edge instead of trailing
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
    
    if (callNow) {
      func.apply(context, args);
    }
  };
}

/**
 * Throttle function to limit the rate at which a function is executed
 * Useful for scroll handlers, mouse move events, etc.
 * 
 * @param func The function to throttle
 * @param limit Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 100
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number;
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      lastRan = Date.now();
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    } else {
      clearTimeout(lastFunc);
      
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

/**
 * Memoize function to cache results of expensive calculations
 * 
 * @param func The function to memoize
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, ReturnType<T>>();
  
  return function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }
    
    const result = func.apply(this, args);
    cache.set(key, result);
    
    return result;
  };
}

/**
 * Detect if the device is a mobile device
 * Use this to conditionally apply mobile-specific optimizations
 * 
 * @returns Boolean indicating if device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Request animation frame wrapper for smoother animations
 * 
 * @param callback Function to call on animation frame
 * @returns Request ID for cancellation
 */
export function scheduleAnimationFrame(callback: FrameRequestCallback): number {
  return window.requestAnimationFrame(callback);
}

/**
 * Cancel a scheduled animation frame
 * 
 * @param requestId The ID returned from scheduleAnimationFrame
 */
export function cancelScheduledAnimation(requestId: number): void {
  window.cancelAnimationFrame(requestId);
}

/**
 * Get browser's preferred color scheme
 * 
 * @returns 'dark' or 'light'
 */
export function getPreferredColorScheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export default {
  debounce,
  throttle,
  memoize,
  isMobileDevice,
  scheduleAnimationFrame,
  cancelScheduledAnimation,
  getPreferredColorScheme
};