import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingIndicatorProps {
  type?: 'bar' | 'dots' | 'spinner';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  text?: string;
  fullScreen?: boolean;
}

/**
 * Enhanced loading indicator with multiple visualization options
 */
const LoadingIndicator = ({
  type = 'dots',
  size = 'md',
  className,
  showText = false,
  text = 'Loading...',
  fullScreen = false
}: LoadingIndicatorProps) => {
  // Size variants for dots
  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2'
  };

  // Size variants for spinner
  const spinnerSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  // Text size variants
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (type === 'bar') {
    return <div className="loading-bar" role="progressbar" aria-label="Loading..." />;
  }

  if (type === 'dots') {
    return (
      <div 
        className={cn(
          "flex items-center justify-center gap-2",
          fullScreen && "fixed inset-0 bg-black/10 backdrop-blur-sm z-50",
          className
        )}
      >
        <div className="loading-dots">
          <div className={cn("dot", dotSizes[size])}></div>
          <div className={cn("dot", dotSizes[size])}></div>
          <div className={cn("dot", dotSizes[size])}></div>
        </div>
        {showText && <span className={cn("text-muted-foreground ml-2", textSizes[size])}>{text}</span>}
      </div>
    );
  }

  // Default: spinner
  return (
    <div 
      className={cn(
        "flex items-center justify-center",
        fullScreen && "fixed inset-0 bg-black/10 backdrop-blur-sm z-50",
        className
      )}
    >
      <div 
        className={cn(
          "animate-spin rounded-full border-t-2 border-primary border-r-2 border-r-transparent", 
          spinnerSizes[size]
        )}
        role="progressbar" 
        aria-label="Loading..."
      />
      {showText && <span className={cn("text-muted-foreground ml-2", textSizes[size])}>{text}</span>}
    </div>
  );
};

export default LoadingIndicator;