/**
 * Error Handler Middleware
 * 
 * This module provides middleware for handling errors in the application.
 * It includes a centralized error handler, 404 handler, and async error wrapper.
 */

const logger = require('../config/logger');

/**
 * Create a standardized error object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code for client
 * @returns {Error} - Error object with additional properties
 */
function createError(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

/**
 * Wrapper for asynchronous route handlers to catch errors
 * @param {Function} fn - Async route handler function
 * @returns {Function} - Wrapped function that catches errors
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Handle 404 errors for undefined routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function notFoundMiddleware(req, res, next) {
  const error = createError(
    `Resource not found: ${req.method} ${req.originalUrl}`,
    404,
    'NOT_FOUND'
  );
  next(error);
}

/**
 * Central error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function errorHandlerMiddleware(err, req, res, next) {
  // Default values if not set
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Something went wrong';
  
  // Log error details (with appropriate level based on status code)
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel](`${req.method} ${req.originalUrl} - ${statusCode}`, {
    error: message,
    code,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    url: req.originalUrl,
    ip: logger.anonymize(req.ip || req.connection.remoteAddress)
  });
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      status: statusCode,
      // Only include stack trace in development
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
}

module.exports = {
  createError,
  asyncHandler,
  notFoundMiddleware,
  errorHandlerMiddleware
};