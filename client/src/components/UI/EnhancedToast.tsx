import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport
} from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X
} from 'lucide-react';

interface EnhancedToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: ReactNode;
  icon?: ReactNode;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  hasProgress?: boolean;
  className?: string;
}

/**
 * Enhanced toast component with better visuals and animations
 */
export function EnhancedToast({
  title,
  description,
  variant = 'default',
  duration = 5000,
  action,
  icon,
  position = 'bottom-right',
  hasProgress = true,
  className = ''
}: EnhancedToastProps) {
  // Get variant icon
  const getIcon = () => {
    if (icon) return icon;
    
    switch (variant) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };
  
  // Get toast color
  const getColorClass = () => {
    switch (variant) {
      case 'success':
        return 'border-green-100 dark:border-green-900 bg-green-50 dark:bg-green-950/30';
      case 'error':
        return 'border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950/30';
      case 'warning':
        return 'border-amber-100 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30';
      case 'info':
        return 'border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30';
      default:
        return '';
    }
  };
  
  // Position classes mapping
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0'
  };
  
  return (
    <Toast 
      className={`group relative overflow-hidden border ${getColorClass()} ${className}`}
    >
      <div className="flex">
        {/* Icon */}
        {getIcon() && (
          <div className="flex-shrink-0 mr-3">
            {getIcon()}
          </div>
        )}
        
        <div className="flex-1 pr-8">
          {/* Title */}
          {title && (
            <ToastTitle className="font-medium mb-1">
              {title}
            </ToastTitle>
          )}
          
          {/* Description */}
          {description && (
            <ToastDescription className="text-sm text-gray-600 dark:text-gray-300">
              {description}
            </ToastDescription>
          )}
          
          {/* Action button */}
          {action && (
            <div className="mt-2">
              {action}
            </div>
          )}
        </div>
        
        {/* Close button */}
        <ToastClose className="absolute top-2 right-2 rounded-full p-1 text-gray-400 opacity-0 transition-opacity hover:text-gray-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 dark:text-gray-500 dark:hover:text-gray-300">
          <X className="h-4 w-4" />
        </ToastClose>
      </div>
      
      {/* Progress bar */}
      {hasProgress && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-primary"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          style={{ 
            backgroundColor: variant === 'success' 
              ? 'var(--green-500)' 
              : variant === 'error' 
                ? 'var(--red-500)' 
                : variant === 'warning' 
                  ? 'var(--amber-500)' 
                  : variant === 'info' 
                    ? 'var(--blue-500)' 
                    : 'var(--primary)'
          }}
        />
      )}
    </Toast>
  );
}

/**
 * Enhanced toast provider
 */
export function EnhancedToastProvider({
  children,
  position = 'bottom-right'
}: {
  children: React.ReactNode;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}) {
  // Position classes mapping
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0'
  };
  
  return (
    <ToastProvider>
      {children}
      <ToastViewport className={`fixed z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-[420px] gap-2 ${positionClasses[position]}`} />
    </ToastProvider>
  );
}

/**
 * Enhanced toast hook that wraps the default toast hook
 */
export function useEnhancedToast() {
  const { toast } = useToast();
  
  const showToast = ({
    title,
    description,
    variant = 'default',
    duration = 5000,
    action,
    icon,
    hasProgress = true,
    className
  }: EnhancedToastProps) => {
    return toast({
      title,
      description,
      duration,
      action,
      className,
      variant: variant as any, // The underlying toast implementation expects a different type
      // Custom component that renders our enhanced toast
      render: () => (
        <EnhancedToast
          title={title}
          description={description}
          variant={variant}
          duration={duration}
          action={action}
          icon={icon}
          hasProgress={hasProgress}
          className={className}
        />
      )
    });
  };
  
  // Convenience methods for different toast types
  const success = (props: Omit<EnhancedToastProps, 'variant'>) => 
    showToast({ ...props, variant: 'success' });
  
  const error = (props: Omit<EnhancedToastProps, 'variant'>) => 
    showToast({ ...props, variant: 'error' });
  
  const warning = (props: Omit<EnhancedToastProps, 'variant'>) => 
    showToast({ ...props, variant: 'warning' });
  
  const info = (props: Omit<EnhancedToastProps, 'variant'>) => 
    showToast({ ...props, variant: 'info' });
  
  return {
    toast: showToast,
    success,
    error,
    warning,
    info,
    dismiss: toast.dismiss,
    custom: toast // Access to original toast for advanced use cases
  };
}