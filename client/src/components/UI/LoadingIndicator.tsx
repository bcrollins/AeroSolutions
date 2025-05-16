import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingIndicatorProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent' | 'white' | 'black';
  type?: 'spinner' | 'dots' | 'pulse' | 'progress';
  text?: string;
  className?: string;
  centered?: boolean;
  fullScreen?: boolean;
}

/**
 * A collection of beautiful loading indicators with Apple-inspired animations
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'md',
  color = 'primary',
  type = 'spinner',
  text,
  className,
  centered = false,
  fullScreen = false
}) => {
  // Size mappings
  const sizeMap = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  // Text size mappings
  const textSizeMap = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  // Color mappings
  const colorMap = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    white: 'text-white',
    black: 'text-black',
  };

  // Wrapper classes for positioning
  const wrapperClasses = cn(
    'flex flex-col items-center justify-center',
    fullScreen && 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
    centered && !fullScreen && 'absolute inset-0',
    className
  );

  // Render different loader types
  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return (
          <motion.div
            className={cn('rounded-full border-2 border-t-transparent', sizeMap[size], colorMap[color])}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            role="status"
            aria-label="Loading"
          />
        );

      case 'dots':
        return (
          <div className="flex space-x-2" role="status" aria-label="Loading">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={cn('rounded-full', colorMap[color], 
                  size === 'xs' ? 'w-1.5 h-1.5' : 
                  size === 'sm' ? 'w-2 h-2' :
                  size === 'md' ? 'w-2.5 h-2.5' : 'w-3 h-3'
                )}
                initial={{ opacity: 0.6, y: 0 }}
                animate={{ 
                  opacity: [0.6, 1, 0.6], 
                  y: [0, -6, 0]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: i * 0.2,
                  ease: "easeInOut" 
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <motion.div
            className={cn('rounded-full bg-current', sizeMap[size], colorMap[color])}
            initial={{ opacity: 0.6, scale: 0.8 }}
            animate={{ 
              opacity: [0.6, 1, 0.6], 
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            role="status"
            aria-label="Loading"
          />
        );

      case 'progress':
        return (
          <div className="w-full max-w-xs" role="status" aria-label="Loading">
            <div className={cn('h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden', size === 'lg' ? 'h-2' : 'h-1')}>
              <motion.div
                className={cn('h-full rounded-full', colorMap[color])}
                initial={{ width: '0%', x: '-100%' }}
                animate={{ 
                  width: '100%', 
                  x: '0%'
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={wrapperClasses}>
      {renderLoader()}
      {text && (
        <p className={cn('mt-3 text-center', textSizeMap[size], colorMap[color])}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingIndicator;