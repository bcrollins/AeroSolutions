import React from 'react';
import { motion } from 'framer-motion';

interface LoadingStateProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  message?: string;
  className?: string;
  showProgress?: boolean;
  progress?: number;
}

/**
 * Apple-inspired loading state component
 * Uses subtle animations and progress indicators
 */
export default function LoadingState({
  size = 'md',
  color = 'var(--color-primary)',
  message,
  className = '',
  showProgress = false,
  progress = 0
}: LoadingStateProps) {
  const sizeMap = {
    sm: { width: '16px', height: '16px', strokeWidth: '3px' },
    md: { width: '24px', height: '24px', strokeWidth: '2.5px' },
    lg: { width: '40px', height: '40px', strokeWidth: '2px' }
  };

  const dimensions = sizeMap[size];
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        {/* Background circle */}
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox="0 0 44 44"
          xmlns="http://www.w3.org/2000/svg"
          stroke={color}
          className="opacity-20"
        >
          <circle
            cx="22"
            cy="22"
            r="20"
            fill="none"
            strokeWidth={dimensions.strokeWidth}
          />
        </svg>
        
        {/* Animated spinner */}
        <motion.svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox="0 0 44 44"
          xmlns="http://www.w3.org/2000/svg"
          stroke={color}
          className="absolute top-0 left-0"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <circle
            cx="22"
            cy="22"
            r="20"
            fill="none"
            strokeWidth={dimensions.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={showProgress ? '125.6' : '32'}
            strokeDashoffset={showProgress ? 125.6 - (progress * 125.6) / 100 : 0}
          />
        </motion.svg>
      </div>
      
      {message && (
        <motion.p 
          className="mt-3 text-sm text-gray-600 dark:text-gray-400 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      )}
      
      {showProgress && (
        <motion.p 
          className="mt-1 text-xs text-gray-500 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {progress}%
        </motion.p>
      )}
    </div>
  );
}