import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Utility for lazy loading components to improve initial load time
 * This implementation reduces the initial bundle size by only loading
 * components when they're needed
 * 
 * @param importFunc - The import function for the component
 * @param fallback - Optional custom loading component
 * @returns Lazy-loaded component with suspense
 */
export function lazyLoad(
  importFunc: () => Promise<{ default: React.ComponentType<any> }>,
  fallback: React.ReactNode = <DefaultSkeleton />
) {
  const LazyComponent = lazy(importFunc);
  
  return (props: any) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * Default skeleton loading component
 * Shows a placeholder while the component is loading
 */
function DefaultSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <Skeleton className="h-4 w-full max-w-[200px]" />
      <Skeleton className="h-24 w-full" />
      <div className="flex space-x-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}