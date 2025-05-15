import { useState, useCallback, useEffect } from 'react';
import { logError, getUserFriendlyErrorMessage } from '@/lib/errorHandler';
import { useToast } from '@/hooks/use-toast';

interface UseErrorOptions {
  logErrors?: boolean;
  showToast?: boolean;
  toastDuration?: number;
  context?: Record<string, any>;
}

/**
 * Custom hook for handling errors in React components
 * 
 * @example
 * const { error, setError, clearError, handleError } = useError();
 * 
 * // In a try/catch block
 * try {
 *   await someOperation();
 * } catch (err) {
 *   handleError(err, { context: { operation: 'someOperation' } });
 * }
 * 
 * // In your JSX
 * {error && <ErrorDisplay error={error} onDismiss={clearError} />}
 */
export const useError = (options: UseErrorOptions = {}) => {
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const { 
    logErrors = true, 
    showToast = false,
    toastDuration = 5000,
    context = {} 
  } = options;

  // Clear the error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Handle an error with options for logging and displaying
  const handleError = useCallback((
    err: unknown, 
    additionalOptions: {
      log?: boolean;
      toast?: boolean;
      context?: Record<string, any>;
      clearAfter?: number;
    } = {}
  ) => {
    // Skip if null or undefined
    if (!err) return;
    
    // Convert to Error type if needed
    const error = err instanceof Error 
      ? err 
      : new Error(typeof err === 'string' ? err : 'An unknown error occurred');
    
    // Set the error state
    setError(error);
    
    // Log the error if enabled
    const shouldLog = additionalOptions.log ?? logErrors;
    if (shouldLog) {
      logError(error, undefined, { 
        context: {
          ...context,
          ...additionalOptions.context
        }
      });
    }
    
    // Show toast if enabled
    const shouldToast = additionalOptions.toast ?? showToast;
    if (shouldToast) {
      toast({
        title: error.name || 'Error',
        description: getUserFriendlyErrorMessage(error),
        variant: 'destructive',
        duration: toastDuration,
      });
    }
    
    // Auto-clear error if specified
    if (additionalOptions.clearAfter) {
      setTimeout(clearError, additionalOptions.clearAfter);
    }
    
    return error;
  }, [logErrors, showToast, toastDuration, context, toast, clearError]);

  // Clear error on unmount (optional, can be disabled)
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  return {
    error,
    setError,
    clearError,
    handleError,
    isError: !!error,
  };
};

export default useError;