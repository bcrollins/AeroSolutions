import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface EnhancedToastProps {
  type?: ToastType;
  title: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
  action?: React.ReactNode;
  className?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

/**
 * Enhanced toast notification component with Apple-inspired animations and styling
 */
const EnhancedToast: React.FC<EnhancedToastProps> = ({
  type = 'info',
  title,
  description,
  onClose,
  action,
  className,
  position = 'bottom-center'
}) => {
  // Define toast variant styles based on type
  const toastVariants = {
    success: 'bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-600',
    error: 'bg-red-50 border-red-500 dark:bg-red-900/20 dark:border-red-600',
    info: 'bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-600',
    warning: 'bg-amber-50 border-amber-500 dark:bg-amber-900/20 dark:border-amber-600'
  };

  // Map types to icons
  const IconComponent = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle
  }[type];

  // Map types to icon colors
  const iconColors = {
    success: 'text-green-500 dark:text-green-400',
    error: 'text-red-500 dark:text-red-400',
    info: 'text-blue-500 dark:text-blue-400',
    warning: 'text-amber-500 dark:text-amber-400'
  };

  // Map position to CSS classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  // Animation variants
  const variants = {
    initial: { 
      opacity: 0,
      y: position.includes('top') ? -20 : 20,
      scale: 0.95
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1] // Apple-like spring 
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.95,
      transition: { 
        duration: 0.2,
        ease: [0.32, 0, 0.67, 0]
      }
    }
  };

  return (
    <motion.div
      className={cn(
        'fixed z-50 shadow-lg backdrop-blur-sm',
        positionClasses[position]
      )}
      role="alert"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
    >
      <div className={cn(
        'rounded-lg border p-4 flex gap-3 max-w-md',
        toastVariants[type],
        className
      )}>
        <div className={cn(
          'flex-shrink-0 rounded-full p-1', 
          iconColors[type]
        )}>
          <IconComponent className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-500 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default EnhancedToast;