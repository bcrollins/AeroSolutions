import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, BellRing, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSoundEffects } from '@/hooks/use-sound-effects';

// Notification types with different styles and icons
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Individual notification object structure
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  autoClose?: boolean;
  duration?: number;
  actions?: {
    text: string;
    onClick: () => void;
  }[];
}

interface NotificationSystemProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxNotifications?: number;
  className?: string;
}

/**
 * A beautiful notification system with animations and sound effects
 */
const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onDismiss,
  position = 'bottom-right',
  maxNotifications = 5,
  className
}) => {
  const { playSound, settings } = useSoundEffects();
  const soundEnabled = settings?.enabled || false;
  const [activeNotifications, setActiveNotifications] = useState<Notification[]>([]);

  // Update active notifications with max limit
  useEffect(() => {
    const visibleNotifications = [...notifications].slice(0, maxNotifications);
    setActiveNotifications(visibleNotifications);
    
    // Play sound for new notifications
    if (soundEnabled && notifications.length > 0 && notifications.length > activeNotifications.length) {
      // Only play for the newest notification
      const latestNotification = notifications[0];
      if (latestNotification) {
        const soundType = latestNotification.type === 'success' 
          ? 'success' 
          : latestNotification.type === 'error' 
            ? 'error' 
            : 'notification';
        
        playSound(soundType);
      }
    }
  }, [notifications, maxNotifications, playSound, soundEnabled, activeNotifications.length]);

  // Auto-dismiss notifications
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    activeNotifications.forEach(notification => {
      if (notification.autoClose) {
        const timer = setTimeout(() => {
          onDismiss(notification.id);
        }, notification.duration || 5000);
        
        timers.push(timer);
      }
    });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [activeNotifications, onDismiss]);

  // Position classes
  const positionClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-center': 'top-0 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-0 left-1/2 transform -translate-x-1/2'
  };

  // Different animation variants based on position
  const getAnimationVariants = () => {
    switch (position) {
      case 'top-right':
        return {
          initial: { opacity: 0, x: 20, y: 0 },
          animate: { opacity: 1, x: 0, y: 0 },
          exit: { opacity: 0, x: 20, y: 0 }
        };
      case 'top-left':
        return {
          initial: { opacity: 0, x: -20, y: 0 },
          animate: { opacity: 1, x: 0, y: 0 },
          exit: { opacity: 0, x: -20, y: 0 }
        };
      case 'bottom-right':
        return {
          initial: { opacity: 0, x: 20, y: 0 },
          animate: { opacity: 1, x: 0, y: 0 },
          exit: { opacity: 0, x: 20, y: 0 }
        };
      case 'bottom-left':
        return {
          initial: { opacity: 0, x: -20, y: 0 },
          animate: { opacity: 1, x: 0, y: 0 },
          exit: { opacity: 0, x: -20, y: 0 }
        };
      case 'top-center':
      case 'bottom-center':
        return {
          initial: { opacity: 0, y: position.includes('top') ? -10 : 10, scale: 0.95 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: position.includes('top') ? -10 : 10, scale: 0.95 }
        };
    }
  };

  // Get icon based on notification type
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  // Get background color based on notification type
  const getBgColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800';
    }
  };

  // Animation transition
  const transition = {
    duration: 0.2,
    ease: [0.4, 0.0, 0.2, 1]
  };

  return (
    <div
      className={cn(
        "fixed z-50 p-4 flex flex-col gap-2 max-w-sm w-full pointer-events-none",
        positionClasses[position],
        className
      )}
      aria-live="polite"
    >
      <AnimatePresence mode="sync">
        {activeNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            className={cn(
              "pointer-events-auto rounded-lg border shadow-lg overflow-hidden",
              getBgColor(notification.type)
            )}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={getAnimationVariants()}
            transition={transition}
            layout
          >
            <div className="relative">
              {/* Progress bar for auto-close notifications */}
              {notification.autoClose && (
                <motion.div
                  className={cn(
                    "absolute top-0 left-0 h-0.5",
                    notification.type === 'success' ? "bg-green-500" :
                    notification.type === 'error' ? "bg-red-500" :
                    notification.type === 'warning' ? "bg-amber-500" : "bg-blue-500"
                  )}
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ 
                    duration: (notification.duration || 5000) / 1000,
                    ease: "linear"
                  }}
                />
              )}
              
              <div className="p-4 flex">
                <div className="flex-shrink-0 mr-3">
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 mr-2">
                  <h4 className={cn(
                    "text-sm font-medium",
                    notification.type === 'success' ? "text-green-800 dark:text-green-200" :
                    notification.type === 'error' ? "text-red-800 dark:text-red-200" :
                    notification.type === 'warning' ? "text-amber-800 dark:text-amber-200" : 
                    "text-blue-800 dark:text-blue-200"
                  )}>
                    {notification.title}
                  </h4>
                  
                  {notification.message && (
                    <div className={cn(
                      "mt-1 text-sm",
                      notification.type === 'success' ? "text-green-700 dark:text-green-300" :
                      notification.type === 'error' ? "text-red-700 dark:text-red-300" :
                      notification.type === 'warning' ? "text-amber-700 dark:text-amber-300" : 
                      "text-blue-700 dark:text-blue-300"
                    )}>
                      {notification.message}
                    </div>
                  )}
                  
                  {notification.actions && notification.actions.length > 0 && (
                    <div className="mt-2 flex space-x-2">
                      {notification.actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (soundEnabled) playSound('click');
                            action.onClick();
                          }}
                          className={cn(
                            "px-2 py-1 text-xs font-medium rounded-md",
                            notification.type === 'success' ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-800/30 dark:text-green-100 dark:hover:bg-green-800/50" :
                            notification.type === 'error' ? "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-800/30 dark:text-red-100 dark:hover:bg-red-800/50" :
                            notification.type === 'warning' ? "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-800/30 dark:text-amber-100 dark:hover:bg-amber-800/50" : 
                            "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-800/30 dark:text-blue-100 dark:hover:bg-blue-800/50"
                          )}
                        >
                          {action.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    if (soundEnabled) playSound('click');
                    onDismiss(notification.id);
                  }}
                  className={cn(
                    "flex-shrink-0 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2",
                    notification.type === 'success' ? "text-green-400 hover:text-green-500 focus:ring-green-500" :
                    notification.type === 'error' ? "text-red-400 hover:text-red-500 focus:ring-red-500" :
                    notification.type === 'warning' ? "text-amber-400 hover:text-amber-500 focus:ring-amber-500" : 
                    "text-blue-400 hover:text-blue-500 focus:ring-blue-500"
                  )}
                >
                  <span className="sr-only">Dismiss</span>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationSystem;