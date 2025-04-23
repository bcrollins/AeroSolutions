/**
 * Error Handler Middleware
 * 
 * This module provides middleware functions for handling errors in the API.
 * It includes a central error handler and 404 middleware.
 */

const logger = require('../config/logger');

/**
 * Create a standardized error object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code for client identification
 * @param {Object} details - Additional error details
 * @returns {Error} - Error object with additional properties
 */
function createError(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details = {}) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function errorHandlerMiddleware(err, req, res, next) {
  // Get error details or set defaults
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred';
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const details = err.details || {};
  
  // Log the error (but not for 404s)
  if (statusCode !== 404) {
    const logLevel = statusCode >= 500 ? 'error' : 'warn';
    logger[logLevel](`${code}: ${message}`, {
      statusCode,
      path: req.originalUrl || req.url,
      method: req.method,
      ip: logger.anonymize(req.ip),
      details,
      stack: err.stack
    });
  }
  
  // Send response to client
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      status: statusCode,
      ...(Object.keys(details).length > 0 && { details })
    }
  });
}

/**
 * 404 Not Found middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function notFoundMiddleware(req, res, next) {
  const err = createError(
    `Cannot ${req.method} ${req.originalUrl || req.url}`,
    404,
    'NOT_FOUND'
  );
  
  next(err);
}

/**
 * Async handler wrapper to avoid try/catch blocks
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Express middleware function
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  createError,
  errorHandlerMiddleware,
  notFoundMiddleware,
  asyncHandler
};