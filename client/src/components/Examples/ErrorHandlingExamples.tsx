import React, { useState } from 'react';
import ErrorBoundary from '@/components/ErrorHandling/ErrorBoundary';
import ErrorDisplay from '@/components/ErrorHandling/ErrorDisplay';
import APIErrorBoundary from '@/components/ErrorHandling/APIErrorBoundary';
import { useError } from '@/hooks/use-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  BugOff,
  Bug,
  Repeat,
  Shield,
  ServerCrash,
  Wifi,
  WifiOff,
  Bomb,
} from 'lucide-react';
import { 
  APIError, 
  AuthenticationError, 
  AuthorizationError, 
  NetworkError, 
  ValidationError 
} from '@/lib/errorHandler';

/**
 * ErrorHandlingExamples - Component demonstrating various approaches to error handling
 */
const ErrorHandlingExamples: React.FC = () => {
  const [activeTab, setActiveTab] = useState('error-display');

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Error Handling Examples</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="error-display">Error Display</TabsTrigger>
          <TabsTrigger value="error-boundaries">Error Boundaries</TabsTrigger>
          <TabsTrigger value="api-error-handling">API Error Handling</TabsTrigger>
        </TabsList>
        
        <TabsContent value="error-display" className="space-y-6">
          <h2 className="text-xl font-semibold">Error Display Components</h2>
          <p className="text-muted-foreground">
            Examples of different error display styles and variants.
          </p>
          <ErrorDisplayExample />
        </TabsContent>
        
        <TabsContent value="error-boundaries" className="space-y-6">
          <h2 className="text-xl font-semibold">Error Boundaries</h2>
          <p className="text-muted-foreground">
            Examples of using error boundaries to catch and handle errors in child components.
          </p>
          <ErrorBoundaryExample />
        </TabsContent>
        
        <TabsContent value="api-error-handling" className="space-y-6">
          <h2 className="text-xl font-semibold">API Error Handling</h2>
          <p className="text-muted-foreground">
            Examples of handling API errors with React Query and our custom hooks.
          </p>
          <APIErrorHandlingExample />
        </TabsContent>
      </Tabs>
    </div>
  );
};

/**
 * Error Display Examples
 */
const ErrorDisplayExample: React.FC = () => {
  const [errorType, setErrorType] = useState<string>('api-error');
  
  // Generate different types of errors for demonstration
  const getErrorByType = (): Error => {
    switch (errorType) {
      case 'network-error':
        return new NetworkError('Failed to connect to the server. Please check your internet connection and try again.');
      
      case 'auth-error':
        return new AuthenticationError('Your session has expired. Please log in again to continue.');
      
      case 'permission-error':
        return new AuthorizationError('You do not have permission to access this resource.');
      
      case 'validation-error':
        const fieldErrors: Record<string, string[]> = {
          email: ['Must be a valid email address'],
          password: ['Must be at least 8 characters', 'Must include at least one special character'],
          username: ['This username is already taken']
        };
        return new ValidationError('Please fix the validation errors', fieldErrors);
      
      case 'api-error':
        return new APIError('Failed to load user data', 404, { resource: 'users', id: '123' });
      
      case 'server-error':
        return new APIError('Internal server error', 500, { trace: 'abc123' });
      
      default:
        return new Error('An unknown error occurred');
    }
  };
  
  const error = getErrorByType();
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Error Display Variants</CardTitle>
          <CardDescription>
            Select an error type to see how it's displayed in different variants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            <Button 
              variant={errorType === 'api-error' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setErrorType('api-error')}
            >
              <Bug className="h-4 w-4 mr-1.5" /> API Error
            </Button>
            <Button 
              variant={errorType === 'network-error' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setErrorType('network-error')}
            >
              <WifiOff className="h-4 w-4 mr-1.5" /> Network Error
            </Button>
            <Button 
              variant={errorType === 'auth-error' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setErrorType('auth-error')}
            >
              <Shield className="h-4 w-4 mr-1.5" /> Auth Error
            </Button>
            <Button 
              variant={errorType === 'permission-error' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setErrorType('permission-error')}
            >
              <Shield className="h-4 w-4 mr-1.5" /> Permission Error
            </Button>
            <Button 
              variant={errorType === 'validation-error' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setErrorType('validation-error')}
            >
              <AlertTriangle className="h-4 w-4 mr-1.5" /> Validation Error
            </Button>
            <Button 
              variant={errorType === 'server-error' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setErrorType('server-error')}
            >
              <ServerCrash className="h-4 w-4 mr-1.5" /> Server Error
            </Button>
          </div>
          
          <h3 className="font-medium mb-4">Card Variant (Default)</h3>
          <div className="mb-6">
            <ErrorDisplay 
              error={error} 
              onRetry={() => alert('Retry action')} 
              onDismiss={() => alert('Dismiss action')}
              showDetails={errorType === 'validation-error'}
            />
          </div>
          
          <h3 className="font-medium mb-4">Alert Variant</h3>
          <div className="mb-6">
            <ErrorDisplay 
              error={error} 
              onRetry={() => alert('Retry action')} 
              variant="alert"
              showDetails={errorType === 'validation-error'}
            />
          </div>
          
          <h3 className="font-medium mb-4">Inline Variant</h3>
          <div className="mb-6">
            <ErrorDisplay 
              error={error} 
              variant="inline"
              showDetails={errorType === 'validation-error'}
            />
          </div>
          
          <h3 className="font-medium mb-4">Compact Style</h3>
          <div className="mb-6">
            <ErrorDisplay 
              error={error} 
              onRetry={() => alert('Retry action')} 
              variant="card"
              compact={true}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Error Boundary Examples
 */
const ErrorBoundaryExample: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Error Boundary Demo</CardTitle>
          <CardDescription>
            Components that throw errors will be caught by the error boundary
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ErrorBoundary onError={(error) => console.error('Error caught by boundary:', error)}>
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Component with Error Boundary</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click the button below to trigger an error that will be caught by the error boundary.
              </p>
              <ErrorThrower />
            </div>
          </ErrorBoundary>
          
          <div className="p-4 border border-dashed rounded-md bg-muted/30">
            <h3 className="font-medium mb-2">Component without Error Boundary</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This would normally crash your app if an error is thrown.
            </p>
            <Button 
              variant="outline" 
              onClick={() => { throw new Error('This error will crash the app!'); }}
              className="bg-destructive/10 border-destructive/40 hover:bg-destructive/20"
            >
              <Bomb className="h-4 w-4 mr-1.5" /> Crash the App
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Use Error Hook Demo</CardTitle>
          <CardDescription>
            Demonstrating the useError hook for handling errors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UseErrorExample />
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Component that throws an error when a button is clicked
 */
const ErrorThrower: React.FC = () => {
  const [shouldThrow, setShouldThrow] = useState(false);
  
  if (shouldThrow) {
    throw new Error('This is a test error from ErrorThrower component');
  }
  
  return (
    <Button 
      variant="outline" 
      onClick={() => setShouldThrow(true)}
    >
      <BugOff className="h-4 w-4 mr-1.5" /> Trigger Error
    </Button>
  );
};

/**
 * Example using the useError hook
 */
const UseErrorExample: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const { error, handleError, clearError } = useError({
    showToast: true
  });
  
  const simulateError = () => {
    try {
      if (!inputValue.trim()) {
        throw new ValidationError('Input is required', { input: ['This field is required'] });
      }
      
      if (inputValue.includes('error')) {
        throw new Error(`You triggered an error with the keyword: ${inputValue}`);
      }
      
      if (inputValue.includes('network')) {
        throw new NetworkError('Network connection failed');
      }
      
      if (inputValue.includes('auth')) {
        throw new AuthenticationError('Authentication failed');
      }
      
      // Success case
      alert(`Success! Value: ${inputValue}`);
      
    } catch (err) {
      handleError(err, { 
        toast: true,
        context: { inputValue } 
      });
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="error-input">Enter a value (include 'error', 'network', or 'auth' to trigger different errors)</Label>
        <Input
          id="error-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a value..."
          className="w-full"
        />
      </div>
      
      <div className="flex gap-2">
        <Button onClick={simulateError}>
          Test Error Handling
        </Button>
        {error && (
          <Button variant="outline" onClick={clearError}>
            Clear Error
          </Button>
        )}
      </div>
      
      {error && (
        <div className="mt-4">
          <ErrorDisplay 
            error={error} 
            variant="alert"
          />
        </div>
      )}
    </div>
  );
};

/**
 * API Error Handling Examples
 */
const APIErrorHandlingExample: React.FC = () => {
  // Mock queries for demonstration
  const successQuery = useQuery({
    queryKey: ['/api/success-example'],
    queryFn: () => Promise.resolve({ data: [1, 2, 3], message: 'Success!' }),
    enabled: true,
  });
  
  const loadingQuery = useQuery({
    queryKey: ['/api/loading-example'],
    queryFn: () => new Promise((resolve) => {
      // Never resolves to simulate perpetual loading
    }),
    enabled: true,
  });
  
  const errorQuery = useQuery({
    queryKey: ['/api/error-example'],
    queryFn: () => Promise.reject(new APIError('Failed to fetch data', 500, { details: 'Internal server error' })),
    enabled: true,
    retry: false,
  });
  
  const emptyQuery = useQuery({
    queryKey: ['/api/empty-example'],
    queryFn: () => Promise.resolve([]),
    enabled: true,
  });
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Error Boundary Examples</CardTitle>
          <CardDescription>
            Using the APIErrorBoundary component with different query states
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-4">Success State</h3>
            <APIErrorBoundary query={successQuery}>
              {(data) => (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <p className="font-medium text-green-700 dark:text-green-400">Data loaded successfully!</p>
                  <pre className="mt-2 p-2 bg-black/5 rounded text-xs overflow-x-auto">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              )}
            </APIErrorBoundary>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Loading State</h3>
            <APIErrorBoundary 
              query={loadingQuery}
              skeletonCount={2}
              skeletonClassName="max-w-md"
            >
              {(data) => (
                <div className="p-4 bg-green-50 rounded-md">
                  <p>This will never render because the query is perpetually loading</p>
                </div>
              )}
            </APIErrorBoundary>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Error State</h3>
            <APIErrorBoundary 
              query={errorQuery}
              errorDisplayProps={{ variant: 'alert' }}
            >
              {(data) => (
                <div className="p-4 bg-green-50 rounded-md">
                  <p>This will never render because the query errors</p>
                </div>
              )}
            </APIErrorBoundary>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Empty State</h3>
            <APIErrorBoundary 
              query={emptyQuery}
              emptyFallback={
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md text-center">
                  <p className="text-blue-700 dark:text-blue-400">No data available</p>
                </div>
              }
            >
              {(data) => (
                <div className="p-4 bg-green-50 rounded-md">
                  <p>This will never render because the query returns empty data</p>
                </div>
              )}
            </APIErrorBoundary>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorHandlingExamples;