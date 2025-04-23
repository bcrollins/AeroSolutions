/**
 * Error Handler Middleware
 * 
 * This module provides centralized error handling for the application.
 * It includes a custom error factory and middleware functions to handle
 * errors and not-found routes.
 */

const logger = require('../config/logger');

/**
 * Create a standardized error object
 * @param {string} message - Human-readable error message
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Machine-readable error code
 * @param {Object} details - Additional error details (optional)
 * @returns {Error} - Enhanced error object
 */
function createError(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  if (details) {
    error.details = details;
  }
  return error;
}

/**
 * Not found handler middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function notFoundHandler(req, res, next) {
  const error = createError(`Resource not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(error);
}

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function errorHandler(err, req, res, next) {
  // Set default values if not provided
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred';
  
  // Create error response object
  const errorResponse = {
    success: false,
    error: {
      message,
      code: errorCode
    }
  };
  
  // Include error details if available
  if (err.details) {
    errorResponse.error.details = err.details;
  }
  
  // Only include stack trace in development
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    errorResponse.error.stack = err.stack;
  }
  
  // Log error with appropriate level based on status code
  const logMethod = statusCode >= 500 ? 'error' : 'warn';
  logger[logMethod](`${req.method} ${req.originalUrl}`, {
    statusCode,
    errorCode,
    message,
    ip: logger.anonymize(req.ip),
    userId: req.user?.id, // Log user ID if authenticated
    stack: err.stack
  });
  
  // Send error response
  res.status(statusCode).json(errorResponse);
}

module.exports = {
  createError,
  notFoundHandler,
  errorHandler
};