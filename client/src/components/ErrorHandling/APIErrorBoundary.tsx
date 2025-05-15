import React from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import ErrorDisplay from './ErrorDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { NetworkError, AuthenticationError, AuthorizationError } from '@/lib/errorHandler';

interface APIErrorBoundaryProps<TData> {
  query: UseQueryResult<TData>;
  children: (data: TData) => React.ReactNode;
  loadingFallback?: React.ReactNode;
  errorFallback?: (error: Error, retry: () => void) => React.ReactNode;
  emptyFallback?: React.ReactNode;
  showSkeleton?: boolean;
  skeletonClassName?: string;
  skeletonCount?: number;
  filterData?: (data: TData) => boolean;
  errorDisplayProps?: Partial<React.ComponentProps<typeof ErrorDisplay>>;
  redirectOnAuthError?: boolean;
}

/**
 * APIErrorBoundary - A specialized error boundary for handling API queries with loading,
 * error and empty states. Works with React Query.
 * 
 * @example
 * <APIErrorBoundary query={useQuery({ queryKey: ['/api/users'] })}>
 *   {(data) => (
 *     <ul>
 *       {data.map(user => <li key={user.id}>{user.name}</li>)}
 *     </ul>
 *   )}
 * </APIErrorBoundary>
 */
function APIErrorBoundary<TData>({
  query,
  children,
  loadingFallback,
  errorFallback,
  emptyFallback,
  showSkeleton = true,
  skeletonClassName = '',
  skeletonCount = 3,
  filterData,
  errorDisplayProps = {},
  redirectOnAuthError = true,
}: APIErrorBoundaryProps<TData>) {
  const {
    isLoading,
    isError,
    error,
    data,
    refetch,
  } = query;

  // Handle authentication errors by redirecting to login
  React.useEffect(() => {
    if (redirectOnAuthError && error instanceof AuthenticationError) {
      window.location.href = '/api/login';
    }
  }, [error, redirectOnAuthError]);

  // When loading data
  if (isLoading) {
    if (loadingFallback) {
      return <>{loadingFallback}</>;
    }
    
    if (showSkeleton) {
      return (
        <div className={skeletonClassName}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i} className="mb-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      );
    }
    
    return null;
  }

  // When error occurs
  if (isError) {
    if (errorFallback) {
      return <>{errorFallback(error as Error, refetch)}</>;
    }
    
    return (
      <ErrorDisplay
        error={error}
        onRetry={() => refetch()}
        variant="card"
        size="md"
        {...errorDisplayProps}
      />
    );
  }

  // When no data or empty data
  if (!data || (Array.isArray(data) && data.length === 0) || (filterData && !filterData(data))) {
    if (emptyFallback) {
      return <>{emptyFallback}</>;
    }
    
    return null;
  }

  // Success case - render children with data
  return <>{children(data)}</>;
}

export default APIErrorBoundary;