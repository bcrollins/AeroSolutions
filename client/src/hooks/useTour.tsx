import { useState, useEffect, useCallback } from 'react';

// Key to store tour status in localStorage
const TOUR_COMPLETION_KEY_PREFIX = 'rollinsx_tour_completed_';

/**
 * Custom hook to manage guided tours
 */
export function useTour(tourId: string) {
  const [showTour, setShowTour] = useState<boolean>(false);
  const [tourCompleted, setTourCompleted] = useState<boolean>(true);
  
  // Key specific to this tour
  const storageKey = `${TOUR_COMPLETION_KEY_PREFIX}${tourId}`;
  
  useEffect(() => {
    // Check if the tour has been completed before
    const tourCompletedStatus = localStorage.getItem(storageKey);
    
    // If never completed, show the tour by default (unless this is the first visit)
    if (tourCompletedStatus === null) {
      // Check if this is the very first visit to the site
      const firstVisit = localStorage.getItem('rollinsx_first_visit');
      
      if (firstVisit === null) {
        // Set first visit flag to prevent all tours from showing at once on first visit
        localStorage.setItem('rollinsx_first_visit', 'true');
        
        // For the first visit, only show homepage tour
        if (tourId === 'homepage') {
          setTourCompleted(false);
        }
      } else {
        // Not first visit, show the tour
        setTourCompleted(false);
      }
    } else {
      setTourCompleted(tourCompletedStatus === 'true');
    }
  }, [tourId, storageKey]);
  
  // Start the tour
  const startTour = useCallback(() => {
    setShowTour(true);
  }, []);
  
  // Complete the tour
  const completeTour = useCallback(() => {
    localStorage.setItem(storageKey, 'true');
    setTourCompleted(true);
    setShowTour(false);
  }, [storageKey]);
  
  // Close the tour without marking as completed
  const closeTour = useCallback(() => {
    setShowTour(false);
  }, []);
  
  // Reset tour status (for testing or when features change)
  const resetTour = useCallback(() => {
    localStorage.removeItem(storageKey);
    setTourCompleted(false);
  }, [storageKey]);
  
  // Auto-start tour when not completed
  useEffect(() => {
    if (!tourCompleted) {
      // Small delay to make sure the page is fully loaded
      const timer = setTimeout(() => {
        startTour();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [tourCompleted, startTour]);
  
  return {
    showTour,
    tourCompleted,
    startTour,
    completeTour,
    closeTour,
    resetTour
  };
}