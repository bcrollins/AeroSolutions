import React, { useState, useEffect, lazy, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyLoadProps {
  component: () => Promise<any>;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  delay?: number;
  className?: string;
  props?: Record<string, any>;
  errorComponent?: React.ReactNode;
  skipIfMobile?: boolean;
}

/**
 * LazyLoad - Component for lazy loading other components with fallbacks
 * 
 * @example
 * <LazyLoad
 *   component={() => import('@/components/HeavyComponent').then(module => module.default)}
 *   fallback={<Skeleton className="h-40 w-full" />}
 * />
 */
export const LazyLoad: React.FC<LazyLoadProps> = ({
  component,
  fallback = <DefaultSkeleton />,
  onLoad,
  onError,
  delay = 0,
  className = '',
  props = {},
  errorComponent = <DefaultError />,
  skipIfMobile = false,
}) => {
  const [LazyComponent, setLazyComponent] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Skip on mobile if specified
  const [shouldSkip, setShouldSkip] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    // Check if we should skip based on mobile detection
    if (skipIfMobile) {
      const isMobile = typeof window !== 'undefined' && 
        window.matchMedia('(max-width: 640px)').matches;
      setShouldSkip(isMobile);
      
      if (isMobile) {
        setLoading(false);
        return;
      }
    }
    
    // Apply delay if needed
    let timerId: ReturnType<typeof setTimeout> | undefined;
    
    if (delay > 0) {
      timerId = setTimeout(() => {
        void loadComponent();
      }, delay);
    } else {
      void loadComponent();
    }
    
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, []);
  
  const loadComponent = async () => {
    try {
      const importedComponent = await component();
      setLazyComponent(() => importedComponent.default || importedComponent);
      setLoading(false);
      if (onLoad) onLoad();
    } catch (err) {
      console.error('Failed to lazy load component:', err);
      setError(err as Error);
      setLoading(false);
      if (onError) onError(err as Error);
    }
  };
  
  // Server-side rendering fallback
  if (!isMounted) {
    return <>{fallback}</>;
  }
  
  // Skip rendering on mobile if requested
  if (shouldSkip) {
    return null;
  }
  
  // Show error component if loading failed
  if (error) {
    return <>{errorComponent}</>;
  }
  
  // Show loading fallback while component is loading
  if (loading || !LazyComponent) {
    return <>{fallback}</>;
  }
  
  // Render the lazy loaded component with provided props
  return (
    <Suspense fallback={fallback}>
      <div className={className}>
        <LazyComponent {...props} />
      </div>
    </Suspense>
  );
};

// Default fallback skeleton component
const DefaultSkeleton = () => (
  <div className="animate-pulse space-y-2">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-6 w-1/2" />
  </div>
);

// Default error component
const DefaultError = () => (
  <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
    <p>Failed to load component. Please try refreshing the page.</p>
  </div>
);

/**
 * withLazyLoading - HOC for lazy loading components
 * 
 * @example
 * const LazyHeavyComponent = withLazyLoading(() => 
 *   import('@/components/HeavyComponent').then(m => m.default)
 * );
 * 
 * // Later in JSX:
 * <LazyHeavyComponent />
 */
export function withLazyLoading<T>(
  importFunc: () => Promise<any>,
  options: Omit<LazyLoadProps, 'component'> = {}
) {
  const LazyLoadedComponent: React.FC<T> = (props) => (
    <LazyLoad
      component={importFunc}
      props={props as Record<string, any>}
      {...options}
    />
  );
  
  return LazyLoadedComponent;
}

export default LazyLoad;