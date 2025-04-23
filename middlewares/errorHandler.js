/**
 * Error Handling Middleware
 * 
 * This middleware provides consistent error handling and formatting
 * for all API errors throughout the application.
 */

const logger = require('../config/logger');

/**
 * Custom API error class for standard error handling
 */
class ApiError extends Error {
  /**
   * Create a new API error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} code - Error code for client identification
   * @param {Object} details - Additional error details
   */
  constructor(message, statusCode = 500, code = 'SERVER_ERROR', details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Create a new API error
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code for client identification
 * @param {Object} details - Additional error details 
 * @returns {ApiError} - New API error
 */
function createError(message, statusCode = 500, code = 'SERVER_ERROR', details = {}) {
  return new ApiError(message, statusCode, code, details);
}

/**
 * Handle 404 errors for routes not found
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function notFoundHandler(req, res, next) {
  const error = createError(
    `Route not found: ${req.method} ${req.originalUrl}`,
    404,
    'ROUTE_NOT_FOUND'
  );
  
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    url: req.originalUrl,
    method: req.method,
    headers: req.headers
  });
  
  next(error);
}

/**
 * Main error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function errorHandler(err, req, res, next) {
  // If headers already sent, delegate to Express' default error handler
  if (res.headersSent) {
    return next(err);
  }
  
  // Get status code and default to 500
  const statusCode = err.statusCode || 500;
  
  // Prepare error response
  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'SERVER_ERROR',
      status: statusCode,
      timestamp: err.timestamp || new Date().toISOString()
    }
  };
  
  // Include error details if available
  if (err.details && Object.keys(err.details).length > 0) {
    errorResponse.error.details = err.details;
  }
  
  // Include stack trace in development mode
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.error.stack = err.stack;
  }
  
  // Log the error with appropriate level based on status code
  const logMeta = {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    statusCode: statusCode,
    errorCode: err.code,
    stack: err.stack,
    details: err.details
  };
  
  if (statusCode >= 500) {
    logger.error(`Server Error: ${err.message}`, logMeta);
  } else if (statusCode >= 400) {
    logger.warn(`Client Error: ${err.message}`, logMeta);
  } else {
    logger.info(`Handled Error: ${err.message}`, logMeta);
  }
  
  // Send error response
  res.status(statusCode).json(errorResponse);
}

module.exports = {
  ApiError,
  createError,
  notFoundHandler,
  errorHandler
};