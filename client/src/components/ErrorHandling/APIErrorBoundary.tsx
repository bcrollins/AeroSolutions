import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { formatErrorMessage, getErrorType, getSuggestedActions } from '@/lib/errorHandler';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UseQueryResult } from '@tanstack/react-query';

interface APIErrorBoundaryProps<T> {
  query: UseQueryResult<T>;
  children: (data: T) => React.ReactNode;
  loadingFallback?: React.ReactNode;
}

/**
 * APIErrorBoundary - Handles errors from API calls using react-query
 */
function APIErrorBoundary<T>({
  query,
  children,
  loadingFallback = <DefaultLoadingState />,
}: APIErrorBoundaryProps<T>) {
  // Extract query state
  const { isLoading, isError, error, data, refetch } = query;

  // Show loading state
  if (isLoading) {
    return <>{loadingFallback}</>;
  }

  // Show error state
  if (isError) {
    return (
      <APIErrorState error={error as Error} onRetry={() => refetch()} />
    );
  }

  // Render children with data
  return <>{data ? children(data) : null}</>;
}

// Default loading state
const DefaultLoadingState = () => (
  <div className="w-full py-8 flex justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Error display component
interface APIErrorStateProps {
  error: Error;
  onRetry: () => void;
}

const APIErrorState: React.FC<APIErrorStateProps> = ({ error, onRetry }) => {
  const errorMessage = formatErrorMessage(error);
  const errorType = getErrorType(error);
  const suggestedActions = getSuggestedActions(errorType);

  return (
    <Card className="w-full border-destructive/20">
      <CardHeader className="pb-2">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
          <div>
            <CardTitle className="text-base">Error Loading Data</CardTitle>
            <CardDescription className="text-destructive-foreground">
              {errorMessage}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      {suggestedActions.length > 0 && (
        <CardContent className="pt-0">
          <div className="text-sm space-y-1 text-muted-foreground">
            <p className="font-medium">Suggested actions:</p>
            <ul className="list-disc pl-5 text-xs space-y-1">
              {suggestedActions.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}
      
      <CardFooter className="flex justify-end pt-2">
        <Button 
          size="sm" 
          onClick={onRetry}
          className="h-8"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Try Again
        </Button>
      </CardFooter>
    </Card>
  );
};

export default APIErrorBoundary;