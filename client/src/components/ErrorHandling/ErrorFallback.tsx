import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md p-6 border rounded-lg shadow-sm bg-card">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-center mb-2">Something went wrong</h2>
        
        <p className="text-muted-foreground text-center mb-4">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>
        
        <div className="bg-muted p-3 rounded-md mb-4 max-h-32 overflow-auto">
          <p className="text-sm font-mono whitespace-pre-wrap break-words">
            {error.message || 'Unknown error'}
          </p>
        </div>
        
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          
          <Button 
            onClick={resetErrorBoundary}
            className="flex items-center"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;