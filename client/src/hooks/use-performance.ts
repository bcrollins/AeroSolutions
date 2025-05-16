import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce, throttle } from '@/utils/performanceUtils';

interface PerformanceOptions {
  /**
   * The time in milliseconds to debounce input events
   */
  debounceTime?: number;
  
  /**
   * The time in milliseconds to throttle render events
   */
  throttleTime?: number;
  
  /**
   * Enable or disable all performance optimizations
   */
  enabled?: boolean;
  
  /**
   * Log performance metrics to console
   */
  debug?: boolean;
}

interface PerformanceMetrics {
  /**
   * First Contentful Paint in milliseconds
   */
  fcp: number | null;
  
  /**
   * Largest Contentful Paint in milliseconds
   */
  lcp: number | null;
  
  /**
   * First Input Delay in milliseconds
   */
  fid: number | null;
  
  /**
   * Cumulative Layout Shift score
   */
  cls: number | null;
  
  /**
   * Time to Interactive in milliseconds
   */
  tti: number | null;
  
  /**
   * Total Blocking Time in milliseconds
   */
  tbt: number | null;
}

interface UsePerformanceReturn {
  /**
   * Debounce an input handler to prevent excessive renders
   */
  debounceInput: <T extends (...args: any[]) => any>(
    callback: T,
    customDebounceTime?: number
  ) => (...args: Parameters<T>) => void;
  
  /**
   * Throttle a render function to limit the number of updates
   */
  throttleRender: <T extends (...args: any[]) => any>(
    callback: T,
    customThrottleTime?: number
  ) => (...args: Parameters<T>) => void;
  
  /**
   * Current performance metrics
   */
  metrics: PerformanceMetrics;
  
  /**
   * Check if the browser is idle
   */
  isIdle: boolean;
  
  /**
   * Measure the execution time of a function
   */
  measureExecution: <T extends (...args: any[]) => any>(
    fn: T,
    label?: string
  ) => (...args: Parameters<T>) => ReturnType<T>;
  
  /**
   * Run a function during browser idle time
   */
  runWhenIdle: (
    callback: () => void,
    options?: { timeout?: number }
  ) => void;
}

/**
 * Hook for various performance optimizations
 * 
 * Features:
 * - Input debouncing
 * - Render throttling
 * - Performance metrics
 * - Idle detection
 * - Execution timing
 */
export const usePerformance = (
  options: PerformanceOptions = {}
): UsePerformanceReturn => {
  const {
    debounceTime = 300,
    throttleTime = 100,
    enabled = true,
    debug = false
  } = options;
  
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    tti: null,
    tbt: null
  });
  
  // Debounce input handler
  const debounceInput = useCallback(
    <T extends (...args: any[]) => any>(
      callback: T,
      customDebounceTime?: number
    ): ((...args: Parameters<T>) => void) => {
      if (!enabled) return callback;
      return debounce(callback, customDebounceTime || debounceTime);
    },
    [enabled, debounceTime]
  );
  
  // Throttle render function
  const throttleRender = useCallback(
    <T extends (...args: any[]) => any>(
      callback: T,
      customThrottleTime?: number
    ): ((...args: Parameters<T>) => void) => {
      if (!enabled) return callback;
      return throttle(callback, customThrottleTime || throttleTime);
    },
    [enabled, throttleTime]
  );
  
  // Measure execution time
  const measureExecution = useCallback(
    <T extends (...args: any[]) => any>(
      fn: T,
      label?: string
    ): ((...args: Parameters<T>) => ReturnType<T>) => {
      if (!enabled || !debug) return fn;
      
      return (...args: Parameters<T>): ReturnType<T> => {
        const start = performance.now();
        const result = fn(...args);
        
        // Handle promises
        if (result instanceof Promise) {
          result.then(() => {
            const end = performance.now();
            console.log(`${label || 'Function'} took ${end - start}ms`);
          });
        } else {
          const end = performance.now();
          console.log(`${label || 'Function'} took ${end - start}ms`);
        }
        
        return result;
      };
    },
    [enabled, debug]
  );
  
  // Run a callback during browser idle time
  const runWhenIdle = useCallback(
    (callback: () => void, options?: { timeout?: number }) => {
      if (!enabled) {
        callback();
        return;
      }
      
      if ('requestIdleCallback' in window) {
        // @ts-ignore - TypeScript doesn't have types for requestIdleCallback
        window.requestIdleCallback(callback, options);
      } else {
        // Fallback for browsers that don't support requestIdleCallback
        setTimeout(callback, 1);
      }
    },
    [enabled]
  );
  
  // Monitor browser idle state
  useEffect(() => {
    if (!enabled) return;
    
    let idleTimer: ReturnType<typeof setTimeout>;
    const idleTime = 3000; // 3 seconds of inactivity to be considered idle
    
    const handleActivity = () => {
      setIsIdle(false);
      clearTimeout(idleTimer);
      
      idleTimer = setTimeout(() => {
        setIsIdle(true);
      }, idleTime);
    };
    
    // Set up event listeners
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('click', handleActivity);
    
    // Initialize
    handleActivity();
    
    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [enabled]);
  
  // Collect web vitals metrics
  useEffect(() => {
    if (!enabled || !debug || typeof window === 'undefined') return;
    
    // First Contentful Paint
    const observeFCP = () => {
      if (!performance || !performance.getEntriesByType) return;
      
      const entries = performance.getEntriesByType('paint');
      const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
      
      if (fcpEntry) {
        setMetrics((prev) => ({ ...prev, fcp: fcpEntry.startTime }));
      }
    };
    
    // Largest Contentful Paint
    const observeLCP = () => {
      if (!('PerformanceObserver' in window)) return;
      
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1];
            setMetrics((prev) => ({ ...prev, lcp: lastEntry.startTime }));
          }
        });
        
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        
        return () => {
          lcpObserver.disconnect();
        };
      } catch (e) {
        console.error('Failed to observe LCP:', e);
      }
    };
    
    // First Input Delay
    const observeFID = () => {
      if (!('PerformanceObserver' in window)) return;
      
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          if (entries.length > 0) {
            const firstInput = entries[0];
            setMetrics((prev) => ({
              ...prev,
              fid: firstInput.processingStart - firstInput.startTime
            }));
          }
        });
        
        fidObserver.observe({ type: 'first-input', buffered: true });
        
        return () => {
          fidObserver.disconnect();
        };
      } catch (e) {
        console.error('Failed to observe FID:', e);
      }
    };
    
    // Cumulative Layout Shift
    const observeCLS = () => {
      if (!('PerformanceObserver' in window)) return;
      
      try {
        let clsValue = 0;
        let clsEntries: PerformanceEntry[] = [];
        
        const clsObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          
          entries.forEach((entry) => {
            // @ts-ignore - Layout shift entry
            if (!entry.hadRecentInput) {
              // @ts-ignore - Layout shift value
              clsValue += entry.value;
              clsEntries.push(entry);
              
              setMetrics((prev) => ({ ...prev, cls: clsValue }));
            }
          });
        });
        
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        
        return () => {
          clsObserver.disconnect();
        };
      } catch (e) {
        console.error('Failed to observe CLS:', e);
      }
    };
    
    // Total Blocking Time approximation
    const observeTBT = () => {
      if (!performance || !performance.getEntriesByType) return;
      
      const getBlockingTime = () => {
        const longTasks = performance.getEntriesByType('longtask');
        let totalBlockingTime = 0;
        
        longTasks.forEach((task) => {
          const blockingTime = task.duration - 50; // Tasks over 50ms are considered "blocking"
          if (blockingTime > 0) {
            totalBlockingTime += blockingTime;
          }
        });
        
        return totalBlockingTime;
      };
      
      const intervalId = setInterval(() => {
        setMetrics((prev) => ({ ...prev, tbt: getBlockingTime() }));
      }, 5000);
      
      return () => {
        clearInterval(intervalId);
      };
    };
    
    // Collect all metrics
    const cleanupFns: Array<(() => void) | undefined> = [
      observeFCP(),
      observeLCP(),
      observeFID(),
      observeCLS(),
      observeTBT()
    ];
    
    // Log metrics to console
    if (debug) {
      const metricsInterval = setInterval(() => {
        console.log('Performance Metrics:', metrics);
      }, 5000);
      
      return () => {
        clearInterval(metricsInterval);
        cleanupFns.forEach((fn) => fn && fn());
      };
    }
    
    return () => {
      cleanupFns.forEach((fn) => fn && fn());
    };
  }, [enabled, debug]);
  
  return {
    debounceInput,
    throttleRender,
    metrics,
    isIdle,
    measureExecution,
    runWhenIdle
  };
};