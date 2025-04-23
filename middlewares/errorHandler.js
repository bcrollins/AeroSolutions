/**
 * Error Handling Middleware
 * 
 * This middleware provides centralized error handling for the application.
 * It standardizes error responses and logs errors for monitoring.
 */

const logger = require('../config/logger');

/**
 * Create a standardized API error object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code for clients
 * @param {Object} details - Additional error details
 * @returns {Object} - Standardized error object
 */
function createError(message, statusCode = 500, code = 'SERVER_ERROR', details = null) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}

/**
 * Global error handling middleware
 * This should be registered after all routes
 */
function errorHandler(err, req, res, next) {
  // Extract error information
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'SERVER_ERROR';
  const details = err.details || null;
  
  // Log the error
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel](`API Error: ${message}`, {
    error: {
      message,
      code,
      statusCode,
      stack: err.stack
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userId: req.user?.id
    }
  });
  
  // Construct response
  const errorResponse = {
    success: false,
    error: {
      message,
      code,
      statusCode
    }
  };
  
  // Add details if available
  if (details) {
    errorResponse.error.details = details;
  }
  
  // In development, include stack trace
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.error.stack = err.stack?.split('\n');
  }
  
  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * Not found handler middleware
 * This should be registered after all routes to catch 404s
 */
function notFoundHandler(req, res, next) {
  const error = createError(`Route not found: ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(error);
}

module.exports = {
  createError,
  errorHandler,
  notFoundHandler
};