import React from 'react';
import { Shimmer } from './MicroInteractions';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  className?: string;
  type?: 'card' | 'text' | 'image' | 'button' | 'avatar' | 'input' | 'table-row';
  count?: number;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  fullWidth?: boolean;
  animate?: boolean;
}

/**
 * LoadingState - Provides elegant loading states with shimmer effect
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  className,
  type = 'text',
  count = 1,
  width,
  height,
  rounded = false,
  fullWidth = false,
  animate = true,
}) => {
  const items = Array.from({ length: count }, (_, index) => index);
  
  const getTypeStyles = () => {
    switch (type) {
      case 'card':
        return 'w-full h-40 rounded-lg';
      case 'text':
        return 'h-4 rounded';
      case 'image':
        return 'aspect-video rounded-md';
      case 'button':
        return 'h-10 rounded-md';
      case 'avatar':
        return 'w-10 h-10 rounded-full';
      case 'input':
        return 'h-10 rounded-md';
      case 'table-row':
        return 'h-12 rounded';
      default:
        return '';
    }
  };
  
  const Wrapper = animate ? Shimmer : 'div';
  
  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item) => (
        <Wrapper
          key={item}
          className={cn(
            'bg-slate-200 dark:bg-slate-800',
            getTypeStyles(),
            rounded && 'rounded-md',
            fullWidth && 'w-full',
            !fullWidth && !width && type === 'text' && 'w-2/3 last:w-1/2',
          )}
          style={{
            width: width || undefined,
            height: height || undefined,
          }}
          duration={2}
          delay={item * 0.1}
        />
      ))}
    </div>
  );
};

/**
 * CardSkeleton - Skeleton for card components
 */
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("space-y-3", className)}>
      <LoadingState type="image" fullWidth />
      <LoadingState type="text" count={1} width="70%" />
      <LoadingState type="text" count={2} width="100%" />
      <div className="flex justify-between pt-2">
        <LoadingState type="button" width={100} />
        <LoadingState type="avatar" />
      </div>
    </div>
  );
};

/**
 * ProfileSkeleton - Skeleton for profile components
 */
export const ProfileSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("flex items-center space-x-4", className)}>
      <LoadingState type="avatar" width={60} height={60} />
      <div className="space-y-2">
        <LoadingState type="text" width={120} />
        <LoadingState type="text" width={80} />
      </div>
    </div>
  );
};

/**
 * TableSkeleton - Skeleton for table components
 */
export const TableSkeleton: React.FC<{ 
  className?: string;
  rows?: number;
  columns?: number;
}> = ({ 
  className,
  rows = 5,
  columns = 4
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex space-x-4 mb-6">
        {Array.from({ length: columns }, (_, i) => (
          <LoadingState key={i} type="text" width={`${100 / columns - 5}%`} />
        ))}
      </div>
      
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: columns }, (_, j) => (
            <LoadingState key={j} type="text" width={`${100 / columns - 5}%`} />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * DashboardWidgetSkeleton - Skeleton for dashboard widgets
 */
export const DashboardWidgetSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("p-4 border rounded-lg space-y-4", className)}>
      <div className="flex justify-between">
        <LoadingState type="text" width={140} />
        <LoadingState type="avatar" width={24} height={24} />
      </div>
      <LoadingState type="text" count={3} fullWidth />
      <div className="pt-2">
        <LoadingState type="button" width={100} />
      </div>
    </div>
  );
};