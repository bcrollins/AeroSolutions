import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { trackPageView as trackPageViewCustom, trackEvent as trackEventCustom, initAnalytics } from '@/lib/analytics';
import { useAuth } from './useAuth';

/**
 * Custom hook for tracking page views and user activity
 * Uses Wouter's useLocation to track route changes
 */
export const useAnalytics = () => {
  const [location] = useLocation();
  const prevLocationRef = useRef<string>(location);
  const { user, isAuthenticated } = useAuth();
  
  // Initialize analytics
  useEffect(() => {
    initAnalytics();
  }, []);
  
  // Track page views when location changes
  useEffect(() => {
    if (location !== prevLocationRef.current) {
      // Use custom analytics
      trackPageViewCustom(location);
      prevLocationRef.current = location;
    }
  }, [location]);
  
  return {
    trackEvent: trackEventCustom,
  };
};

// All tracking functionality now handled by the imported functions from analytics.ts