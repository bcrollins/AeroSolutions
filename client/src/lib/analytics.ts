/**
 * RXAI Custom Analytics
 * 
 * This module provides custom analytics tracking functionality without relying on Google Analytics.
 * It includes tracking for page views, article interactions, and custom events.
 */

import { apiRequest } from "@/lib/queryClient";

// Analytics event types
interface PageViewEvent {
  type: 'pageview';
  path: string;
  referrer?: string;
  timestamp: number;
}

interface ArticleEvent {
  type: 'article';
  action: 'view' | 'share' | 'like' | 'comment' | 'complete';
  articleId: number | string;
  articleTitle?: string;
  articleCategory?: string;
  readTime?: number;
  timestamp: number;
}

interface CustomEvent {
  type: 'custom';
  action: string;
  category?: string;
  label?: string;
  value?: number;
  timestamp: number;
}

export type AnalyticsEvent = PageViewEvent | ArticleEvent | CustomEvent;

// Queue for batching analytics events
let eventQueue: AnalyticsEvent[] = [];
let isInitialized = false;
let sessionId: string;

/**
 * Initialize the analytics system
 */
export const initAnalytics = () => {
  if (isInitialized) return;
  
  // Generate a unique session ID if not present
  sessionId = localStorage.getItem('rxai_session_id') || generateSessionId();
  localStorage.setItem('rxai_session_id', sessionId);
  
  // Setup event flushing interval (send events every 30 seconds)
  setInterval(flushEvents, 30000);
  
  // Setup unload flush (send events when user leaves the page)
  window.addEventListener('beforeunload', () => {
    flushEvents(true);
  });
  
  console.log('RXAI Analytics initialized');
  isInitialized = true;
};

/**
 * Track page view
 */
export const trackPageView = (path: string) => {
  if (!isInitialized) initAnalytics();
  
  const referrer = document.referrer;
  
  const event: PageViewEvent = {
    type: 'pageview',
    path,
    referrer,
    timestamp: Date.now()
  };
  
  queueEvent(event);
};

/**
 * Track article-specific events
 */
export const trackArticleEvent = (
  action: 'view' | 'share' | 'like' | 'comment' | 'complete',
  articleId: number | string,
  articleTitle?: string,
  articleCategory?: string,
  readTime?: number
) => {
  if (!isInitialized) initAnalytics();
  
  const event: ArticleEvent = {
    type: 'article',
    action,
    articleId,
    articleTitle,
    articleCategory,
    readTime,
    timestamp: Date.now()
  };
  
  queueEvent(event);
};

/**
 * Track custom events
 */
export const trackEvent = (
  action: string,
  category?: string,
  label?: string,
  value?: number
) => {
  if (!isInitialized) initAnalytics();
  
  const event: CustomEvent = {
    type: 'custom',
    action,
    category,
    label,
    value,
    timestamp: Date.now()
  };
  
  queueEvent(event);
};

/**
 * Add event to the queue
 */
const queueEvent = (event: AnalyticsEvent) => {
  eventQueue.push(event);
  
  // If queue gets too large, flush immediately
  if (eventQueue.length >= 10) {
    flushEvents();
  }
};

/**
 * Send events to the server
 */
const flushEvents = async (immediate = false) => {
  if (eventQueue.length === 0) return;
  
  const events = [...eventQueue];
  
  // Clear the queue
  eventQueue = [];
  
  try {
    const syncMethod = immediate ? sendEventsSync : sendEventsAsync;
    await syncMethod(events);
  } catch (error) {
    console.error('Failed to send analytics events:', error);
    
    // Put events back in the queue if they failed to send
    eventQueue = [...events, ...eventQueue];
  }
};

/**
 * Send events asynchronously
 */
const sendEventsAsync = async (events: AnalyticsEvent[]) => {
  await apiRequest('POST', '/api/analytics/events', { 
    events,
    sessionId
  });
};

/**
 * Send events synchronously (for page unload)
 */
const sendEventsSync = (events: AnalyticsEvent[]) => {
  // Use sendBeacon for reliable delivery during page unload
  if (navigator.sendBeacon) {
    const blob = new Blob(
      [JSON.stringify({ events, sessionId })], 
      { type: 'application/json' }
    );
    return navigator.sendBeacon('/api/analytics/events', blob);
  }
  
  // Fallback to sync XHR if sendBeacon is not available
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/analytics/events', false);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({ events, sessionId }));
  return xhr.status === 200;
};

/**
 * Generate a unique session ID
 */
const generateSessionId = (): string => {
  return 'rxai-' + 
    Math.random().toString(36).substring(2, 15) + 
    Math.random().toString(36).substring(2, 15) + 
    '-' + Date.now();
};