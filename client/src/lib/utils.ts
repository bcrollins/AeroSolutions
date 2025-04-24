import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): {
  (...args: Parameters<T>): void;
  cancel: () => void;
} {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  const debouncedFunc = function(this: any, ...args: Parameters<T>) {
    const context = this;
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func.apply(context, args);
      timeout = null;
    }, wait);
  };
  
  debouncedFunc.cancel = function() {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debouncedFunc;
}

/**
 * Creates a throttled function that only invokes func at most once per every wait milliseconds.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): {
  (...args: Parameters<T>): void;
  cancel: () => void;
} {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let previous = 0;
  
  const throttledFunc = function(this: any, ...args: Parameters<T>) {
    const context = this;
    const now = Date.now();
    const remaining = wait - (now - previous);
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(context, args);
    } else if (timeout === null) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func.apply(context, args);
      }, remaining);
    }
  };
  
  throttledFunc.cancel = function() {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return throttledFunc;
}

/**
 * Format a date in a consistent way across the application
 */
export function formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  return new Intl.DateTimeFormat('en-US', options || defaultOptions).format(dateObj);
}

/**
 * Format a time relative to now (e.g. "2 hours ago")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  
  // Convert to seconds
  const diffSec = Math.floor(diffMs / 1000);
  
  if (diffSec < 60) {
    return 'just now';
  }
  
  // Convert to minutes
  const diffMin = Math.floor(diffSec / 60);
  
  if (diffMin < 60) {
    return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Convert to hours
  const diffHour = Math.floor(diffMin / 60);
  
  if (diffHour < 24) {
    return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Convert to days
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffDay < 30) {
    return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
  }
  
  // Convert to months
  const diffMonth = Math.floor(diffDay / 30);
  
  if (diffMonth < 12) {
    return `${diffMonth} ${diffMonth === 1 ? 'month' : 'months'} ago`;
  }
  
  // Convert to years
  const diffYear = Math.floor(diffMonth / 12);
  
  return `${diffYear} ${diffYear === 1 ? 'year' : 'years'} ago`;
}
