import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface SyncedRecommendation {
  courseId: string;
  timestamp: number;
  source: string; // device or platform where the interaction originated
  interactionType: 'view' | 'click' | 'bookmark' | 'saved_for_later';
}

interface SyncStatus {
  lastSynced: number | null;
  syncInProgress: boolean;
  syncError: string | null;
}

const LOCALSTORAGE_KEY = 'recommendation_sync_data';
const SYNC_INTERVAL = 1000 * 60 * 5; // 5 minutes

/**
 * Hook for syncing recommendation data across devices
 */
export function useRecommendationSync() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSynced: null,
    syncInProgress: false,
    syncError: null
  });
  const [pendingSync, setPendingSync] = useState<SyncedRecommendation[]>([]);
  
  // Get device identifier (or generate one if not available)
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  };
  
  // Get local storage recommendations (for non-authenticated users or offline state)
  const getLocalRecommendations = (): SyncedRecommendation[] => {
    try {
      const storedData = localStorage.getItem(LOCALSTORAGE_KEY);
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error('Error parsing local recommendations:', error);
    }
    return [];
  };
  
  // Set local storage recommendations
  const setLocalRecommendations = (recommendations: SyncedRecommendation[]) => {
    try {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(recommendations));
    } catch (error) {
      console.error('Error saving local recommendations:', error);
    }
  };
  
  // Fetch remote sync data for authenticated users
  const { data: remoteSyncData, refetch: refetchRemoteData } = useQuery({
    queryKey: ['/api/user/recommendation-sync'],
    queryFn: async () => {
      const response = await fetch('/api/user/recommendation-sync');
      if (!response.ok) throw new Error('Failed to fetch synced recommendations');
      return response.json();
    },
    enabled: isAuthenticated,
    retry: 2,
    staleTime: SYNC_INTERVAL
  });
  
  // Push local data to server mutation
  const syncMutation = useMutation({
    mutationFn: async (recommendations: SyncedRecommendation[]) => {
      const response = await fetch('/api/user/recommendation-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recommendations }),
      });
      
      if (!response.ok) throw new Error('Failed to sync recommendations');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/recommendation-sync'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations/personalized'] });
      
      setSyncStatus(prev => ({
        ...prev,
        lastSynced: Date.now(),
        syncInProgress: false,
        syncError: null
      }));
      
      setPendingSync([]);
    },
    onError: (error: Error) => {
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        syncError: error.message
      }));
      
      toast({
        title: "Sync failed",
        description: "We'll try again later to sync your recommendations",
        variant: "destructive",
        duration: 3000,
      });
    }
  });
  
  // Merge local and remote recommendations
  const mergeRecommendations = (local: SyncedRecommendation[], remote: SyncedRecommendation[] = []) => {
    // Create a map for faster lookup
    const mergedMap = new Map<string, SyncedRecommendation>();
    
    // Add all local recommendations
    local.forEach(rec => {
      const key = `${rec.courseId}-${rec.interactionType}`;
      mergedMap.set(key, rec);
    });
    
    // Add or update with remote recommendations (more recent ones win)
    remote.forEach(rec => {
      const key = `${rec.courseId}-${rec.interactionType}`;
      const existing = mergedMap.get(key);
      
      if (!existing || existing.timestamp < rec.timestamp) {
        mergedMap.set(key, rec);
      }
    });
    
    return Array.from(mergedMap.values());
  };
  
  // Track a recommendation interaction (view, click, etc.)
  const trackInteraction = (courseId: string, interactionType: 'view' | 'click' | 'bookmark' | 'saved_for_later') => {
    const deviceId = getDeviceId();
    const timestamp = Date.now();
    
    const newInteraction: SyncedRecommendation = {
      courseId,
      timestamp,
      source: deviceId,
      interactionType
    };
    
    // Always update local storage
    const localData = getLocalRecommendations();
    const updatedLocalData = mergeRecommendations([...localData, newInteraction]);
    setLocalRecommendations(updatedLocalData);
    
    // If authenticated, add to pending sync
    if (isAuthenticated) {
      setPendingSync(prev => [...prev, newInteraction]);
    }
    
    return newInteraction;
  };
  
  // Perform the sync operation
  const performSync = () => {
    if (!isAuthenticated || syncStatus.syncInProgress || pendingSync.length === 0) {
      return;
    }
    
    setSyncStatus(prev => ({ ...prev, syncInProgress: true }));
    syncMutation.mutate(pendingSync);
  };
  
  // Force sync (can be called manually)
  const forceSync = () => {
    if (!isAuthenticated) {
      toast({
        title: "Not logged in",
        description: "Please log in to sync your recommendations across devices",
        duration: 3000,
      });
      return;
    }
    
    const localData = getLocalRecommendations();
    if (localData.length > 0) {
      setPendingSync(localData);
      setSyncStatus(prev => ({ ...prev, syncInProgress: true }));
      syncMutation.mutate(localData);
    } else {
      toast({
        title: "Nothing to sync",
        description: "Your recommendations are already up to date",
        duration: 3000,
      });
    }
  };
  
  // Initial setup effect
  useEffect(() => {
    // When remote data is loaded, merge with local
    if (isAuthenticated && remoteSyncData?.recommendations) {
      const localData = getLocalRecommendations();
      const mergedData = mergeRecommendations(localData, remoteSyncData.recommendations);
      setLocalRecommendations(mergedData);
      
      setSyncStatus(prev => ({
        ...prev,
        lastSynced: Date.now()
      }));
    }
  }, [isAuthenticated, remoteSyncData]);
  
  // Sync effect (runs when pendingSync changes)
  useEffect(() => {
    if (pendingSync.length > 0) {
      const syncTimeout = setTimeout(() => {
        performSync();
      }, 2000); // Small delay to batch sync operations
      
      return () => clearTimeout(syncTimeout);
    }
  }, [pendingSync]);
  
  // Periodic sync effect
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const intervalId = setInterval(() => {
      refetchRemoteData();
    }, SYNC_INTERVAL);
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, refetchRemoteData]);
  
  // Login/logout effect
  useEffect(() => {
    if (isAuthenticated) {
      // User just logged in, sync local data
      const localData = getLocalRecommendations();
      if (localData.length > 0) {
        setPendingSync(localData);
        performSync();
      }
    }
  }, [isAuthenticated]);
  
  return {
    syncStatus,
    trackInteraction,
    forceSync,
    // Convenience methods
    trackView: (courseId: string) => trackInteraction(courseId, 'view'),
    trackClick: (courseId: string) => trackInteraction(courseId, 'click'),
    trackBookmark: (courseId: string) => trackInteraction(courseId, 'bookmark'),
    trackSaveForLater: (courseId: string) => trackInteraction(courseId, 'saved_for_later'),
  };
}

export default useRecommendationSync;