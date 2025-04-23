/**
 * Error Handler Middleware
 * 
 * This middleware provides centralized error handling for the application.
 * It standardizes error responses and logs error details.
 */

const logger = require('../config/logger');

/**
 * Custom error factory function to create standardized error objects
 * 
 * @param {string} message - Human-readable error message
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Machine-readable error code
 * @param {Object} details - Additional error details
 * @returns {Error} Error object with additional properties
 */
function createError(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details = {}) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}

/**
 * Global error handler middleware
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function errorHandler(err, req, res, next) {
  // Set default status code if not present
  const statusCode = err.statusCode || 500;
  
  // Set default error code if not present
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  
  // Create error response object
  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'An unexpected error occurred',
      code: errorCode
    }
  };
  
  // Add stack trace in development environment
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.error.stack = err.stack;
  }
  
  // Add any additional error details if present
  if (err.details && Object.keys(err.details).length > 0) {
    errorResponse.error.details = err.details;
  }
  
  // Log error details using appropriate severity level
  if (statusCode >= 500) {
    logger.error('Server error', {
      message: err.message,
      code: errorCode,
      stack: err.stack,
      url: req.originalUrl || req.url,
      method: req.method,
      ip: logger.anonymize(req.ip)
    });
  } else if (statusCode >= 400) {
    logger.warn('Client error', {
      message: err.message,
      code: errorCode,
      url: req.originalUrl || req.url,
      method: req.method,
      ip: logger.anonymize(req.ip)
    });
  }
  
  // Send error response to client
  res.status(statusCode).json(errorResponse);
}

// 404 handler middleware - for routes that don't exist
function notFoundHandler(req, res, next) {
  const error = createError(
    `Route not found: ${req.originalUrl || req.url}`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
}

module.exports = {
  createError,
  errorHandler,
  notFoundHandler
};