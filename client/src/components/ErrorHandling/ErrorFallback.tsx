import React from 'react';
import { FallbackProps } from 'react-error-boundary';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatErrorMessage, getErrorType, getSuggestedActions } from '@/lib/errorHandler';

/**
 * ErrorFallback - Default error component for error boundary
 * Displays error information and provides retry options
 */
const ErrorFallback: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const errorMessage = formatErrorMessage(error);
  const errorType = getErrorType(error);
  const suggestedActions = getSuggestedActions(errorType);
  
  return (
    <Card className="w-full border-destructive/20 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start">
          <AlertCircle className="h-6 w-6 mr-3 text-destructive" />
          <div>
            <CardTitle className="text-lg">Something went wrong</CardTitle>
            <CardDescription className="text-destructive-foreground">
              {errorMessage}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      {suggestedActions.length > 0 && (
        <CardContent className="pt-0">
          <div className="text-sm space-y-2 text-muted-foreground">
            <p className="font-medium">Suggested actions:</p>
            <ul className="list-disc pl-5 space-y-1">
              {suggestedActions.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}
      
      <CardFooter className="flex justify-end pt-3">
        <Button 
          onClick={resetErrorBoundary}
          className="h-9"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ErrorFallback;