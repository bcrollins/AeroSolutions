// Define consistent, user-friendly error messages throughout the application

// Network and connection errors
export const NETWORK_ERRORS = {
  CONNECTION_FAILED: 'Unable to connect to the server. Please check your internet connection.',
  REQUEST_TIMEOUT: 'The request timed out. Please try again.',
  OFFLINE: 'You appear to be offline. Please check your internet connection and try again.',
  SERVER_UNREACHABLE: 'Our servers are currently unreachable. Please try again later.',
};

// Authentication and authorization errors
export const AUTH_ERRORS = {
  LOGIN_REQUIRED: 'Please log in to continue.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action.',
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  ACCOUNT_LOCKED: 'Your account has been locked for security reasons. Please contact support.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address before continuing.',
  PASSWORD_RESET_REQUIRED: 'You need to reset your password before continuing.',
  MFA_REQUIRED: 'Multi-factor authentication is required to continue.',
};

// Form validation errors
export const VALIDATION_ERRORS = {
  REQUIRED_FIELD: (field: string) => `${field} is required.`,
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 8 characters and include a number and a special character.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  INVALID_DATE: 'Please enter a valid date.',
  INVALID_URL: 'Please enter a valid URL.',
  TOO_SHORT: (field: string, minLength: number) => `${field} must be at least ${minLength} characters.`,
  TOO_LONG: (field: string, maxLength: number) => `${field} cannot exceed ${maxLength} characters.`,
  INVALID_FORMAT: (field: string, format: string) => `${field} must be in the format: ${format}`,
};

// API specific errors
export const API_ERRORS = {
  NOT_FOUND: 'The requested resource could not be found.',
  BAD_REQUEST: 'The request could not be processed. Please check your input and try again.',
  TOO_MANY_REQUESTS: 'You have made too many requests. Please try again later.',
  SERVER_ERROR: 'An unexpected server error occurred. Our team has been notified.',
  SERVICE_UNAVAILABLE: 'This service is temporarily unavailable. Please try again later.',
  MAINTENANCE: 'The system is currently undergoing maintenance. Please try again later.',
  DEPRECATED: 'This feature is no longer supported. Please update to the latest version.',
};

// Payment and subscription errors
export const PAYMENT_ERRORS = {
  PAYMENT_FAILED: 'Your payment could not be processed. Please check your payment details and try again.',
  CARD_DECLINED: 'Your card was declined. Please use a different payment method.',
  INSUFFICIENT_FUNDS: 'Your card has insufficient funds. Please use a different payment method.',
  SUBSCRIPTION_EXPIRED: 'Your subscription has expired. Please renew to continue.',
  TRIAL_ENDED: 'Your trial period has ended. Please subscribe to continue.',
  PAYMENT_REQUIRED: 'A payment is required to continue.',
  INVALID_COUPON: 'The coupon code you entered is invalid or has expired.',
};

// Data errors
export const DATA_ERRORS = {
  LOAD_FAILED: 'Failed to load data. Please try refreshing the page.',
  SAVE_FAILED: 'Failed to save data. Please try again.',
  DELETE_FAILED: 'Failed to delete. Please try again.',
  UPDATE_FAILED: 'Failed to update. Please try again.',
  SYNC_FAILED: 'Failed to synchronize data. Some changes may not be saved.',
  INVALID_DATA: 'The data you provided is invalid. Please check and try again.',
  CONFLICT: 'A conflict occurred with the existing data. Please refresh and try again.',
};

// File errors
export const FILE_ERRORS = {
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  DOWNLOAD_FAILED: 'File download failed. Please try again.',
  FILE_TOO_LARGE: 'The file exceeds the maximum allowed size.',
  INVALID_FILE_TYPE: 'This file type is not supported.',
  CORRUPTED_FILE: 'The file appears to be corrupted. Please try a different file.',
  MISSING_FILE: 'The file could not be found.',
  STORAGE_LIMIT_REACHED: 'Your storage limit has been reached. Please free up space before uploading.',
};

// Functional errors
export const FUNCTIONAL_ERRORS = {
  FEATURE_UNAVAILABLE: 'This feature is currently unavailable. Please try again later.',
  RATE_LIMITED: 'You have reached the rate limit for this action. Please try again later.',
  OPERATION_CANCELED: 'The operation was canceled.',
  INVALID_OPERATION: 'This operation cannot be performed at this time.',
  DEPENDENCY_ERROR: 'A required component or service is unavailable. Please try again later.',
  TIMED_OUT: 'The operation timed out. Please try again.',
  CONCURRENT_MODIFICATION: 'The content was modified by another user. Please refresh and try again.',
};

// Error formatting helpers
export const formatValidationErrors = (errors: Record<string, string[]>): string => {
  return Object.entries(errors)
    .map(([field, messages]) => {
      const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
      return `${fieldName}: ${messages.join(', ')}`;
    })
    .join('; ');
};

// Utility to get user-friendly error message based on status code
export const getErrorMessageByStatusCode = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return API_ERRORS.BAD_REQUEST;
    case 401:
      return AUTH_ERRORS.LOGIN_REQUIRED;
    case 403:
      return AUTH_ERRORS.INSUFFICIENT_PERMISSIONS;
    case 404:
      return API_ERRORS.NOT_FOUND;
    case 409:
      return DATA_ERRORS.CONFLICT;
    case 413:
      return FILE_ERRORS.FILE_TOO_LARGE;
    case 429:
      return API_ERRORS.TOO_MANY_REQUESTS;
    case 500:
      return API_ERRORS.SERVER_ERROR;
    case 502:
    case 503:
    case 504:
      return API_ERRORS.SERVICE_UNAVAILABLE;
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};