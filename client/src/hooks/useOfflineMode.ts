import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OfflineModeOptions {
  /**
   * Enable showing connectivity status toasts
   * @default true
   */
  showToasts?: boolean;
  
  /**
   * Custom handler for online state changes
   */
  onOnline?: () => void;
  
  /**
   * Custom handler for offline state changes
   */
  onOffline?: () => void;
  
  /**
   * Enable automatic data synchronization when coming back online
   * @default true
   */
  enableAutoSync?: boolean;
  
  /**
   * Storage key for offline operations
   * @default "rollinsx_offline_operations"
   */
  storageKey?: string;
  
  /**
   * Time in ms to debounce connectivity checks
   * @default 500
   */
  debounceTime?: number;
  
  /**
   * Enable periodic connectivity checks
   * @default true
   */
  enablePeriodicChecks?: boolean;
  
  /**
   * Interval for periodic connectivity checks (in ms)
   * @default 30000 (30 seconds)
   */
  checkInterval?: number;
}

interface OfflineOperation<T = any> {
  id: string;
  type: 'create' | 'update' | 'delete' | 'custom';
  endpoint: string;
  data: T;
  timestamp: number;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  retry?: number;
  metadata?: Record<string, any>;
}

/**
 * Hook for managing offline mode and operations queue
 */
export function useOfflineMode(options: OfflineModeOptions = {}) {
  const {
    showToasts = true,
    onOnline,
    onOffline,
    enableAutoSync = true,
    storageKey = 'rollinsx_offline_operations',
    debounceTime = 500,
    enablePeriodicChecks = true,
    checkInterval = 30000, // 30 seconds
  } = options;
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineOperations, setOfflineOperations] = useState<OfflineOperation[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  
  // Initialize: load saved operations
  useEffect(() => {
    try {
      const savedOperations = localStorage.getItem(storageKey);
      if (savedOperations) {
        setOfflineOperations(JSON.parse(savedOperations));
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading offline operations:', error);
      setIsInitialized(true);
    }
  }, [storageKey]);
  
  // Save operations to localStorage when they change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(storageKey, JSON.stringify(offlineOperations));
    }
  }, [offlineOperations, storageKey, isInitialized]);
  
  // Handle online/offline events
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>;
    
    const handleOnline = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        setIsOnline(true);
        
        if (showToasts) {
          toast({
            title: 'You are online',
            description: 'Your connection has been restored.',
            type: 'success',
          });
        }
        
        if (onOnline) {
          onOnline();
        }
        
        // Auto-sync if enabled
        if (enableAutoSync && offlineOperations.length > 0) {
          syncOfflineOperations();
        }
      }, debounceTime);
    };
    
    const handleOffline = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        setIsOnline(false);
        
        if (showToasts) {
          toast({
            title: 'You are offline',
            description: 'Changes will be saved locally until you reconnect.',
            type: 'warning',
          });
        }
        
        if (onOffline) {
          onOffline();
        }
      }, debounceTime);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(debounceTimer);
    };
  }, [toast, showToasts, onOnline, onOffline, enableAutoSync, offlineOperations, debounceTime]);
  
  // Periodic connectivity checks
  useEffect(() => {
    if (!enablePeriodicChecks) return;
    
    const checkConnectivity = async () => {
      try {
        // Try to fetch a small resource to verify connectivity
        // Use a timestamp to prevent caching
        const timestamp = Date.now();
        const response = await fetch(`/api/health-check?t=${timestamp}`, {
          method: 'HEAD',
          cache: 'no-store',
          // Short timeout to avoid hanging
          signal: AbortSignal.timeout(3000),
        });
        
        const newOnlineStatus = response.ok;
        if (newOnlineStatus !== isOnline) {
          setIsOnline(newOnlineStatus);
          
          if (newOnlineStatus) {
            if (showToasts) {
              toast({
                title: 'You are online',
                description: 'Your connection has been restored.',
                type: 'success',
              });
            }
            
            if (onOnline) {
              onOnline();
            }
            
            // Auto-sync if enabled
            if (enableAutoSync && offlineOperations.length > 0) {
              syncOfflineOperations();
            }
          } else {
            if (showToasts) {
              toast({
                title: 'You are offline',
                description: 'Changes will be saved locally until you reconnect.',
                type: 'warning',
              });
            }
            
            if (onOffline) {
              onOffline();
            }
          }
        }
      } catch (error) {
        // If fetch fails, likely offline
        if (isOnline) {
          setIsOnline(false);
          
          if (showToasts) {
            toast({
              title: 'You are offline',
              description: 'Changes will be saved locally until you reconnect.',
              type: 'warning',
            });
          }
          
          if (onOffline) {
            onOffline();
          }
        }
      }
    };
    
    const interval = setInterval(checkConnectivity, checkInterval);
    
    return () => {
      clearInterval(interval);
    };
  }, [
    isOnline, 
    showToasts, 
    toast, 
    onOnline, 
    onOffline, 
    enableAutoSync, 
    offlineOperations, 
    enablePeriodicChecks, 
    checkInterval
  ]);
  
  // Add operation to queue
  const addOfflineOperation = useCallback(<T>(
    operation: Omit<OfflineOperation<T>, 'id' | 'timestamp'>
  ) => {
    const newOperation: OfflineOperation<T> = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      ...operation,
    };
    
    setOfflineOperations(prev => [...prev, newOperation]);
    
    return newOperation.id;
  }, []);
  
  // Remove operation from queue
  const removeOfflineOperation = useCallback((id: string) => {
    setOfflineOperations(prev => prev.filter(op => op.id !== id));
  }, []);
  
  // Clear all operations
  const clearOfflineOperations = useCallback(() => {
    setOfflineOperations([]);
  }, []);
  
  // Synchronize operations with server
  const syncOfflineOperations = useCallback(async () => {
    if (!isOnline || isSyncing || offlineOperations.length === 0) {
      return { success: false, processed: 0, failed: 0 };
    }
    
    setIsSyncing(true);
    
    let processed = 0;
    let failed = 0;
    let successfulIds: string[] = [];
    let failedIds: string[] = [];
    
    try {
      for (const operation of offlineOperations) {
        try {
          const method = operation.method || 
            (operation.type === 'create' ? 'POST' : 
             operation.type === 'update' ? 'PUT' :
             operation.type === 'delete' ? 'DELETE' : 'POST');
          
          const response = await fetch(operation.endpoint, {
            method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: method !== 'GET' ? JSON.stringify(operation.data) : undefined,
          });
          
          if (response.ok) {
            processed++;
            successfulIds.push(operation.id);
          } else {
            failed++;
            failedIds.push(operation.id);
            console.error(`Failed to sync operation ${operation.id}:`, await response.text());
          }
        } catch (error) {
          failed++;
          failedIds.push(operation.id);
          console.error(`Error processing operation ${operation.id}:`, error);
        }
      }
      
      // Remove successful operations
      setOfflineOperations(prev => prev.filter(op => !successfulIds.includes(op.id)));
      
      if (showToasts && processed > 0) {
        toast({
          title: 'Synchronization complete',
          description: `Successfully synchronized ${processed} operations.${failed > 0 ? ` ${failed} operations failed.` : ''}`,
          type: failed > 0 ? 'warning' : 'success',
        });
      }
      
      return { 
        success: true, 
        processed, 
        failed,
        successfulIds,
        failedIds,
      };
    } catch (error) {
      console.error('Error during synchronization:', error);
      
      if (showToasts) {
        toast({
          title: 'Synchronization failed',
          description: 'Unable to sync your offline changes. Will try again later.',
          type: 'destructive',
        });
      }
      
      return { 
        success: false, 
        processed, 
        failed: offlineOperations.length - processed,
        successfulIds,
        failedIds,
        error,
      };
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, offlineOperations, showToasts, toast]);
  
  // Perform fetch with offline support
  const offlineFetch = useCallback(async <T = any>(
    url: string,
    options: RequestInit & {
      offlineOptions?: {
        type: 'create' | 'update' | 'delete' | 'custom';
        data: any;
        metadata?: Record<string, any>;
        processOfflineResponse?: (data: any) => T;
      };
    }
  ): Promise<T> => {
    const { offlineOptions, ...fetchOptions } = options;
    
    // If online, try normal fetch
    if (isOnline) {
      try {
        const response = await fetch(url, fetchOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data as T;
      } catch (error) {
        // If fetch fails and we have offline options, queue it
        if (offlineOptions) {
          const { processOfflineResponse, ...queueOptions } = offlineOptions;
          
          // Add to offline queue
          addOfflineOperation({
            endpoint: url,
            method: fetchOptions.method as any,
            ...queueOptions,
          });
          
          // If there's an offline response processor, use it
          if (processOfflineResponse) {
            return processOfflineResponse(offlineOptions.data);
          }
          
          // Return original data as fallback
          return offlineOptions.data as unknown as T;
        }
        
        // Re-throw if we can't handle offline
        throw error;
      }
    } else {
      // If offline and we have offline options, queue the operation
      if (offlineOptions) {
        const { processOfflineResponse, ...queueOptions } = offlineOptions;
        
        // Add to offline queue
        addOfflineOperation({
          endpoint: url,
          method: fetchOptions.method as any,
          ...queueOptions,
        });
        
        // If there's an offline response processor, use it
        if (processOfflineResponse) {
          return processOfflineResponse(offlineOptions.data);
        }
        
        // Return original data as fallback
        return offlineOptions.data as unknown as T;
      }
      
      // Throw error if we can't handle offline
      throw new Error('You are offline and this operation cannot be queued for later.');
    }
  }, [isOnline, addOfflineOperation]);
  
  return {
    isOnline,
    offlineOperations,
    isSyncing,
    isInitialized,
    pendingOperations: offlineOperations.length,
    
    // Methods
    addOfflineOperation,
    removeOfflineOperation,
    clearOfflineOperations,
    syncOfflineOperations,
    offlineFetch,
  };
}

export default useOfflineMode;