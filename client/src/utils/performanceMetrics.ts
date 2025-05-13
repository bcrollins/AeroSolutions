/**
 * Utility for tracking application performance metrics
 * 
 * Provides:
 * - Measuring page load time
 * - Time to interactive
 * - Component/function execution time
 * - Memory usage for large operations
 * - Web Vitals tracking
 * - Network request performance
 * - Long task detection
 */

// Types for performance metrics
export type PerformanceMetric = {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  category: 'page' | 'component' | 'api' | 'resource' | 'webvital' | 'custom';
  metadata?: Record<string, any>;
};

export type WebVitalMetric = {
  name: 'CLS' | 'FID' | 'LCP' | 'FCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
};

type TimingFunction = () => void;

// Store for collected metrics
const metricsStore: PerformanceMetric[] = [];

// Observers and listeners
let perfObserver: PerformanceObserver | null = null;
let longTaskObserver: PerformanceObserver | null = null;
let resourceObserver: PerformanceObserver | null = null;
let isInitialized = false;

// Configuration
let config = {
  enableWebVitals: true,
  enableLongTaskDetection: true,
  enableResourceTiming: true,
  enableMemoryInfo: false,
  enableConsoleReporting: false,
  enableAutoPageMetrics: true,
  sampleRate: 1.0, // 1.0 = 100% of metrics are recorded
  maxMetricsHistory: 1000,
};

// Constants for web vital thresholds
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // ms
  FID: { good: 100, poor: 300 },   // ms
  CLS: { good: 0.1, poor: 0.25 },  // score
  FCP: { good: 1800, poor: 3000 }, // ms
  TTFB: { good: 800, poor: 1800 }, // ms
  INP: { good: 200, poor: 500 },   // ms
};

// Initialize performance tracking
export function initializePerformanceTracking(options?: Partial<typeof config>): void {
  if (isInitialized) return;
  
  // Merge options with default config
  if (options) {
    config = { ...config, ...options };
  }
  
  // Check if Performance API is supported
  if (typeof window === 'undefined' || !window.performance) {
    console.warn('Performance API is not supported in this environment');
    return;
  }
  
  // Check if we should sample this session
  if (Math.random() > config.sampleRate) {
    if (config.enableConsoleReporting) {
      console.log('Performance tracking disabled for this session (sampling)');
    }
    return;
  }
  
  try {
    // Set up performance observers
    if (config.enableWebVitals) {
      setupWebVitalObservers();
    }
    
    if (config.enableLongTaskDetection) {
      setupLongTaskDetection();
    }
    
    if (config.enableResourceTiming) {
      setupResourceTimingObserver();
    }
    
    if (config.enableAutoPageMetrics) {
      trackPageLoadMetrics();
    }
    
    isInitialized = true;
    
    // Log initialization status
    if (config.enableConsoleReporting) {
      console.log('Performance tracking initialized', config);
    }
  } catch (error) {
    console.error('Failed to initialize performance tracking:', error);
  }
}

// Set up web vital tracking
function setupWebVitalObservers(): void {
  try {
    if ('PerformanceObserver' in window) {
      // Track largest contentful paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        const lcpValue = lastEntry.startTime;
        const rating = lcpValue < THRESHOLDS.LCP.good ? 'good' :
                      lcpValue < THRESHOLDS.LCP.poor ? 'needs-improvement' : 'poor';
        
        recordWebVital({
          name: 'LCP',
          value: lcpValue,
          rating,
        });
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      
      // Track first input delay
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (entry.processingStart && entry.startTime) {
            const fidValue = entry.processingStart - entry.startTime;
            const rating = fidValue < THRESHOLDS.FID.good ? 'good' :
                          fidValue < THRESHOLDS.FID.poor ? 'needs-improvement' : 'poor';
            
            recordWebVital({
              name: 'FID',
              value: fidValue,
              rating,
            });
          }
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      
      // Track layout shifts (CLS)
      let clsValue = 0;
      let clsEntries: PerformanceEntry[] = [];
      
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          // Only count layout shifts without recent user input
          if (!(entry as any).hadRecentInput) {
            const value = (entry as any).value;
            clsValue += value;
            clsEntries.push(entry);
            
            // Report CLS at specific points or at end of session
            const rating = clsValue < THRESHOLDS.CLS.good ? 'good' :
                          clsValue < THRESHOLDS.CLS.poor ? 'needs-improvement' : 'poor';
            
            recordWebVital({
              name: 'CLS',
              value: clsValue,
              rating,
            });
          }
        });
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      
      // First contentful paint
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          const fcpValue = entry.startTime;
          const rating = fcpValue < THRESHOLDS.FCP.good ? 'good' :
                        fcpValue < THRESHOLDS.FCP.poor ? 'needs-improvement' : 'poor';
          
          recordWebVital({
            name: 'FCP',
            value: fcpValue,
            rating,
          });
        });
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
      
      // Track time to first byte
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const navigationEntry = navigationEntries[0] as PerformanceNavigationTiming;
        const ttfb = navigationEntry.responseStart;
        const rating = ttfb < THRESHOLDS.TTFB.good ? 'good' :
                      ttfb < THRESHOLDS.TTFB.poor ? 'needs-improvement' : 'poor';
        
        recordWebVital({
          name: 'TTFB',
          value: ttfb,
          rating,
        });
      }
      
      // Interaction to Next Paint (if supported)
      if ('interactionCount' in performance) {
        const inpObserver = new PerformanceObserver((entryList) => {
          const lastEntry = entryList.getEntries().sort((a, b) => 
            b.duration - a.duration
          )[0];
          
          if (lastEntry) {
            const inpValue = lastEntry.duration;
            const rating = inpValue < THRESHOLDS.INP.good ? 'good' :
                          inpValue < THRESHOLDS.INP.poor ? 'needs-improvement' : 'poor';
            
            recordWebVital({
              name: 'INP',
              value: inpValue,
              rating,
            });
          }
        });
        
        try {
          inpObserver.observe({ type: 'event', durationThreshold: 16, buffered: true });
        } catch (e) {
          // INP might not be supported in all browsers
        }
      }
    }
  } catch (error) {
    console.error('Failed to set up web vitals tracking:', error);
  }
}

// Set up detection for long tasks (jank)
function setupLongTaskDetection(): void {
  try {
    if ('PerformanceObserver' in window) {
      longTaskObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          const duration = entry.duration;
          const startTime = entry.startTime;
          
          if (duration > 50) { // Tasks over 50ms are considered "long tasks"
            recordMetric({
              name: 'LongTask',
              value: duration,
              unit: 'ms',
              timestamp: Date.now(),
              category: 'custom',
              metadata: {
                startTime,
                entryType: entry.entryType,
                taskSource: (entry as any).name, // Task attribution
              }
            });
            
            if (config.enableConsoleReporting && duration > 100) {
              console.warn(`Long task detected (${duration.toFixed(2)}ms)`, entry);
            }
          }
        });
      });
      
      longTaskObserver.observe({ type: 'longtask', buffered: true });
    }
  } catch (error) {
    console.error('Failed to set up long task detection:', error);
  }
}

// Set up resource timing tracking
function setupResourceTimingObserver(): void {
  try {
    if ('PerformanceObserver' in window) {
      resourceObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Filter for specific resources if needed (e.g., only API calls)
          if (resourceEntry.initiatorType === 'fetch' || resourceEntry.initiatorType === 'xmlhttprequest') {
            const duration = resourceEntry.duration;
            const transferSize = resourceEntry.transferSize;
            const url = resourceEntry.name;
            
            recordMetric({
              name: 'ResourceTiming',
              value: duration,
              unit: 'ms',
              timestamp: Date.now(),
              category: 'resource',
              metadata: {
                url,
                initiatorType: resourceEntry.initiatorType,
                transferSize,
                encodedBodySize: resourceEntry.encodedBodySize,
                decodedBodySize: resourceEntry.decodedBodySize,
                startTime: resourceEntry.startTime,
                redirectTime: resourceEntry.redirectEnd - resourceEntry.redirectStart,
                dnsTime: resourceEntry.domainLookupEnd - resourceEntry.domainLookupStart,
                tcpTime: resourceEntry.connectEnd - resourceEntry.connectStart,
                sslTime: resourceEntry.secureConnectionStart > 0 ? resourceEntry.connectEnd - resourceEntry.secureConnectionStart : 0,
                responseTime: resourceEntry.responseEnd - resourceEntry.responseStart,
              }
            });
            
            if (config.enableConsoleReporting && duration > 1000) {
              console.warn(`Slow resource load: ${url} (${duration.toFixed(2)}ms)`);
            }
          }
        });
      });
      
      resourceObserver.observe({ type: 'resource', buffered: true });
    }
  } catch (error) {
    console.error('Failed to set up resource timing observer:', error);
  }
}

// Track page load metrics
function trackPageLoadMetrics(): void {
  // Record basic page load metrics when window.load fires
  window.addEventListener('load', () => {
    // Use Navigation Timing API
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      recordMetric({
        name: 'PageLoad',
        value: navigation.loadEventEnd - navigation.startTime,
        unit: 'ms',
        timestamp: Date.now(),
        category: 'page',
        metadata: {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
          domInteractive: navigation.domInteractive - navigation.startTime,
          firstByte: navigation.responseStart - navigation.startTime,
          resourceLoad: navigation.loadEventStart - navigation.domContentLoadedEventEnd,
          navigationType: navigation.type,
          url: window.location.href,
        }
      });
    }
    
    // Record paint times
    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach(entry => {
      const paintEntry = entry as PerformanceEntry;
      recordMetric({
        name: paintEntry.name,
        value: paintEntry.startTime,
        unit: 'ms',
        timestamp: Date.now(),
        category: 'page',
      });
    });
    
    // Record memory usage if available and enabled
    if (config.enableMemoryInfo && (performance as any).memory) {
      const memory = (performance as any).memory;
      recordMetric({
        name: 'MemoryUsage',
        value: memory.usedJSHeapSize / (1024 * 1024),
        unit: 'MB',
        timestamp: Date.now(),
        category: 'page',
        metadata: {
          totalJSHeapSize: memory.totalJSHeapSize / (1024 * 1024),
          jsHeapSizeLimit: memory.jsHeapSizeLimit / (1024 * 1024),
        }
      });
    }
  });
}

// Record a Web Vital metric
function recordWebVital(vital: WebVitalMetric): void {
  recordMetric({
    name: vital.name,
    value: vital.value,
    unit: 'ms',
    timestamp: Date.now(),
    category: 'webvital',
    metadata: {
      rating: vital.rating,
    }
  });
  
  if (config.enableConsoleReporting) {
    console.log(`Web Vital: ${vital.name} - ${vital.value.toFixed(2)}ms (${vital.rating})`);
  }
}

// Record a generic performance metric
export function recordMetric(metric: PerformanceMetric): void {
  // Check if we need to maintain metrics history size
  if (metricsStore.length >= config.maxMetricsHistory) {
    metricsStore.shift(); // Remove oldest entry
  }
  
  metricsStore.push(metric);
  
  if (config.enableConsoleReporting) {
    console.log(`Performance metric: ${metric.name} - ${metric.value}${metric.unit}`, metric);
  }
}

// Measure execution time of a function
export function measureExecutionTime<T extends (...args: any[]) => any>(
  fn: T,
  name?: string,
  category: PerformanceMetric['category'] = 'component'
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    const startTime = performance.now();
    const result = fn(...args);
    
    // If result is a promise, measure async execution time
    if (result instanceof Promise) {
      return result.finally(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        recordMetric({
          name: name || fn.name || 'AnonymousFunction',
          value: duration,
          unit: 'ms',
          timestamp: Date.now(),
          category,
          metadata: {
            async: true,
            args: args.length,
          }
        });
      }) as ReturnType<T>;
    } else {
      // Synchronous function
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      recordMetric({
        name: name || fn.name || 'AnonymousFunction',
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        category,
        metadata: {
          async: false,
          args: args.length,
        }
      });
      
      return result;
    }
  };
}

// Start measurement with a marker
export function startMeasurement(name: string): () => number {
  const startTime = performance.now();
  const markName = `mark_${name}_start_${Date.now()}`;
  
  try {
    performance.mark(markName);
  } catch (e) {
    // Some browsers might have limits on the number of marks
  }
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    try {
      const measureName = `measure_${name}_${Date.now()}`;
      const endMarkName = `mark_${name}_end_${Date.now()}`;
      
      performance.mark(endMarkName);
      performance.measure(measureName, markName, endMarkName);
    } catch (e) {
      // Handle potential errors in some browsers
    }
    
    recordMetric({
      name,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      category: 'custom',
    });
    
    return duration;
  };
}

// Track API request performance
export function trackApiRequest(url: string, options?: RequestInit): Promise<Response> {
  const startTime = performance.now();
  
  return fetch(url, options)
    .then(response => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      recordMetric({
        name: 'ApiRequest',
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        category: 'api',
        metadata: {
          url,
          method: options?.method || 'GET',
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
        }
      });
      
      return response;
    })
    .catch(error => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      recordMetric({
        name: 'ApiRequestError',
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        category: 'api',
        metadata: {
          url,
          method: options?.method || 'GET',
          error: error.message,
        }
      });
      
      throw error;
    });
}

// Get all collected metrics, optionally filtered
export function getMetrics(filter?: {
  category?: PerformanceMetric['category'];
  name?: string;
  timeRange?: { start: number; end: number };
}): PerformanceMetric[] {
  if (!filter) return [...metricsStore];
  
  return metricsStore.filter(metric => {
    if (filter.category && metric.category !== filter.category) return false;
    if (filter.name && metric.name !== filter.name) return false;
    if (filter.timeRange) {
      const { start, end } = filter.timeRange;
      if (metric.timestamp < start || metric.timestamp > end) return false;
    }
    return true;
  });
}

// Get performance summary with averages, max values, etc.
export function getPerformanceSummary(): {
  pageLoad: { avg: number; min: number; max: number };
  apiRequests: { avg: number; min: number; max: number; count: number };
  webVitals: Record<string, { value: number; rating: string }>;
  resourcePerformance: { avg: number; count: number };
  longTasks: { count: number; totalDuration: number; avgDuration: number };
  memoryUsage?: { avg: number; max: number };
} {
  const pageLoadMetrics = metricsStore.filter(m => m.name === 'PageLoad');
  const apiMetrics = metricsStore.filter(m => m.category === 'api');
  const webVitalMetrics = metricsStore.filter(m => m.category === 'webvital');
  const resourceMetrics = metricsStore.filter(m => m.category === 'resource');
  const longTaskMetrics = metricsStore.filter(m => m.name === 'LongTask');
  const memoryMetrics = metricsStore.filter(m => m.name === 'MemoryUsage');
  
  // Calculate page load stats
  const pageLoadTimes = pageLoadMetrics.map(m => m.value);
  const pageLoadAvg = pageLoadTimes.length > 0 
    ? pageLoadTimes.reduce((sum, val) => sum + val, 0) / pageLoadTimes.length 
    : 0;
  
  // Calculate API request stats
  const apiTimes = apiMetrics.map(m => m.value);
  const apiAvg = apiTimes.length > 0 
    ? apiTimes.reduce((sum, val) => sum + val, 0) / apiTimes.length 
    : 0;
  
  // Process web vitals
  const webVitals: Record<string, { value: number; rating: string }> = {};
  webVitalMetrics.forEach(metric => {
    // Keep the most recent measurement for each vital
    if (!webVitals[metric.name] || metric.timestamp > webVitals[metric.name].timestamp) {
      webVitals[metric.name] = {
        value: metric.value,
        rating: metric.metadata?.rating || 'unknown',
        timestamp: metric.timestamp,
      };
    }
  });
  
  // Delete the timestamp property we added above
  Object.values(webVitals).forEach(v => delete (v as any).timestamp);
  
  // Process long tasks
  const longTaskDurations = longTaskMetrics.map(m => m.value);
  const longTaskTotalDuration = longTaskDurations.reduce((sum, val) => sum + val, 0);
  const longTaskAvgDuration = longTaskDurations.length > 0 
    ? longTaskTotalDuration / longTaskDurations.length 
    : 0;
  
  // Process memory usage if available
  let memoryUsage;
  if (memoryMetrics.length > 0) {
    const memoryValues = memoryMetrics.map(m => m.value);
    memoryUsage = {
      avg: memoryValues.reduce((sum, val) => sum + val, 0) / memoryValues.length,
      max: Math.max(...memoryValues),
    };
  }
  
  return {
    pageLoad: {
      avg: pageLoadAvg,
      min: pageLoadTimes.length > 0 ? Math.min(...pageLoadTimes) : 0,
      max: pageLoadTimes.length > 0 ? Math.max(...pageLoadTimes) : 0,
    },
    apiRequests: {
      avg: apiAvg,
      min: apiTimes.length > 0 ? Math.min(...apiTimes) : 0,
      max: apiTimes.length > 0 ? Math.max(...apiTimes) : 0,
      count: apiTimes.length,
    },
    webVitals,
    resourcePerformance: {
      avg: resourceMetrics.length > 0 
        ? resourceMetrics.reduce((sum, m) => sum + m.value, 0) / resourceMetrics.length 
        : 0,
      count: resourceMetrics.length,
    },
    longTasks: {
      count: longTaskMetrics.length,
      totalDuration: longTaskTotalDuration,
      avgDuration: longTaskAvgDuration,
    },
    ...(memoryUsage && { memoryUsage }),
  };
}

// Clear all collected metrics
export function clearMetrics(): void {
  metricsStore.length = 0;
}

// Update configuration
export function updateConfig(newConfig: Partial<typeof config>): void {
  config = { ...config, ...newConfig };
}

// Clean up observers
export function cleanupPerformanceTracking(): void {
  if (perfObserver) {
    perfObserver.disconnect();
    perfObserver = null;
  }
  
  if (longTaskObserver) {
    longTaskObserver.disconnect();
    longTaskObserver = null;
  }
  
  if (resourceObserver) {
    resourceObserver.disconnect();
    resourceObserver = null;
  }
  
  isInitialized = false;
}