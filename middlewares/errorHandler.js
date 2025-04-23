/**
 * Error Handler Middleware
 * 
 * This middleware provides centralized error handling for the application.
 * It standardizes error responses and logs errors appropriately.
 */

const logger = require('../config/logger');

/**
 * Creates an API error object with consistent format
 * @param {string} message - Human-readable error message
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Machine-readable error code
 * @param {Object} details - Additional error details
 * @returns {Error} - Error object with additional properties
 */
function createError(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details = null) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}

/**
 * Express middleware for handling errors
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function errorHandlerMiddleware(err, req, res, next) {
  // Set defaults if properties are missing
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';
  const details = err.details || null;
  
  // Log the error (with different levels based on severity)
  if (statusCode >= 500) {
    logger.error('Server error', {
      path: req.originalUrl || req.url,
      method: req.method,
      error: message,
      code: errorCode,
      ip: logger.anonymize(req.ip),
      stack: err.stack
    });
  } else {
    logger.warn('Client error', {
      path: req.originalUrl || req.url,
      method: req.method,
      error: message,
      code: errorCode,
      ip: logger.anonymize(req.ip)
    });
  }
  
  // Send standardized error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: errorCode,
      details,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Middleware to handle 404 errors for undefined routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function notFoundMiddleware(req, res, next) {
  const err = createError(
    `Not found: ${req.method} ${req.originalUrl || req.url}`,
    404,
    'RESOURCE_NOT_FOUND'
  );
  
  next(err);
}

module.exports = {
  createError,
  errorHandlerMiddleware,
  notFoundMiddleware
};