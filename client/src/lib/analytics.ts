/**
 * RXAI Custom Analytics
 * 
 * This module provides custom analytics tracking functionality without relying on Google Analytics.
 * It includes tracking for page views, article interactions, and custom events.
 */

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

// In-memory storage for analytics events (will be sent in batches)
let eventQueue: AnalyticsEvent[] = [];
const MAX_QUEUE_SIZE = 20; // Send events when queue reaches this length

// Initialize analytics
export const initAnalytics = () => {
  console.log('RXAI Custom Analytics initialized');
  
  // Send any queued events before user leaves the page
  window.addEventListener('beforeunload', () => {
    if (eventQueue.length > 0) {
      sendEvents();
    }
  });
  
  // Set up periodic sending of events (every 30 seconds)
  setInterval(() => {
    if (eventQueue.length > 0) {
      sendEvents();
    }
  }, 30000);
};

// Track page views
export const trackPageView = (path: string) => {
  if (typeof window === 'undefined') return;
  
  const event: PageViewEvent = {
    type: 'pageview',
    path,
    referrer: document.referrer,
    timestamp: Date.now()
  };
  
  queueEvent(event);
  
  // Debug
  console.log(`📊 Page View: ${path}`);
};

// Track article interactions
export const trackArticleEvent = (
  action: 'view' | 'share' | 'like' | 'comment' | 'complete',
  articleId: number | string,
  metadata?: {
    title?: string;
    category?: string;
    readTime?: number;
  }
) => {
  if (typeof window === 'undefined') return;
  
  const event: ArticleEvent = {
    type: 'article',
    action,
    articleId,
    articleTitle: metadata?.title,
    articleCategory: metadata?.category,
    readTime: metadata?.readTime,
    timestamp: Date.now()
  };
  
  queueEvent(event);
  
  // Debug
  console.log(`📊 Article ${action}: ${metadata?.title || articleId}`);
};

// Track custom events
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  if (typeof window === 'undefined') return;
  
  const event: CustomEvent = {
    type: 'custom',
    action,
    category,
    label,
    value,
    timestamp: Date.now()
  };
  
  queueEvent(event);
  
  // Debug
  console.log(`📊 Custom Event: ${action} (${category || 'uncategorized'})`);
};

// Add event to queue and send if queue is full
const queueEvent = (event: AnalyticsEvent) => {
  eventQueue.push(event);
  
  // Send events if queue is full
  if (eventQueue.length >= MAX_QUEUE_SIZE) {
    sendEvents();
  }
};

// Send queued events to the server
const sendEvents = async () => {
  if (eventQueue.length === 0) return;
  
  try {
    const eventsToSend = [...eventQueue];
    eventQueue = []; // Clear queue
    
    const response = await fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events: eventsToSend }),
    });
    
    if (!response.ok) {
      throw new Error(`Error sending analytics: ${response.statusText}`);
    }
    
    console.log(`📊 Sent ${eventsToSend.length} analytics events`);
  } catch (error) {
    console.error('Failed to send analytics events:', error);
    // Put events back in queue to try again later
    eventQueue = [...eventQueue, ...eventQueue];
  }
};