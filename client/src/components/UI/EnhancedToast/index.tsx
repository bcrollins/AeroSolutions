import React, { useEffect } from 'react';
import { Toast as ShadcnToast, ToastProps } from '@/components/ui/toast';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import './styles.css';

export interface EnhancedToastProps {
  id?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  autoClose?: boolean;
  autoCloseDelay?: number;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  open?: boolean;
  variant?: "default" | "destructive";
};

/**
 * EnhancedToast - An advanced toast notification with better visuals and animations
 */
export const EnhancedToast: React.FC<EnhancedToastProps> = ({
  className,
  type = 'info',
  title,
  description,
  action,
  autoClose = true,
  autoCloseDelay = 5000,
  ...props
}) => {
  const { dismiss } = useToast();
  
  // Auto close the toast after delay
  useEffect(() => {
    if (autoClose && props.id) {
      const timer = setTimeout(() => {
        dismiss(props.id as string);
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, dismiss, props.id]);
  
  // Determine icon based on type
  const Icon = () => {
    switch (type) {
      case 'success':
        return <Check className="text-green-500" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-amber-500" size={20} />;
      case 'info':
      default:
        return <Info className="text-blue-500" size={20} />;
    }
  };
  
  return (
    <Toast
      className={cn(
        'enhanced-toast group flex items-start p-4 border',
        `enhanced-toast-${type}`,
        className
      )}
      {...props}
    >
      <div className="flex-shrink-0 mr-3 pt-0.5">
        <Icon />
      </div>
      
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold">{title}</div>}
        {description && (
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{description}</div>
        )}
        
        {action && (
          <div className="mt-3">
            <ToastAction altText="Action" className="enhanced-toast-action" asChild>
              {action}
            </ToastAction>
          </div>
        )}
      </div>
      
      <button
        onClick={() => props.id && dismiss(props.id as string)}
        className="ml-4 -mt-1 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Close"
      >
        <X size={16} />
      </button>
      
      <div className="enhanced-toast-progress-bar"></div>
    </Toast>
  );
};

/**
 * AnimatedToastViewport - Wrapper for toast viewport with animations
 */
export const AnimatedToastViewport: React.FC<React.ComponentProps<typeof motion.div>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <motion.div
      className={cn('fixed bottom-0 right-0 z-50 flex flex-col p-4 gap-2 w-full max-w-sm', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      <AnimatePresence>
        {children}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * Enhanced useToast hook
 */
export const useEnhancedToast = () => {
  const { toast, dismiss } = useToast();
  
  const showToast = (props: Omit<EnhancedToastProps, 'id'>) => {
    return toast({
      ...props,
      variant: props.type === 'success' ? 'default' : (props.type as any),
    });
  };
  
  const success = (title: React.ReactNode, description?: React.ReactNode, action?: React.ReactNode) => {
    return showToast({ 
      title, 
      description, 
      action, 
      type: 'success' 
    });
  };
  
  const error = (title: React.ReactNode, description?: React.ReactNode, action?: React.ReactNode) => {
    return showToast({ 
      title, 
      description, 
      action, 
      type: 'error',
      autoClose: false, // Errors don't auto-close by default
    });
  };
  
  const warning = (title: React.ReactNode, description?: React.ReactNode, action?: React.ReactNode) => {
    return showToast({ 
      title, 
      description, 
      action, 
      type: 'warning' 
    });
  };
  
  const info = (title: React.ReactNode, description?: React.ReactNode, action?: React.ReactNode) => {
    return showToast({ 
      title, 
      description, 
      action, 
      type: 'info' 
    });
  };
  
  return {
    toast: showToast,
    success,
    error,
    warning,
    info,
    dismiss,
  };
};