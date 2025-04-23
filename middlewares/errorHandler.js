/**
 * Error Handler Middleware
 * 
 * This module provides middleware for handling errors that occur
 * during request processing.
 */

const logger = require('../config/logger');

/**
 * Custom error creation function with standardized format
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} code - Error code for client-side error handling (default: 'UNKNOWN_ERROR')
 * @param {object} details - Additional error details (optional)
 * @returns {Error} - Formatted error object
 */
function createError(message, statusCode = 500, code = 'UNKNOWN_ERROR', details = {}) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}

/**
 * Not found (404) handler middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function notFoundHandler(req, res, next) {
  // Skip for static assets and API docs
  if (req.path.startsWith('/assets/') || req.path.startsWith('/docs/')) {
    return next();
  }
  
  // For API routes, return JSON error
  if (req.path.startsWith('/api/')) {
    const error = createError(
      `API endpoint not found: ${req.method} ${req.path}`,
      404,
      'NOT_FOUND'
    );
    return next(error);
  }
  
  // For other routes, pass through (will be handled by frontend routing)
  next();
}

/**
 * Error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function errorHandler(err, req, res, next) {
  // Set default values if not provided
  const statusCode = err.statusCode || 500;
  const code = err.code || 'UNKNOWN_ERROR';
  const message = err.message || 'An unexpected error occurred';
  
  // Log the error (with different levels based on status code)
  if (statusCode >= 500) {
    logger.error('Server error', {
      error: message,
      code,
      statusCode,
      path: req.path,
      method: req.method,
      stack: err.stack
    });
  } else if (statusCode >= 400) {
    logger.warn('Client error', {
      error: message,
      code,
      statusCode,
      path: req.path,
      method: req.method
    });
  }
  
  // Prepare the response
  const errorResponse = {
    success: false,
    error: {
      message,
      code,
      statusCode
    }
  };
  
  // In development, include more details
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.error.stack = err.stack;
    if (err.details) {
      errorResponse.error.details = err.details;
    }
  }
  
  // Send the error response
  res.status(statusCode).json(errorResponse);
}

module.exports = {
  errorHandler,
  notFoundHandler,
  createError
};