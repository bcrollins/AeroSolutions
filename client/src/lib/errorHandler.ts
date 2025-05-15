import { ErrorInfo } from 'react';

// Define custom error types
export class APIError extends Error {
  statusCode: number;
  details?: any;
  
  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  fieldErrors: Record<string, string[]>;
  
  constructor(message: string, fieldErrors: Record<string, string[]>) {
    super(message);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

// Error logging service
interface ErrorLogOptions {
  context?: Record<string, any>;
  user?: {
    id?: string;
    email?: string;
  };
  tags?: string[];
  level?: 'error' | 'warning' | 'info';
}

export const logError = (
  error: Error, 
  errorInfo?: ErrorInfo,
  options: ErrorLogOptions = {}
): void => {
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.group('%c🚨 Application Error', 'color: red; font-weight: bold;');
    console.error('Error:', error);
    if (errorInfo) {
      console.error('Component Stack:', errorInfo.componentStack);
    }
    if (options.context) {
      console.info('Context:', options.context);
    }
    if (options.user) {
      console.info('User:', options.user);
    }
    console.groupEnd();
    return;
  }

  // In production, send to server or external service
  // This is where you would integrate with services like Sentry, LogRocket, etc.
  try {
    // Example of data to send to error tracking service
    const errorData = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...options,
    };

    // For now, just log it - in a real app, send to a service
    console.info('Would send to error service:', errorData);

    // Sample code to send to a backend API
    /*
    fetch('/api/log-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorData),
    }).catch(e => {
      console.error('Failed to send error to logging service:', e);
    });
    */
  } catch (e) {
    console.error('Error in logging service:', e);
  }
};

// Utility to parse and handle API responses with error handling
export const handleAPIResponse = async <T>(
  response: Response
): Promise<T> => {
  // Non-JSON responses
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    if (!response.ok) {
      throw new APIError(
        `API returned non-JSON response with status ${response.status}`,
        response.status
      );
    }
    // For non-JSON success responses
    return (await response.text()) as unknown as T;
  }

  // JSON responses
  const data = await response.json();
  
  if (!response.ok) {
    // Handle different error types based on status code or response structure
    switch (response.status) {
      case 400:
        if (data.validationErrors || data.fieldErrors) {
          throw new ValidationError(
            data.message || 'Validation failed',
            data.validationErrors || data.fieldErrors
          );
        }
        throw new APIError(data.message || 'Bad request', 400, data);
        
      case 401:
        throw new AuthenticationError(data.message || 'Authentication required');
        
      case 403:
        throw new AuthorizationError(data.message || 'Access denied');
        
      case 404:
        throw new APIError(data.message || 'Resource not found', 404, data);
        
      case 500:
      case 502:
      case 503:
      case 504:
        throw new APIError(
          data.message || 'Server error occurred',
          response.status,
          data
        );
        
      default:
        throw new APIError(
          data.message || `Error with status code ${response.status}`,
          response.status,
          data
        );
    }
  }
  
  return data as T;
};

// Helper to get user-friendly error messages
export const getUserFriendlyErrorMessage = (error: unknown): string => {
  if (!error) return 'An unknown error occurred';
  
  if (error instanceof ValidationError) {
    // Combine all field errors into a single message
    const fieldErrorMessages = Object.entries(error.fieldErrors)
      .flatMap(([field, errors]) => 
        errors.map(err => `${field}: ${err}`)
      )
      .join('; ');
    
    return fieldErrorMessages || error.message;
  }
  
  if (error instanceof AuthenticationError) {
    return 'Please log in to continue';
  }
  
  if (error instanceof AuthorizationError) {
    return 'You don\'t have permission to perform this action';
  }
  
  if (error instanceof NetworkError) {
    return 'Network connection failed. Please check your internet connection and try again';
  }
  
  if (error instanceof APIError) {
    if (error.statusCode === 404) {
      return 'The requested resource could not be found';
    }
    
    if (error.statusCode >= 500) {
      return 'Our servers are experiencing issues. Please try again later';
    }
    
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  // For unknown error types
  return typeof error === 'string' 
    ? error 
    : 'An unexpected error occurred';
};

// Export a function to create a retry mechanism with exponential backoff
export const withRetry = async <T>(
  fn: () => Promise<T>,
  options = { 
    maxRetries: 3, 
    baseDelay: 300, 
    shouldRetry: (error: unknown) => true 
  }
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 0; attempt < options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry this particular error
      if (!options.shouldRetry(error)) {
        throw error;
      }
      
      // Don't wait after the last attempt
      if (attempt < options.maxRetries - 1) {
        // Exponential backoff with jitter
        const delay = options.baseDelay * Math.pow(2, attempt) +
          Math.random() * 100;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};