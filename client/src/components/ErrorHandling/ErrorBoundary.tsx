import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary - A component that catches JavaScript errors in its child component tree
 * and displays a fallback UI instead of crashing the whole app
 * 
 * @example
 * <ErrorBoundary onError={(error) => logErrorToService(error)}>
 *   <ComponentThatMightError />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Call the onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Update state with error details
    this.setState({
      errorInfo
    });
  }

  componentDidUpdate(prevProps: Props): void {
    // Reset the error state if resetOnPropsChange is true and props have changed
    if (
      this.state.hasError &&
      this.props.resetOnPropsChange &&
      prevProps.children !== this.props.children
    ) {
      this.reset();
    }
  }

  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  renderDefaultFallback(): ReactNode {
    const { error, errorInfo } = this.state;

    return (
      <div className="flex flex-col items-center justify-center p-4 min-h-[300px]">
        <Card className="w-full max-w-md shadow-lg border-red-200">
          <CardHeader className="bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 mr-2" />
              <CardTitle>Something went wrong</CardTitle>
            </div>
            <CardDescription>
              We've encountered an error while rendering this component
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Alert variant="destructive" className="mb-4">
              <AlertTitle className="font-mono text-sm">
                {error?.name || 'Error'}
              </AlertTitle>
              <AlertDescription className="font-mono text-xs">
                {error?.message || 'An unknown error occurred'}
              </AlertDescription>
            </Alert>
            
            {errorInfo && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Component Stack:</h4>
                <div className="bg-muted p-3 rounded-md overflow-x-auto max-h-[200px]">
                  <pre className="text-xs whitespace-pre-wrap font-mono">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
          <Separator />
          <CardFooter className="flex justify-end bg-muted/20 p-4">
            <Button 
              onClick={this.reset}
              variant="outline"
              className="mr-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  render(): ReactNode {
    const { children, fallback } = this.props;
    const { hasError } = this.state;

    if (hasError) {
      // Render custom fallback if provided, otherwise render default fallback
      return fallback || this.renderDefaultFallback();
    }

    return children;
  }
}

export default ErrorBoundary;