/**
 * Error handling utility for the application
 * Centralizes error capturing, formatting, and reporting
 */

interface ErrorContext {
  [key: string]: any;
}

interface ErrorReportingOptions {
  silent?: boolean;
  context?: ErrorContext;
}

// Custom error classes for different error types
export class APIError extends Error {
  status?: number;
  response?: any;
  
  constructor(message: string, status?: number, response?: any) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.response = response;
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection error') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  errors: Record<string, string[]>;
  
  constructor(message: string = 'Validation failed', errors: Record<string, string[]> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Log an error to the console and monitoring service
 */
export function logError(error: Error, context: ErrorContext = {}): void {
  console.error('Error logged:', error.message, context);
  captureError(error, context);
}

/**
 * Get a user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: Error | any): string {
  return formatErrorMessage(error);
}

/**
 * Process an API response and handle common error cases
 */
export function handleAPIResponse<T>(response: any): T {
  if (!response) {
    throw new APIError('No response received from API');
  }
  
  if (response.status && response.status >= 400) {
    if (response.status === 401) {
      throw new AuthenticationError(response.data?.message || 'Authentication required');
    }
    
    if (response.status === 403) {
      throw new AuthorizationError(response.data?.message || 'Access denied');
    }
    
    if (response.status === 422 && response.data?.errors) {
      throw new ValidationError('Validation failed', response.data.errors);
    }
    
    throw new APIError(
      response.data?.message || 'An error occurred while processing your request',
      response.status,
      response.data
    );
  }
  
  return response.data;
}

/**
 * Captures and processes errors in the application
 * 
 * @param error The error object to capture
 * @param context Additional context about the error
 */
export function captureError(error: Error, context: ErrorContext = {}): void {
  // Log the error to console
  console.error('Error captured:', error, context);
  
  // In a real application, you might send this to an error tracking service
  // like Sentry, LogRocket, etc.
  
  // Example:
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { extra: context });
  // }
}

/**
 * Handles promise rejections and errors in async functions
 * 
 * @param fn The async function to execute
 * @param options Options for error handling
 * @returns A new function that handles errors
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: ErrorReportingOptions = {}
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      // Capture the error for reporting
      if (!options.silent) {
        captureError(error as Error, options.context);
      }
      
      // Re-throw the error to allow calling code to handle it
      throw error;
    }
  };
}

/**
 * Formats an error message for display to users
 * 
 * @param error The error object
 * @returns A user-friendly error message
 */
export function formatErrorMessage(error: Error | any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  // Network error
  if (error?.name === 'NetworkError' || error?.message?.includes('network')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }
  
  // API error with response message
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Standard error object
  if (error?.message) {
    return error.message;
  }
  
  // Unknown error
  return 'An unexpected error occurred. Please try again later.';
}

/**
 * Categorizes errors for different handling strategies
 * 
 * @param error The error to categorize
 * @returns The error type as a string
 */
export function getErrorType(error: Error | any): string {
  if (error?.response?.status) {
    const status = error.response.status;
    
    if (status === 401 || status === 403) {
      return 'auth';
    }
    
    if (status === 404) {
      return 'not_found';
    }
    
    if (status >= 500) {
      return 'server';
    }
    
    return 'api';
  }
  
  if (error?.name === 'NetworkError' || error?.message?.includes('network')) {
    return 'network';
  }
  
  if (error?.name === 'ValidationError' || error?.name === 'ZodError') {
    return 'validation';
  }
  
  return 'unknown';
}

/**
 * Gets suggested actions based on error type
 * 
 * @param errorType The type of error
 * @returns Array of suggested actions
 */
export function getSuggestedActions(errorType: string): string[] {
  switch (errorType) {
    case 'auth':
      return [
        'Try logging in again',
        'Check if your session has expired',
      ];
    case 'network':
      return [
        'Check your internet connection',
        'Try again in a few moments',
        'Contact your network administrator if the problem persists',
      ];
    case 'server':
      return [
        'Try again later',
        'Contact support if the problem persists',
      ];
    case 'validation':
      return [
        'Check the information you provided',
        'Make sure all required fields are filled correctly',
      ];
    case 'not_found':
      return [
        'Check the URL or resource ID',
        'The item may have been removed or relocated',
      ];
    default:
      return [
        'Try refreshing the page',
        'Try again later',
        'Contact support if the problem persists',
      ];
  }
}