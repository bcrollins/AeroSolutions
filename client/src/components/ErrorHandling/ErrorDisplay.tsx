import React from 'react';
import { AlertTriangle, RefreshCw, AlertCircle, Info, RotateCcw, ShieldAlert, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

import { APIError, AuthenticationError, AuthorizationError, NetworkError, ValidationError } from '@/lib/errorHandler';

// Prop types for the ErrorDisplay component
interface ErrorDisplayProps {
  error: unknown;
  onRetry?: () => void;
  onDismiss?: () => void;
  title?: string;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
  variant?: 'card' | 'alert' | 'inline';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * ErrorDisplay - A reusable component to display errors with appropriate styling and actions
 * 
 * @example
 * <ErrorDisplay 
 *   error={error} 
 *   onRetry={() => refetch()} 
 *   variant="card"
 * />
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  title,
  showDetails = false,
  compact = false,
  className = '',
  variant = 'card',
  size = 'md',
}) => {
  // Helper to format and determine error type
  const getErrorInfo = () => {
    // Handle different error types
    if (error instanceof ValidationError) {
      return {
        title: title || 'Validation Error',
        message: error.message,
        details: error.fieldErrors && Object.entries(error.fieldErrors)
          .map(([field, errors]) => (
            <div key={field} className="mb-1">
              <span className="font-medium">{field}:</span> {errors.join(', ')}
            </div>
          )),
        icon: <AlertCircle className={iconClasses} />,
        className: 'border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800',
        iconClassName: 'text-orange-500 dark:text-orange-400',
      };
    }
    
    if (error instanceof AuthenticationError) {
      return {
        title: title || 'Authentication Required',
        message: error.message,
        icon: <ShieldAlert className={iconClasses} />,
        className: 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800',
        iconClassName: 'text-blue-500 dark:text-blue-400',
      };
    }
    
    if (error instanceof AuthorizationError) {
      return {
        title: title || 'Access Denied',
        message: error.message,
        icon: <ShieldAlert className={iconClasses} />,
        className: 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800',
        iconClassName: 'text-red-500 dark:text-red-400',
      };
    }
    
    if (error instanceof NetworkError) {
      return {
        title: title || 'Network Error',
        message: error.message,
        icon: <WifiOff className={iconClasses} />,
        className: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800',
        iconClassName: 'text-yellow-500 dark:text-yellow-400',
      };
    }
    
    if (error instanceof APIError) {
      if (error.statusCode === 404) {
        return {
          title: title || 'Not Found',
          message: error.message,
          icon: <Info className={iconClasses} />,
          className: 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800',
          iconClassName: 'text-blue-500 dark:text-blue-400',
        };
      }
      
      if (error.statusCode >= 500) {
        return {
          title: title || 'Server Error',
          message: error.message,
          icon: <AlertTriangle className={iconClasses} />,
          className: 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800',
          iconClassName: 'text-red-500 dark:text-red-400',
        };
      }
      
      return {
        title: title || 'API Error',
        message: error.message,
        icon: <AlertTriangle className={iconClasses} />,
        className: 'border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800',
        iconClassName: 'text-orange-500 dark:text-orange-400',
      };
    }
    
    if (error instanceof Error) {
      return {
        title: title || error.name || 'Error',
        message: error.message,
        icon: <AlertTriangle className={iconClasses} />,
        className: 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800',
        iconClassName: 'text-red-500 dark:text-red-400',
      };
    }
    
    // Default for unknown error types
    return {
      title: title || 'Error',
      message: typeof error === 'string' ? error : 'An unexpected error occurred',
      icon: <AlertCircle className={iconClasses} />,
      className: 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800',
      iconClassName: 'text-red-500 dark:text-red-400',
    };
  };
  
  // Get size-based classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'text-sm',
          icon: 'h-4 w-4',
          buttons: 'h-8 text-xs px-2',
        };
      case 'lg':
        return {
          container: 'text-base',
          icon: 'h-6 w-6',
          buttons: 'h-10',
        };
      case 'md':
      default:
        return {
          container: 'text-sm',
          icon: 'h-5 w-5',
          buttons: 'h-9 text-sm',
        };
    }
  };
  
  const sizeClasses = getSizeClasses();
  const iconClasses = `${sizeClasses.icon} mr-2`;
  const { title: errorTitle, message, details, icon, className: errorClassName, iconClassName } = getErrorInfo();
  
  // Render an alert-style error (for inline use)
  if (variant === 'alert') {
    return (
      <Alert 
        variant="destructive" 
        className={`${errorClassName} ${className} ${sizeClasses.container} ${compact ? 'p-2' : 'p-4'}`}
      >
        <div className="flex items-center">
          <span className={iconClassName}>{icon}</span>
          <AlertTitle className="ml-2 font-medium">{errorTitle}</AlertTitle>
        </div>
        <AlertDescription className="mt-1">
          {message}
          {details && showDetails && <div className="mt-2 text-sm">{details}</div>}
        </AlertDescription>
        
        {(onRetry || onDismiss) && (
          <div className={`flex gap-2 mt-3 ${compact ? 'justify-end' : ''}`}>
            {onRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry}
                className={sizeClasses.buttons}
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Retry
              </Button>
            )}
            
            {onDismiss && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onDismiss}
                className={sizeClasses.buttons}
              >
                Dismiss
              </Button>
            )}
          </div>
        )}
      </Alert>
    );
  }
  
  // Render an inline error (simplest form)
  if (variant === 'inline') {
    return (
      <div className={`flex items-start ${sizeClasses.container} ${className} text-red-500 dark:text-red-400`}>
        <span className={`${iconClassName} flex-shrink-0`}>{icon}</span>
        <div>
          <p className="font-medium">{errorTitle}</p>
          <p className="text-sm text-red-600 dark:text-red-300">{message}</p>
          {details && showDetails && <div className="mt-1 text-xs">{details}</div>}
          
          {onRetry && (
            <button 
              onClick={onRetry}
              className="mt-1 flex items-center text-xs hover:underline text-red-600 dark:text-red-300"
            >
              <RotateCcw className="h-3 w-3 mr-1" /> Retry
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // Default: render a card-style error (most comprehensive)
  return (
    <Card className={`overflow-hidden shadow-md ${errorClassName} ${className} ${sizeClasses.container}`}>
      <CardHeader className={`${compact ? 'p-3 pb-2' : 'p-4 pb-3'}`}>
        <div className="flex items-center">
          <span className={iconClassName}>{icon}</span>
          <CardTitle className="ml-2 font-semibold">{errorTitle}</CardTitle>
        </div>
        {!compact && <CardDescription>{message}</CardDescription>}
      </CardHeader>
      
      <CardContent className={compact ? 'p-3 pt-0' : 'p-4 pt-0'}>
        {compact && <p>{message}</p>}
        {details && showDetails && <div className="mt-2 text-sm">{details}</div>}
      </CardContent>
      
      {(onRetry || onDismiss) && (
        <CardFooter className={`flex gap-2 ${compact ? 'p-3 justify-end' : 'p-4'}`}>
          {onRetry && (
            <Button 
              variant="outline" 
              onClick={onRetry}
              className={sizeClasses.buttons}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Try Again
            </Button>
          )}
          
          {onDismiss && (
            <Button 
              variant="ghost" 
              onClick={onDismiss}
              className={sizeClasses.buttons}
            >
              Dismiss
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default ErrorDisplay;