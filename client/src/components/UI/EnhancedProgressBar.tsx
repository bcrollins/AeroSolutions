import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface EnhancedProgressBarProps {
  value: number;
  max?: number;
  height?: number;
  animated?: boolean;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  labelPosition?: 'top' | 'right' | 'inside';
  striped?: boolean;
  indeterminate?: boolean;
  cornerRadius?: number;
  className?: string;
  showValue?: boolean;
  valueFormat?: (value: number, max: number) => string;
  labelClassName?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * Enhanced progress bar component with animations and customization options
 */
export default function EnhancedProgressBar({
  value,
  max = 100,
  height = 8,
  animated = true,
  color = 'var(--color-primary)',
  backgroundColor = 'var(--color-gray-200)',
  showLabel = false,
  labelPosition = 'top',
  striped = false,
  indeterminate = false,
  cornerRadius = 4,
  className = '',
  showValue = false,
  valueFormat,
  labelClassName = '',
  onClick
}: EnhancedProgressBarProps) {
  const [prevValue, setPrevValue] = useState(value);
  const controls = useAnimation();
  
  // Calculate percentage
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  // Format value for display
  const formattedValue = valueFormat 
    ? valueFormat(value, max) 
    : showValue 
      ? `${Math.round(percentage)}%` 
      : '';
  
  // Handle animation when value changes
  useEffect(() => {
    if (animated && value !== prevValue) {
      controls.start({
        width: `${percentage}%`,
        transition: { 
          duration: 0.5, 
          ease: [0.33, 1, 0.68, 1] 
        }
      });
      setPrevValue(value);
    }
  }, [value, percentage, animated, controls, prevValue]);
  
  return (
    <div className={`w-full ${className}`} onClick={onClick}>
      {/* Label - Top position */}
      {showLabel && labelPosition === 'top' && (
        <div className={`flex justify-between mb-1 text-sm ${labelClassName}`}>
          <span>Progress</span>
          {formattedValue && <span>{formattedValue}</span>}
        </div>
      )}
      
      {/* Progress bar container */}
      <div 
        className="relative w-full overflow-hidden" 
        style={{ 
          height: `${height}px`, 
          backgroundColor, 
          borderRadius: `${cornerRadius}px` 
        }}
      >
        {/* Progress bar fill */}
        <motion.div
          className={`h-full ${striped ? 'progress-striped' : ''} ${indeterminate ? 'progress-indeterminate' : ''}`}
          style={{ 
            backgroundColor: color,
            width: animated ? '0%' : `${percentage}%` 
          }}
          animate={animated ? controls : { width: `${percentage}%` }}
          initial={animated ? { width: '0%' } : { width: `${percentage}%` }}
        >
          {/* Label - Inside position */}
          {showLabel && labelPosition === 'inside' && formattedValue && (
            <div className="h-full flex items-center justify-center text-white text-xs font-medium">
              {formattedValue}
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Label - Right position */}
      {showLabel && labelPosition === 'right' && (
        <div className={`ml-2 text-sm ${labelClassName}`}>
          {formattedValue}
        </div>
      )}
    </div>
  );
}

// Add CSS for striped and indeterminate progress bars
const addProgressBarStyles = `
@keyframes moveStripes {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 30px 0;
  }
}

@keyframes indeterminateAnimation {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-striped {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 30px 30px;
  animation: moveStripes 1s linear infinite;
}

.progress-indeterminate {
  width: 50% !important;
  background-image: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: indeterminateAnimation 1.5s ease infinite;
}
`;

// Append styles when module loads
try {
  if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = addProgressBarStyles;
    document.head.appendChild(styleElement);
  }
} catch (error) {
  console.error('Failed to append progress bar styles:', error);
}