import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from './useAuth';

/**
 * Custom hook for tracking page views and user activity
 * Uses Wouter's useLocation to track route changes
 */
export const useAnalytics = () => {
  const [location] = useLocation();
  const prevLocationRef = useRef<string>(location);
  const { user, isAuthenticated } = useAuth();
  
  // Track page views when location changes
  useEffect(() => {
    if (location !== prevLocationRef.current) {
      trackPageView(location, isAuthenticated ? user?.id : null);
      prevLocationRef.current = location;
    }
  }, [location, user, isAuthenticated]);
  
  return {
    trackEvent,
  };
};

/**
 * Track page views
 * @param path Current page path
 * @param userId Optional user ID if authenticated
 */
export const trackPageView = async (path: string, userId: string | null = null) => {
  try {
    await apiRequest('POST', '/api/analytics/page-view', {
      path,
      userId,
      timestamp: new Date().toISOString(),
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
};

/**
 * Track custom events
 * @param category Event category
 * @param action Event action
 * @param label Optional event label
 * @param value Optional numeric value
 * @param userId Optional user ID if authenticated
 */
export const trackEvent = async (
  category: string,
  action: string,
  label?: string,
  value?: number,
  userId?: string | null
) => {
  try {
    await apiRequest('POST', '/api/analytics/event', {
      category,
      action,
      label,
      value,
      userId,
      timestamp: new Date().toISOString(),
      path: window.location.pathname,
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};