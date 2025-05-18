import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook for managing recommendation sync across devices
 */
export default function useRecommendationSync() {
  const { isAuthenticated } = useAuth();
  const [syncStatus, setSyncStatus] = useState({
    lastSynced: null as Date | null,
    syncInProgress: false,
    syncError: null as string | null,
    deviceCount: 0
  });

  // Function to force sync
  const forceSync = useCallback(() => {
    if (!isAuthenticated) {
      setSyncStatus(prev => ({
        ...prev,
        syncError: "You must be logged in to sync recommendations"
      }));
      return;
    }

    setSyncStatus(prev => ({
      ...prev,
      syncInProgress: true,
      syncError: null
    }));

    // Simulate API call for sync
    setTimeout(() => {
      setSyncStatus({
        lastSynced: new Date(),
        syncInProgress: false,
        syncError: null,
        deviceCount: Math.floor(Math.random() * 3) + 1 // Random number of devices (1-3)
      });
    }, 2000);
  }, [isAuthenticated]);

  // Auto sync on initial load if authenticated
  useEffect(() => {
    if (isAuthenticated && !syncStatus.lastSynced && !syncStatus.syncInProgress) {
      forceSync();
    }
  }, [isAuthenticated, syncStatus.lastSynced, syncStatus.syncInProgress, forceSync]);

  return {
    syncStatus,
    forceSync
  };
}