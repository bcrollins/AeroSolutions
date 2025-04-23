/**
 * Error Handling Middleware
 * 
 * Centralized error handling for the application
 */

const logger = require('../config/logger');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = 'ApiError';
    this.code = code || 'INTERNAL_ERROR';
    this.status = status || 500;
  }
}

/**
 * Create a standardized API error
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {number} status - HTTP status code
 * @returns {ApiError} - Custom error object
 */
function createError(message, code, status) {
  return new ApiError(message, code, status);
}

/**
 * Error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function errorHandler(err, req, res, next) {
  // Default error values
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';
  let stack = err.stack;
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    code = 'VALIDATION_ERROR';
  } else if (err.name === 'UnauthorizedError') {
    status = 401;
    code = 'UNAUTHORIZED';
  } else if (err.name === 'ForbiddenError') {
    status = 403;
    code = 'FORBIDDEN';
  } else if (err.name === 'NotFoundError') {
    status = 404;
    code = 'NOT_FOUND';
  }
  
  // Log the error
  if (status >= 500) {
    logger.error(`Error: ${message}`, {
      code,
      stack,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userId: req.user?.id
    });
  } else {
    logger.warn(`Error: ${message}`, {
      code,
      method: req.method,
      url: req.originalUrl,
      status
    });
  }
  
  // In development, include stack trace
  const error = {
    message,
    code,
    status
  };
  
  if (process.env.NODE_ENV !== 'production' && status >= 500) {
    error.stack = stack;
  }
  
  // Send error response
  res.status(status).json({
    success: false,
    error
  });
}

/**
 * Not found handler middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function notFoundHandler(req, res, next) {
  const error = createError(`Resource not found: ${req.originalUrl}`, 'NOT_FOUND', 404);
  next(error);
}

module.exports = {
  createError,
  errorHandler,
  notFoundHandler
};