import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'shimmer' | 'none';
  width?: string | number;
  height?: string | number;
  count?: number;
  inline?: boolean;
  spacing?: number;
}

/**
 * Animated loading skeleton component for content placeholders
 */
export function Skeleton({
  className,
  variant = 'text',
  animation = 'shimmer',
  width,
  height,
  count = 1,
  inline = false,
  spacing = 8,
}: SkeletonProps) {
  // Calculate shape classes based on variant
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg'
  };
  
  // Calculate animation classes
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-skeleton-wave',
    shimmer: 'animate-skeleton-shimmer relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent dark:before:via-white/10',
    none: ''
  };
  
  // Generate skeletons
  const skeletons = Array(count).fill(0).map((_, index) => (
    <div
      key={index}
      className={cn(
        'bg-gray-200 dark:bg-gray-800',
        variantClasses[variant],
        animationClasses[animation],
        inline ? 'inline-block' : 'block',
        className
      )}
      style={{
        width: width,
        height: height,
        marginBottom: index < count - 1 ? spacing : 0,
        marginRight: inline && index < count - 1 ? spacing : 0
      }}
      aria-hidden="true"
      aria-label="Loading"
      role="status"
    />
  ));

  return <>{skeletons}</>;
}

/**
 * Text paragraph skeleton
 */
export function TextSkeleton({
  lines = 3,
  lastLineWidth = 70,
  className,
  animation = 'shimmer'
}: {
  lines?: number;
  lastLineWidth?: number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'shimmer' | 'none';
}) {
  return (
    <div className={className}>
      {Array(lines).fill(0).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          animation={animation}
          className={`mb-2 ${index === lines - 1 ? `w-[${lastLineWidth}%]` : 'w-full'}`}
        />
      ))}
    </div>
  );
}

/**
 * Card content skeleton
 */
export function CardSkeleton({
  imageHeight,
  hasImage = true,
  hasHeader = true,
  contentLines = 3,
  hasFooter = true,
  className,
  animation = 'shimmer'
}: {
  imageHeight?: string | number;
  hasImage?: boolean;
  hasHeader?: boolean;
  contentLines?: number;
  hasFooter?: boolean;
  className?: string;
  animation?: 'pulse' | 'wave' | 'shimmer' | 'none';
}) {
  return (
    <div className={`overflow-hidden ${className}`}>
      {hasImage && (
        <Skeleton
          variant="rectangular"
          animation={animation}
          width="100%"
          height={imageHeight || 200}
          className="mb-4"
        />
      )}
      
      {hasHeader && (
        <div className="mb-4 px-4">
          <Skeleton 
            variant="text" 
            animation={animation}
            className="h-6 w-3/4 mb-2" 
          />
          <Skeleton 
            variant="text" 
            animation={animation}
            className="h-4 w-1/2" 
          />
        </div>
      )}
      
      <div className="px-4 mb-4">
        <TextSkeleton 
          lines={contentLines} 
          animation={animation}
        />
      </div>
      
      {hasFooter && (
        <div className="px-4 pb-4 flex justify-between">
          <Skeleton 
            variant="text" 
            animation={animation}
            width="30%" 
          />
          <Skeleton 
            variant="text" 
            animation={animation}
            width="20%" 
          />
        </div>
      )}
    </div>
  );
}

/**
 * Avatar with text skeleton
 */
export function AvatarWithTextSkeleton({
  avatarSize = 40,
  textLines = 2,
  className,
  animation = 'shimmer'
}: {
  avatarSize?: number;
  textLines?: number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'shimmer' | 'none';
}) {
  return (
    <div className={`flex ${className}`}>
      <Skeleton
        variant="circular"
        animation={animation}
        width={avatarSize}
        height={avatarSize}
        className="flex-shrink-0 mr-3"
      />
      
      <div className="flex-1 pt-1">
        <TextSkeleton
          lines={textLines}
          lastLineWidth={50}
          animation={animation}
        />
      </div>
    </div>
  );
}

/**
 * Table skeleton
 */
export function TableSkeleton({
  rows = 5,
  cols = 4,
  className,
  showHeader = true,
  animation = 'shimmer'
}: {
  rows?: number;
  cols?: number;
  className?: string;
  showHeader?: boolean;
  animation?: 'pulse' | 'wave' | 'shimmer' | 'none';
}) {
  return (
    <div className={`w-full ${className}`}>
      {showHeader && (
        <div className="flex mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          {Array(cols).fill(0).map((_, colIndex) => (
            <div 
              key={`header-${colIndex}`} 
              className="flex-1 px-2"
            >
              <Skeleton
                variant="text"
                animation={animation}
                className="h-5"
              />
            </div>
          ))}
        </div>
      )}
      
      {Array(rows).fill(0).map((_, rowIndex) => (
        <div 
          key={`row-${rowIndex}`} 
          className="flex py-3 border-b border-gray-100 dark:border-gray-800"
        >
          {Array(cols).fill(0).map((_, colIndex) => (
            <div 
              key={`cell-${rowIndex}-${colIndex}`} 
              className="flex-1 px-2"
            >
              <Skeleton
                variant="text"
                animation={animation}
                className="h-4"
                width={`${Math.random() * 50 + 50}%`}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Add shimmer animation to tailwind
const addShimmerAnimation = `
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

@keyframes skeletonWave {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}
`;

// Append styles when module loads
try {
  if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = addShimmerAnimation;
    document.head.appendChild(styleElement);
  }
} catch (error) {
  console.error('Failed to append shimmer animation styles:', error);
}