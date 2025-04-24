import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';

interface NotificationOptions {
  /**
   * Whether to request permission on hook initialization
   * @default false
   */
  requestPermissionOnMount?: boolean;
  
  /**
   * Whether to show tab title notifications
   * @default true
   */
  enableTabNotifications?: boolean;
  
  /**
   * Whether to use browser notifications if available
   * @default true
   */
  enableBrowserNotifications?: boolean;
  
  /**
   * Default title prefix for tab notifications
   * @default "(1) "
   */
  defaultTitlePrefix?: string;
  
  /**
   * Icon to use for browser notifications (path to image)
   */
  icon?: string;
  
  /**
   * Track notification history
   * @default false
   */
  trackHistory?: boolean;
  
  /**
   * Maximum history items to store
   * @default 50
   */
  maxHistoryItems?: number;
  
  /**
   * Auto dismiss tab notifications after time in ms
   * (0 = never auto dismiss)
   * @default 0
   */
  autoDismissAfter?: number;
  
  /**
   * Custom sound URL for notifications
   */
  soundUrl?: string;
  
  /**
   * Default notification settings
   */
  defaultSettings?: {
    muted?: boolean;
    playSound?: boolean;
  };
}

interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  timestamp: number;
  read: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
  data?: any;
}

interface NotificationSettings {
  muted: boolean;
  playSound: boolean;
}

/**
 * Hook for managing browser tab and system notifications
 */
export function useNotification(options: NotificationOptions = {}) {
  const {
    requestPermissionOnMount = false,
    enableTabNotifications = true,
    enableBrowserNotifications = true,
    defaultTitlePrefix = "(1) ",
    icon,
    trackHistory = false,
    maxHistoryItems = 50,
    autoDismissAfter = 0,
    soundUrl,
    defaultSettings = {
      muted: false,
      playSound: true,
    },
  } = options;
  
  // State
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [activeTabNotification, setActiveTabNotification] = useState<string | null>(null);
  const [notificationHistory, setNotificationHistory] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationSettings, setNotificationSettings] = useLocalStorage<NotificationSettings>(
    'rollinsx-notification-settings',
    defaultSettings as NotificationSettings
  );
  
  // Ref to original document title
  const originalTitle = document.title;
  
  // Audio for sound notifications
  const notificationSound = typeof Audio !== 'undefined' && soundUrl
    ? new Audio(soundUrl)
    : null;
  
  // Check if the browser supports notifications
  const hasNotificationSupport = useCallback(() => {
    return 'Notification' in window;
  }, []);
  
  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!hasNotificationSupport()) {
      setPermission('denied');
      return false;
    }
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [hasNotificationSupport]);
  
  // Initialize permission state
  useEffect(() => {
    if (hasNotificationSupport()) {
      setPermission(Notification.permission);
      
      if (requestPermissionOnMount && Notification.permission !== 'granted') {
        requestPermission();
      }
    } else {
      setPermission(null);
    }
    
    // Reset tab title when unmounting
    return () => {
      if (document.title !== originalTitle) {
        document.title = originalTitle;
      }
    };
  }, [requestPermissionOnMount, requestPermission, hasNotificationSupport, originalTitle]);
  
  // Play notification sound
  const playSound = useCallback(() => {
    if (!notificationSettings.muted && notificationSettings.playSound && notificationSound) {
      notificationSound.currentTime = 0;
      notificationSound.play().catch(err => console.log('Error playing notification sound:', err));
    }
  }, [notificationSettings, notificationSound]);
  
  // Send a browser notification
  const sendBrowserNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!hasNotificationSupport() || permission !== 'granted' || !enableBrowserNotifications) {
      return null;
    }
    
    const notification = new Notification(title, {
      ...options,
      icon: options?.icon || icon,
    });
    
    return notification;
  }, [hasNotificationSupport, permission, enableBrowserNotifications, icon]);
  
  // Set document title with notification
  const setTabNotification = useCallback((message: string | null) => {
    if (!enableTabNotifications) return;
    
    if (message) {
      document.title = `${defaultTitlePrefix}${originalTitle}`;
      setActiveTabNotification(message);
      
      // Auto dismiss if configured
      if (autoDismissAfter > 0) {
        setTimeout(() => {
          if (document.title.startsWith(defaultTitlePrefix)) {
            document.title = originalTitle;
            setActiveTabNotification(null);
          }
        }, autoDismissAfter);
      }
    } else {
      document.title = originalTitle;
      setActiveTabNotification(null);
    }
  }, [enableTabNotifications, defaultTitlePrefix, originalTitle, autoDismissAfter]);
  
  // Clear active tab notification
  const clearTabNotification = useCallback(() => {
    setTabNotification(null);
  }, [setTabNotification]);
  
  // Generate a unique notification ID
  const generateNotificationId = () => {
    return Math.random().toString(36).substr(2, 9);
  };
  
  // Send a notification (combines tab and browser notifications)
  const sendNotification = useCallback((title: string, options?: {
    body?: string;
    icon?: string;
    onClick?: () => void;
    onClose?: () => void;
    type?: 'info' | 'success' | 'warning' | 'error';
    data?: any;
    playSound?: boolean;
    tabNotification?: boolean;
    browserNotification?: boolean;
  }) => {
    const {
      body,
      icon: notificationIcon,
      onClick,
      onClose,
      type = 'info',
      data,
      playSound: shouldPlaySound = true,
      tabNotification = true,
      browserNotification = true,
    } = options || {};
    
    // Generate a unique ID for this notification
    const id = generateNotificationId();
    
    // Play sound if enabled
    if (shouldPlaySound) {
      playSound();
    }
    
    // Send browser notification if enabled
    let browserNotif: Notification | null = null;
    if (browserNotification && enableBrowserNotifications) {
      browserNotif = sendBrowserNotification(title, {
        body,
        icon: notificationIcon,
      });
      
      if (browserNotif) {
        // Add event listeners
        if (onClick) browserNotif.onclick = onClick;
        if (onClose) browserNotif.onclose = onClose;
      }
    }
    
    // Set tab notification if enabled
    if (tabNotification && enableTabNotifications) {
      setTabNotification(title);
    }
    
    // Add to history if tracking is enabled
    if (trackHistory) {
      const newNotification: NotificationItem = {
        id,
        title,
        body,
        timestamp: Date.now(),
        read: false,
        type,
        data,
      };
      
      setNotificationHistory(prev => {
        const updated = [newNotification, ...prev].slice(0, maxHistoryItems);
        // Update unread count
        setUnreadCount(updated.filter(n => !n.read).length);
        return updated;
      });
    }
    
    // Return notification ID and methods to interact with it
    return {
      id,
      clear: () => {
        if (browserNotif) browserNotif.close();
        if (tabNotification && enableTabNotifications) clearTabNotification();
      },
      markAsRead: () => {
        if (trackHistory) {
          setNotificationHistory(prev => {
            const updated = prev.map(n => 
              n.id === id ? { ...n, read: true } : n
            );
            setUnreadCount(updated.filter(n => !n.read).length);
            return updated;
          });
        }
      },
    };
  }, [
    playSound, 
    sendBrowserNotification, 
    enableBrowserNotifications, 
    setTabNotification, 
    enableTabNotifications,
    clearTabNotification,
    trackHistory,
    maxHistoryItems
  ]);
  
  // Mark a notification as read
  const markNotificationAsRead = useCallback((id: string) => {
    setNotificationHistory(prev => {
      const updated = prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      setUnreadCount(updated.filter(n => !n.read).length);
      return updated;
    });
  }, []);
  
  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(() => {
    setNotificationHistory(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      setUnreadCount(0);
      return updated;
    });
  }, []);
  
  // Clear notification history
  const clearNotificationHistory = useCallback(() => {
    setNotificationHistory([]);
    setUnreadCount(0);
  }, []);
  
  // Toggle notification settings
  const toggleMute = useCallback(() => {
    setNotificationSettings(prev => ({
      ...prev,
      muted: !prev.muted,
    }));
  }, [setNotificationSettings]);
  
  const toggleSound = useCallback(() => {
    setNotificationSettings(prev => ({
      ...prev,
      playSound: !prev.playSound,
    }));
  }, [setNotificationSettings]);
  
  return {
    // State
    permission,
    hasSupport: hasNotificationSupport(),
    activeTabNotification,
    notificationHistory,
    unreadCount,
    settings: notificationSettings,
    
    // Methods
    requestPermission,
    sendNotification,
    clearTabNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotificationHistory,
    toggleMute,
    toggleSound,
  };
}

export default useNotification;