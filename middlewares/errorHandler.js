/**
 * Error Handling Middleware
 * 
 * Provides centralized error handling for the application
 */

const logger = require('../config/logger');

// Custom error class for API errors
class APIError extends Error {
  constructor(message, status = 500, code = 'INTERNAL_SERVER_ERROR', data = null) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create a standardized error object
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {string} code - Error code
 * @param {any} data - Additional error data
 * @returns {APIError} - API error object
 */
function createError(message, status = 500, code = 'INTERNAL_SERVER_ERROR', data = null) {
  return new APIError(message, status, code, data);
}

/**
 * Handle 404 errors for undefined routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function notFoundHandler(req, res, next) {
  const error = createError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(error);
}

/**
 * Central error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function errorHandler(err, req, res, next) {
  // Default status code and error information
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Something went wrong';
  const data = err.data || null;
  
  // Log error based on severity
  if (status >= 500) {
    logger.error(`${status} - ${message}`, {
      code,
      method: req.method,
      path: req.path,
      ip: req.ip,
      body: req.body,
      stack: err.stack,
      user: req.user ? { id: req.user.id, username: req.user.username } : 'unauthenticated'
    });
  } else if (status >= 400) {
    logger.warn(`${status} - ${message}`, {
      code,
      method: req.method,
      path: req.path,
      ip: req.ip
    });
  }
  
  // Check if response has already been sent
  if (res.headersSent) {
    return next(err);
  }
  
  // Send error response
  res.status(status).json({
    success: false,
    error: {
      message,
      code,
      status,
      data
    }
  });
}

// Export error handling functions
module.exports = {
  APIError,
  createError,
  notFoundHandler,
  errorHandler
};