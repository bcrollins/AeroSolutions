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
  // Generate loading states based on type
  const renderLoadingState = () => {
    const items = [];
    
    for (let i = 0; i < count; i++) {
      let loadingElement;
      
      switch (type) {
        case 'text':
          loadingElement = (
            <div key={i} className={cn("flex flex-col gap-2", fullWidth && "w-full")}>
              <Shimmer 
                className={className}
                width={width || (fullWidth ? '100%' : Math.random() > 0.3 ? '100%' : '60%')}
                height={height || '1rem'} 
                borderRadius="0.25rem"
                gradient={animate}
              />
              {Math.random() > 0.5 && (
                <Shimmer 
                  width={Math.random() > 0.3 ? '80%' : '40%'}
                  height="1rem" 
                  borderRadius="0.25rem"
                  gradient={animate}
                />
              )}
            </div>
          );
          break;
          
        case 'card':
          loadingElement = (
            <div key={i} className={cn(
              "border rounded-lg p-4 flex flex-col gap-3",
              fullWidth ? "w-full" : "w-[300px]",
              className
            )}>
              <Shimmer 
                width="60%" 
                height="1.5rem" 
                borderRadius="0.25rem"
                gradient={animate}
              />
              <div className="space-y-2">
                <Shimmer 
                  width="100%" 
                  height="1rem" 
                  borderRadius="0.25rem"
                  gradient={animate}
                />
                <Shimmer 
                  width="100%" 
                  height="1rem" 
                  borderRadius="0.25rem"
                  gradient={animate}
                />
                <Shimmer 
                  width="70%" 
                  height="1rem" 
                  borderRadius="0.25rem"
                  gradient={animate}
                />
              </div>
              <div className="mt-2 flex justify-between">
                <Shimmer 
                  width="30%" 
                  height="2rem" 
                  borderRadius="0.25rem"
                  gradient={animate}
                />
                <Shimmer 
                  width="30%" 
                  height="2rem" 
                  borderRadius="0.25rem"
                  gradient={animate}
                />
              </div>
            </div>
          );
          break;
          
        case 'image':
          loadingElement = (
            <Shimmer 
              key={i}
              className={className}
              width={width || (fullWidth ? '100%' : '300px')}
              height={height || '200px'} 
              borderRadius={rounded ? '0.5rem' : '0.25rem'}
              gradient={animate}
            />
          );
          break;
          
        case 'button':
          loadingElement = (
            <Shimmer 
              key={i}
              className={className}
              width={width || '100px'}
              height={height || '2.5rem'} 
              borderRadius="0.25rem"
              gradient={animate}
            />
          );
          break;
          
        case 'avatar':
          loadingElement = (
            <Shimmer 
              key={i}
              className={className}
              width={width || '40px'}
              height={height || '40px'} 
              borderRadius="50%"
              gradient={animate}
            />
          );
          break;
          
        case 'input':
          loadingElement = (
            <Shimmer 
              key={i}
              className={className}
              width={width || (fullWidth ? '100%' : '200px')}
              height={height || '2.5rem'} 
              borderRadius="0.25rem"
              gradient={animate}
            />
          );
          break;
          
        case 'table-row':
          loadingElement = (
            <div key={i} className={cn(
              "flex items-center gap-2 py-3",
              fullWidth && "w-full",
              className
            )}>
              <Shimmer 
                width="20px" 
                height="20px" 
                borderRadius="50%"
                gradient={animate}
              />
              <Shimmer 
                width="30%" 
                height="1rem" 
                borderRadius="0.25rem"
                gradient={animate}
              />
              <Shimmer 
                width="20%" 
                height="1rem" 
                borderRadius="0.25rem"
                gradient={animate}
              />
              <Shimmer 
                width="15%" 
                height="1rem" 
                borderRadius="0.25rem"
                gradient={animate}
              />
              <Shimmer 
                width="25%" 
                height="1rem" 
                borderRadius="0.25rem"
                gradient={animate}
              />
            </div>
          );
          break;
          
        default:
          loadingElement = (
            <Shimmer 
              key={i}
              className={className}
              width={width || (fullWidth ? '100%' : '200px')}
              height={height || '1rem'} 
              borderRadius="0.25rem"
              gradient={animate}
            />
          );
      }
      
      items.push(loadingElement);
    }
    
    return items;
  };
  
  return (
    <div className={cn("flex flex-col gap-3", type === 'table-row' && "w-full")}>
      {renderLoadingState()}
    </div>
  );
};

/**
 * CardSkeleton - Skeleton for card components
 */
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("grid gap-6", className)}>
      <div className="space-y-3">
        <LoadingState type="card" />
        <LoadingState type="card" />
        <LoadingState type="card" />
      </div>
    </div>
  );
};

/**
 * ProfileSkeleton - Skeleton for profile components
 */
export const ProfileSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex items-center gap-4">
        <LoadingState type="avatar" width={80} height={80} />
        <div className="space-y-2">
          <LoadingState type="text" width={200} />
          <LoadingState type="text" width={150} />
        </div>
      </div>
      <LoadingState type="text" count={2} fullWidth />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LoadingState type="card" fullWidth />
        <LoadingState type="card" fullWidth />
        <LoadingState type="card" fullWidth />
      </div>
    </div>
  );
};

/**
 * TableSkeleton - Skeleton for table components
 */
export const TableSkeleton: React.FC<{ 
  rowCount?: number; 
  className?: string;
  showHeader?: boolean;
}> = ({ 
  rowCount = 5, 
  className,
  showHeader = true,
}) => {
  return (
    <div className={cn("w-full border rounded-lg overflow-hidden", className)}>
      {showHeader && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b">
          <div className="flex items-center gap-4">
            <LoadingState type="text" width={200} />
            <div className="ml-auto">
              <LoadingState type="input" width={160} />
            </div>
          </div>
        </div>
      )}
      <div className="divide-y">
        <LoadingState type="table-row" count={rowCount} fullWidth />
      </div>
    </div>
  );
};

/**
 * DashboardWidgetSkeleton - Skeleton for dashboard widgets
 */
export const DashboardWidgetSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      <div className="border rounded-lg p-4 space-y-3">
        <LoadingState type="text" width={140} />
        <LoadingState type="text" width="100%" height={100} />
      </div>
      <div className="border rounded-lg p-4 space-y-3">
        <LoadingState type="text" width={160} />
        <LoadingState type="text" width="100%" height={100} />
      </div>
      <div className="border rounded-lg p-4 space-y-3">
        <LoadingState type="text" width={120} />
        <LoadingState type="text" width="100%" height={100} />
      </div>
    </div>
  );
};