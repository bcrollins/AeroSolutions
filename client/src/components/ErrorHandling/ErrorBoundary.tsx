import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import { captureError } from '@/lib/errorHandler';
import ErrorFallback from './ErrorFallback';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

/**
 * ErrorBoundary - Wrapper component for react-error-boundary
 * Catches errors in child components and displays a fallback UI
 */
const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  fallback,
  onError,
}) => {
  // Handle errors
  const handleError = (error: Error, componentStack: string) => {
    // Log error to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error caught by ErrorBoundary:', error);
      console.error('Component stack:', componentStack);
    }
    
    // Capture error for reporting
    captureError(error, { componentStack });
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, { componentStack } as React.ErrorInfo);
    }
  };
  
  // Custom fallback component wrapper
  const CustomFallback = fallback 
    ? () => <>{fallback}</> 
    : ErrorFallback;
  
  return (
    <ReactErrorBoundary
      FallbackComponent={CustomFallback}
      onError={handleError}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;