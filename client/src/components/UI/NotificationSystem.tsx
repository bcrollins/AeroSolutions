import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaInfoCircle, 
  FaTimesCircle,
  FaTimes 
} from 'react-icons/fa';

// Types
type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

// Create Context
const NotificationContext = createContext<NotificationContextType | null>(null);

// Provider Component
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Show notification
  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000 // Default duration is 5 seconds
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto dismiss if duration is set
    if (newNotification.duration > 0) {
      setTimeout(() => {
        dismissNotification(id);
      }, newNotification.duration);
    }
  };
  
  // Dismiss notification
  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };
  
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        dismissNotification,
        clearAllNotifications
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

// Hook for using notifications
export function useNotification() {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
}

// Notification Container Component
function NotificationContainer() {
  const { notifications, dismissNotification } = useNotification();
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
            className="pointer-events-auto"
          >
            <NotificationItem
              notification={notification}
              onDismiss={() => dismissNotification(notification.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Notification Item Component
function NotificationItem({ 
  notification, 
  onDismiss 
}: { 
  notification: Notification; 
  onDismiss: () => void; 
}) {
  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <FaTimesCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <FaExclamationCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <FaInfoCircle className="h-5 w-5 text-blue-500" />;
    }
  };
  
  // Get notification class based on type
  const getNotificationClass = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-500 bg-green-50 text-green-800';
      case 'error':
        return 'border-red-500 bg-red-50 text-red-800';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      default:
        return 'border-blue-500 bg-blue-50 text-blue-800';
    }
  };
  
  return (
    <div
      className={`flex w-full rounded-lg border-l-4 p-4 shadow-lg shadow-gray-200 backdrop-blur-sm ${getNotificationClass()}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="mr-3 flex-shrink-0">{getIcon()}</div>
      <div className="flex-1">
        <div className="mb-1 text-sm font-medium">{notification.title}</div>
        <p className="text-xs">{notification.message}</p>
        {notification.action && (
          <button
            onClick={notification.action.onClick}
            className="mt-2 text-xs font-medium underline"
          >
            {notification.action.label}
          </button>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="ml-4 flex-shrink-0 self-start rounded-full p-1 transition-colors hover:bg-gray-200"
        aria-label="Dismiss notification"
      >
        <FaTimes className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  );
}

// MicroInteractions utility for common animation patterns
export const MicroInteractions = {
  // Scale animation on hover
  HoverScale: ({ 
    children, 
    scale = 1.05, 
    className = '' 
  }: { 
    children: ReactNode; 
    scale?: number; 
    className?: string; 
  }) => (
    <motion.div
      whileHover={{ scale }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      className={className}
    >
      {children}
    </motion.div>
  ),
  
  // Stagger children animations
  StaggerChildren: ({ 
    children, 
    className = '',
    staggerDelay = 0.05
  }: { 
    children: ReactNode; 
    className?: string;
    staggerDelay?: number;
  }) => (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {React.Children.map(children, (child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  ),
  
  // Fade in animation
  FadeIn: ({ 
    children, 
    delay = 0,
    className = '' 
  }: { 
    children: ReactNode; 
    delay?: number;
    className?: string; 
  }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  ),
  
  // Slide In animation
  SlideIn: ({ 
    children, 
    direction = 'left',
    delay = 0,
    className = '' 
  }: { 
    children: ReactNode; 
    direction?: 'left' | 'right' | 'top' | 'bottom';
    delay?: number;
    className?: string; 
  }) => {
    const slideVariants = {
      hidden: {
        x: direction === 'left' ? -50 : direction === 'right' ? 50 : 0,
        y: direction === 'top' ? -50 : direction === 'bottom' ? 50 : 0,
        opacity: 0
      },
      visible: {
        x: 0,
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.5,
          ease: 'easeOut',
          delay
        }
      }
    };
    
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={slideVariants}
        className={className}
      >
        {children}
      </motion.div>
    );
  },
  
  // Pulse animation
  Pulse: ({ 
    children, 
    className = '' 
  }: { 
    children: ReactNode; 
    className?: string; 
  }) => (
    <motion.div
      animate={{ 
        scale: [1, 1.05, 1],
        boxShadow: [
          '0 0 0 rgba(0, 102, 204, 0)',
          '0 0 10px rgba(0, 102, 204, 0.5)',
          '0 0 0 rgba(0, 102, 204, 0)'
        ]
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        repeatType: 'loop'
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
};