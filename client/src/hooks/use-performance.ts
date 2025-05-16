import { useEffect, useRef, useState, useCallback } from 'react';
import { debounce, throttle } from '@/utils/performanceUtils';

/**
 * Types of performance metrics we can track
 */
export type PerformanceMetric = 
  | 'FCP' // First Contentful Paint
  | 'LCP' // Largest Contentful Paint
  | 'FID' // First Input Delay
  | 'CLS' // Cumulative Layout Shift
  | 'TTFB' // Time to First Byte
  | 'TTI'; // Time to Interactive

/**
 * Performance metrics object containing all web vital metrics
 */
export interface PerformanceMetrics {
  FCP?: number;
  LCP?: number;
  FID?: number;
  CLS?: number;
  TTFB?: number;
  TTI?: number;
}

/**
 * Hook for monitoring performance metrics and improving component rendering
 * 
 * This hook provides utilities to:
 * 1. Track performance metrics during runtime
 * 2. Optimize heavy components with automatic throttling
 * 3. Prioritize important components while deferring non-critical renders
 */
export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const renderCount = useRef<number>(0);
  const componentLoadStart = useRef<number>(performance.now());
  
  // Track component rendering performance
  useEffect(() => {
    renderCount.current += 1;
    return () => {
      // This runs on unmount
      const renderTime = performance.now() - componentLoadStart.current;
      // Log if render time exceeds threshold
      if (renderTime > 100) {
        console.warn(`Component rendered slowly: ${renderTime.toFixed(2)}ms after ${renderCount.current} renders`);
      }
    };
  }, []);
  
  // Collect web vital metrics
  useEffect(() => {
    // Skip if window or performance API not available
    if (typeof window === 'undefined' || !window.performance) {
      return;
    }
    
    // Measure TTFB (Time to First Byte)
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
      setMetrics(prev => ({
        ...prev,
        TTFB: navEntry.responseStart - navEntry.requestStart
      }));
    }
    
    // Observe FCP (First Contentful Paint)
    const observeFCP = () => {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      
      if (fcpEntry) {
        setMetrics(prev => ({
          ...prev,
          FCP: fcpEntry.startTime
        }));
      }
    };
    
    // Use PerformanceObserver to detect metrics
    if ('PerformanceObserver' in window) {
      try {
        // Observe LCP (Largest Contentful Paint)
        const lcpObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          if (lastEntry) {
            setMetrics(prev => ({
              ...prev,
              LCP: lastEntry.startTime
            }));
          }
        });
        
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        
        // Observe FID (First Input Delay)
        const fidObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          const firstEntry = entries[0];
          
          if (firstEntry) {
            setMetrics(prev => ({
              ...prev,
              FID: firstEntry.processingStart - firstEntry.startTime
            }));
          }
        });
        
        fidObserver.observe({ type: 'first-input', buffered: true });
        
        // Observe CLS (Cumulative Layout Shift)
        const clsObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          let clsValue = 0;
          
          entries.forEach(entry => {
            // @ts-ignore - layout-shift properties
            if (!entry.hadRecentInput) {
              // @ts-ignore - layout-shift properties
              clsValue += entry.value;
            }
          });
          
          setMetrics(prev => ({
            ...prev,
            CLS: clsValue
          }));
        });
        
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        
        // Clean up observers on unmount
        return () => {
          lcpObserver.disconnect();
          fidObserver.disconnect();
          clsObserver.disconnect();
        };
      } catch (error) {
        console.error('Performance observer error:', error);
      }
    }
    
    // Fallback for FCP if PerformanceObserver not available
    window.setTimeout(observeFCP, 1000);
    
    return () => {};
  }, []);
  
  /**
   * Creates a throttled version of a render-heavy function
   * 
   * @param func Function to throttle
   * @param wait Throttle wait time
   * @returns Throttled function
   */
  const throttleRender = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    wait: number = 100
  ): ((...args: Parameters<T>) => void) => {
    return throttle(func, wait);
  }, []);
  
  /**
   * Creates a debounced version of an input handler
   * 
   * @param func Function to debounce
   * @param wait Debounce wait time
   * @returns Debounced function
   */
  const debounceInput = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    wait: number = 300
  ): ((...args: Parameters<T>) => void) => {
    return debounce(func, wait);
  }, []);
  
  /**
   * Defers non-critical updates to avoid blocking the main thread
   * 
   * @param func Function to defer
   * @param delay Optional delay in ms
   */
  const deferUpdate = useCallback((
    func: () => void,
    delay: number = 0
  ): void => {
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        setTimeout(func, delay);
      });
    } else {
      setTimeout(func, delay + 16);
    }
  }, []);
  
  return {
    metrics,
    renderCount: renderCount.current,
    throttleRender,
    debounceInput,
    deferUpdate
  };
}

export default usePerformance;