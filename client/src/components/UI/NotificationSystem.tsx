import { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaInfoCircle, FaExclamationTriangle, FaTimesCircle, FaTimes, FaBell } from 'react-icons/fa';

// Notification types
export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  duration?: number; // Duration in ms, default 5000ms (5s)
  action?: {
    label: string;
    onClick: () => void;
  };
};

// Context type
type NotificationContextType = {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id'>) => string;
  hideNotification: (id: string) => void;
  clearAllNotifications: () => void;
};

// Create context
const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  showNotification: () => '',
  hideNotification: () => {},
  clearAllNotifications: () => {},
});

// Hook to use notifications
export const useNotification = () => useContext(NotificationContext);

// Helper to generate a unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Provider component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Show a notification
  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = generateId();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto-hide after duration
    if (notification.duration !== 0) {
      const duration = notification.duration || 5000;
      setTimeout(() => {
        hideNotification(id);
      }, duration);
    }

    return id;
  };

  // Hide a notification
  const hideNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, hideNotification, clearAllNotifications }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Function to get icon based on notification type
const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <FaCheckCircle className="w-5 h-5 text-green-500" />;
    case 'info':
      return <FaInfoCircle className="w-5 h-5 text-blue-500" />;
    case 'warning':
      return <FaExclamationTriangle className="w-5 h-5 text-yellow-500" />;
    case 'error':
      return <FaTimesCircle className="w-5 h-5 text-red-500" />;
  }
};

// Function to get background color based on notification type
const getBackgroundColor = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200';
    case 'info':
      return 'bg-blue-50 border-blue-200';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200';
    case 'error':
      return 'bg-red-50 border-red-200';
  }
};

// Notification container component
const NotificationContainer = () => {
  const { notifications, hideNotification } = useNotification();

  return (
    <div className="fixed top-0 right-0 p-4 z-50 w-full sm:w-96 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`mb-3 p-4 rounded-lg shadow-lg border pointer-events-auto ${getBackgroundColor(notification.type)}`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                {notification.action && (
                  <button
                    onClick={notification.action.onClick}
                    className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {notification.action.label}
                  </button>
                )}
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => hideNotification(notification.id)}
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Additional notification badge component for use in navigation, etc.
export const NotificationBadge: React.FC<{ count?: number; onClick?: () => void }> = ({ count = 0, onClick }) => {
  return (
    <button 
      className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
      onClick={onClick}
    >
      <span className="sr-only">View notifications</span>
      <FaBell className="h-6 w-6" />
      
      {count > 0 && (
        <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white ring-2 ring-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
};

// MicroInteractions component for reusable animations
export const MicroInteractions = {
  // Pulse animation for attracting attention
  Pulse: ({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <motion.div
      animate={{ 
        scale: [1, 1.05, 1],
      }}
      transition={{ 
        repeat: Infinity, 
        repeatType: "loop", 
        duration: 2,
        repeatDelay: 0.5
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  ),
  
  // Bounce animation for call-to-action elements
  Bounce: ({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <motion.div
      animate={{ 
        y: [0, -10, 0],
      }}
      transition={{ 
        repeat: Infinity, 
        repeatType: "loop", 
        duration: 1.5,
        repeatDelay: 1
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  ),
  
  // Subtle hover effect for interactive elements
  HoverScale: ({ children, className = '', scale = 1.05, ...props }: React.HTMLAttributes<HTMLDivElement> & { scale?: number }) => (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  ),
  
  // Fade in animation for progressive disclosure
  FadeIn: ({ children, className = '', delay = 0, ...props }: React.HTMLAttributes<HTMLDivElement> & { delay?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.25, 0.1, 0.25, 1.0]
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  ),
  
  // Staggered reveal for lists of items
  StaggerChildren: ({ 
    children, 
    className = '', 
    staggerDelay = 0.1,
    ...props 
  }: React.HTMLAttributes<HTMLDivElement> & { staggerDelay?: number }) => {
    const childrenArray = React.Children.toArray(children);
    
    return (
      <div className={className} {...props}>
        {childrenArray.map((child, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: index * staggerDelay,
              duration: 0.4,
              ease: [0.25, 0.1, 0.25, 1.0]
            }}
          >
            {child}
          </motion.div>
        ))}
      </div>
    );
  }
};

// Example usage:
/*
import { useNotification, NotificationProvider, MicroInteractions } from '@/components/UI/NotificationSystem';

// In your app
<NotificationProvider>
  <AppContent />
</NotificationProvider>

// In a component
const Component = () => {
  const { showNotification } = useNotification();
  
  const handleClick = () => {
    showNotification({
      title: 'Success!',
      message: 'Your action was completed successfully.',
      type: 'success',
      action: {
        label: 'Undo',
        onClick: () => console.log('Undo clicked')
      }
    });
  };
  
  return (
    <div>
      <button onClick={handleClick}>Show Notification</button>
      
      <MicroInteractions.Pulse>
        <span>This pulses to attract attention</span>
      </MicroInteractions.Pulse>
      
      <MicroInteractions.HoverScale>
        <button>Hover me</button>
      </MicroInteractions.HoverScale>
    </div>
  );
};
*/