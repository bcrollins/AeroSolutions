/**
 * Error Handler Middleware
 * 
 * Centralized error handling for the application
 */

const logger = require('../config/logger');

/**
 * Error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware
 */
function errorHandler(err, req, res, next) {
  // Log the error
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.method !== 'GET' ? req.body : undefined,
    requestId: req.id || 'unknown'
  });

  // Determine if this is an operational error (expected) or programming error (unexpected)
  const isOperational = err.isOperational || false;
  
  // Format the error response
  const errorResponse = {
    success: false,
    error: {
      message: isOperational ? err.message : 'Internal server error',
      code: err.code || 'SERVER_ERROR',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  };
  
  // Additional details for non-production environments
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.error.originalMessage = err.message;
  }
  
  // Set the appropriate status code
  const statusCode = err.statusCode || 500;
  
  // Send the error response
  res.status(statusCode).json(errorResponse);
}

/**
 * Not found handler middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware
 */
function notFoundHandler(req, res, next) {
  const err = new Error(`Not Found - ${req.originalUrl}`);
  err.statusCode = 404;
  err.isOperational = true;
  err.code = 'RESOURCE_NOT_FOUND';
  next(err);
}

/**
 * Create an operational error
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {number} statusCode - HTTP status code
 * @returns {Error} - Operational error
 */
function createError(message, code = 'INTERNAL_ERROR', statusCode = 500) {
  const error = new Error(message);
  error.isOperational = true;
  error.code = code;
  error.statusCode = statusCode;
  return error;
}

/**
 * Handle uncaught exceptions
 * @param {Error} err - Error object
 */
function handleUncaughtException(err) {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', {
    error: err.message,
    stack: err.stack
  });
  // Implement graceful shutdown logic if needed
  process.exit(1);
}

/**
 * Handle unhandled promise rejections
 * @param {Error} err - Error object
 */
function handleUnhandledRejection(err) {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', {
    error: err.message,
    stack: err.stack 
  });
  // Implement graceful shutdown logic if needed
  process.exit(1);
}

// Register global handlers
process.on('uncaughtException', handleUncaughtException);
process.on('unhandledRejection', handleUnhandledRejection);

module.exports = {
  errorHandler,
  notFoundHandler,
  createError
};