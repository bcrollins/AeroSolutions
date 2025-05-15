import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text' | 'card' | 'image' | 'article' | 'profile';
  width?: string | number;
  height?: string | number;
  animated?: boolean;
  rounded?: boolean | 'full' | 'md' | 'lg' | 'xl' | '2xl';
  count?: number; // For repeating elements
  gap?: number; // For gap between repeated elements
}

// Default width/height mapping for different variants
const variantDefaults = {
  rect: { width: '100%', height: '16px' },
  circle: { width: '48px', height: '48px' },
  text: { width: '100%', height: '16px' },
  card: { width: '100%', height: '200px' },
  image: { width: '100%', height: '200px' },
  article: { width: '100%', height: '300px' },
  profile: { width: '64px', height: '64px' },
};

/**
 * Enhanced skeleton component for loading states
 * with variants for common use cases
 */
export function Skeleton({
  className,
  variant = 'rect',
  width,
  height,
  animated = true,
  rounded = variant === 'circle' ? 'full' : 'md',
  count = 1,
  gap = 8,
}: SkeletonProps) {
  // Get default dimensions for selected variant
  const { width: defaultWidth, height: defaultHeight } = variantDefaults[variant];
  
  // Calculate final dimensions, with props taking precedence
  const finalWidth = width || defaultWidth;
  const finalHeight = height || defaultHeight;
  
  // Calculate rounded corners
  const roundedClass = typeof rounded === 'boolean' 
    ? rounded ? 'rounded-md' : ''
    : `rounded-${rounded}`;
  
  // Base style
  const baseClassName = cn(
    'bg-muted animate-pulse',
    roundedClass,
    className,
  );
  
  // Animation variants
  const shimmerAnimation = {
    hidden: { opacity: 0.5 },
    visible: { 
      opacity: 1,
      transition: {
        repeat: Infinity,
        repeatType: 'reverse' as 'reverse',
        duration: 1.5
      }
    }
  };
  
  // For article variant, generate complex structure
  if (variant === 'article') {
    return (
      <div className={cn('space-y-4', className)} style={{ gap: gap + 'px' }}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex flex-col space-y-4">
            <motion.div
              className={cn(baseClassName, 'h-6 w-3/4')}
              style={{ height: '32px' }}
              initial={animated ? 'hidden' : undefined}
              animate={animated ? 'visible' : undefined}
              variants={shimmerAnimation}
            />
            <motion.div
              className={cn(baseClassName, 'h-4 w-full')}
              style={{ height: '16px' }}
              initial={animated ? 'hidden' : undefined}
              animate={animated ? 'visible' : undefined}
              variants={shimmerAnimation}
            />
            <motion.div
              className={cn(baseClassName, 'h-4 w-full')}
              style={{ height: '16px' }}
              initial={animated ? 'hidden' : undefined}
              animate={animated ? 'visible' : undefined}
              variants={shimmerAnimation}
            />
            <motion.div
              className={cn(baseClassName, 'h-4 w-2/3')}
              style={{ height: '16px' }}
              initial={animated ? 'hidden' : undefined}
              animate={animated ? 'visible' : undefined}
              variants={shimmerAnimation}
            />
            <motion.div
              className={cn(baseClassName, 'h-48 w-full')}
              style={{ height: '160px' }}
              initial={animated ? 'hidden' : undefined}
              animate={animated ? 'visible' : undefined}
              variants={shimmerAnimation}
            />
          </div>
        ))}
      </div>
    );
  }
  
  // For card variant, generate card-like structure
  if (variant === 'card') {
    return (
      <div className={cn('space-y-0', className)} style={{ gap: gap + 'px' }}>
        {Array.from({ length: count }).map((_, index) => (
          <div 
            key={index} 
            className={cn(
              'border border-border rounded-lg overflow-hidden',
              'flex flex-col'
            )}
            style={{ width: finalWidth }}
          >
            <motion.div
              className={cn(baseClassName, 'rounded-none')}
              style={{ height: '160px' }}
              initial={animated ? 'hidden' : undefined}
              animate={animated ? 'visible' : undefined}
              variants={shimmerAnimation}
            />
            <div className="p-4 space-y-3">
              <motion.div
                className={cn(baseClassName, 'h-6 w-3/4')}
                initial={animated ? 'hidden' : undefined}
                animate={animated ? 'visible' : undefined}
                variants={shimmerAnimation}
              />
              <motion.div
                className={cn(baseClassName, 'h-4 w-full')}
                initial={animated ? 'hidden' : undefined}
                animate={animated ? 'visible' : undefined}
                variants={shimmerAnimation}
              />
              <motion.div
                className={cn(baseClassName, 'h-4 w-2/3')}
                initial={animated ? 'hidden' : undefined}
                animate={animated ? 'visible' : undefined}
                variants={shimmerAnimation}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // For text variant, generate multiple lines
  if (variant === 'text') {
    return (
      <div className={cn('space-y-2', className)} style={{ gap: gap + 'px' }}>
        {Array.from({ length: count }).map((_, index) => (
          <motion.div
            key={index}
            className={baseClassName}
            style={{
              width: index % 3 === 0 ? '100%' : index % 3 === 1 ? '80%' : '60%',
              height: finalHeight,
            }}
            initial={animated ? 'hidden' : undefined}
            animate={animated ? 'visible' : undefined}
            variants={shimmerAnimation}
          />
        ))}
      </div>
    );
  }
  
  // Default: Single or multiple skeletons
  return (
    <div className="flex flex-col" style={{ gap: gap + 'px' }}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className={baseClassName}
          style={{ width: finalWidth, height: finalHeight }}
          initial={animated ? 'hidden' : undefined}
          animate={animated ? 'visible' : undefined}
          variants={shimmerAnimation}
        />
      ))}
    </div>
  );
}