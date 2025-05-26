import { useCallback } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook for tracking and analyzing user course interactions
 * to improve recommendation quality
 */
export default function useRecommendationTracker() {
  const { isAuthenticated, user } = useAuth();

  /**
   * Track when a user views a course detail page
   */
  const trackCourseView = useCallback((courseId: string) => {
    if (!courseId) return;

    try {
      // For authenticated users, store view in database
      if (isAuthenticated && user) {
        // In a real implementation, this would be an API call
        console.log(`[Tracking] User ${user.id} viewed course ${courseId}`);
        
        // Store this interaction in localStorage as well for cross-session recommendations
        const recentlyViewed = JSON.parse(localStorage.getItem('recently_viewed_courses') || '[]');
        
        // Remove if already exists (to move to top)
        const filteredHistory = recentlyViewed.filter((id: string) => id !== courseId);
        
        // Add to beginning of array
        filteredHistory.unshift(courseId);
        
        // Keep only the 10 most recent
        const limitedHistory = filteredHistory.slice(0, 10);
        
        // Save back to localStorage
        localStorage.setItem('recently_viewed_courses', JSON.stringify(limitedHistory));
      } else {
        // For anonymous users, just store in localStorage
        const anonymousHistory = JSON.parse(localStorage.getItem('anonymous_course_history') || '[]');
        
        // Remove if already exists (to move to top)
        const filteredHistory = anonymousHistory.filter((id: string) => id !== courseId);
        
        // Add to beginning of array
        filteredHistory.unshift(courseId);
        
        // Keep only the 10 most recent
        const limitedHistory = filteredHistory.slice(0, 10);
        
        // Save back to localStorage
        localStorage.setItem('anonymous_course_history', JSON.stringify(limitedHistory));
      }
    } catch (error) {
      console.error('Error tracking course view:', error);
    }
  }, [isAuthenticated, user]);

  /**
   * Track when a user clicks on a recommendation
   */
  const trackRecommendationClick = useCallback((recommendedCourseId: string, sourceCourseId: string, recommendationType: string) => {
    if (!recommendedCourseId || !sourceCourseId) return;

    try {
      // For authenticated users, store in database
      if (isAuthenticated && user) {
        // In a real implementation, this would be an API call
        console.log(`[Tracking] User ${user.id} clicked recommendation ${recommendedCourseId} from ${sourceCourseId} (${recommendationType})`);
      }
      
      // Track click for all users
      const allClicks = JSON.parse(localStorage.getItem('recommendation_clicks') || '[]');
      
      // Add click data
      allClicks.push({
        timestamp: new Date().toISOString(),
        recommendedCourseId,
        sourceCourseId,
        recommendationType,
        userId: user?.id || 'anonymous'
      });
      
      // Keep only recent history (last 50 clicks)
      const limitedClicks = allClicks.slice(-50);
      
      // Save back to localStorage
      localStorage.setItem('recommendation_clicks', JSON.stringify(limitedClicks));
    } catch (error) {
      console.error('Error tracking recommendation click:', error);
    }
  }, [isAuthenticated, user]);

  /**
   * Get recently viewed courses
   */
  const getRecentlyViewedCourses = useCallback(() => {
    try {
      if (isAuthenticated) {
        return JSON.parse(localStorage.getItem('recently_viewed_courses') || '[]');
      } else {
        return JSON.parse(localStorage.getItem('anonymous_course_history') || '[]');
      }
    } catch (error) {
      console.error('Error getting recently viewed courses:', error);
      return [];
    }
  }, [isAuthenticated]);

  return {
    trackCourseView,
    trackRecommendationClick,
    getRecentlyViewedCourses
  };
}