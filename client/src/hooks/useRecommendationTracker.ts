import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

// Interface for course interactions
interface CourseInteraction {
  courseId: string;
  interactionType: 'view' | 'click' | 'enroll' | 'complete';
  timestamp: number;
  duration?: number; // For tracking view durations
}

/**
 * Hook for tracking user interactions with courses to improve recommendations
 */
export function useRecommendationTracker() {
  const { user, isAuthenticated } = useAuth();
  const [interactionHistory, setInteractionHistory] = useState<CourseInteraction[]>([]);
  const localStorageKey = 'course_interaction_history';
  
  // Load interaction history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(localStorageKey);
      if (savedHistory) {
        setInteractionHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading course interaction history:', error);
    }
  }, []);
  
  // Save interaction history to localStorage when it changes
  useEffect(() => {
    if (interactionHistory.length > 0) {
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(interactionHistory));
        
        // If user is authenticated, sync with server
        if (isAuthenticated && user) {
          syncInteractionsWithServer(interactionHistory);
        }
      } catch (error) {
        console.error('Error saving course interaction history:', error);
      }
    }
  }, [interactionHistory, isAuthenticated, user]);
  
  // Sync interaction data with server
  const syncInteractionsWithServer = async (interactions: CourseInteraction[]) => {
    try {
      // Only sync if we have interactions to report
      if (interactions.length === 0) return;
      
      // Send interactions to server
      const response = await fetch('/api/recommendations/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interactions }),
      });
      
      if (response.ok) {
        console.log('Successfully synced course interactions with server');
      }
    } catch (error) {
      console.error('Error syncing course interactions with server:', error);
    }
  };
  
  // Track a course view
  const trackCourseView = (courseId: string) => {
    const interaction: CourseInteraction = {
      courseId,
      interactionType: 'view',
      timestamp: Date.now()
    };
    
    setInteractionHistory(prev => [...prev, interaction]);
  };
  
  // Track a course click (like on a recommendation card)
  const trackCourseClick = (courseId: string) => {
    const interaction: CourseInteraction = {
      courseId,
      interactionType: 'click',
      timestamp: Date.now()
    };
    
    setInteractionHistory(prev => [...prev, interaction]);
  };
  
  // Track course enrollment
  const trackCourseEnroll = (courseId: string) => {
    const interaction: CourseInteraction = {
      courseId,
      interactionType: 'enroll',
      timestamp: Date.now()
    };
    
    setInteractionHistory(prev => [...prev, interaction]);
  };
  
  // Track course completion
  const trackCourseComplete = (courseId: string) => {
    const interaction: CourseInteraction = {
      courseId,
      interactionType: 'complete',
      timestamp: Date.now()
    };
    
    setInteractionHistory(prev => [...prev, interaction]);
  };
  
  return {
    trackCourseView,
    trackCourseClick,
    trackCourseEnroll,
    trackCourseComplete,
    interactionHistory,
  };
}

export default useRecommendationTracker;