/**
 * Error Handling Middleware
 * 
 * This middleware provides centralized error handling for the application.
 * It creates consistent error responses and logs errors appropriately.
 */

const logger = require('../config/logger');

/**
 * Function to create a standardized error object with consistent properties
 * @param {string} message - Human-readable error message
 * @param {number} status - HTTP status code (default: 500)
 * @param {string} code - Error code for client-side error handling (default: 'SERVER_ERROR')
 * @param {Object} details - Additional error details (optional)
 * @returns {Error} - Enhanced error object
 */
function createError(message, status = 500, code = 'SERVER_ERROR', details = {}) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.details = details;
  return error;
}

/**
 * Express middleware to handle errors consistently
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function errorHandler(err, req, res, next) {
  // Set default status code if not provided
  const statusCode = err.status || 500;
  
  // Set default error code if not provided
  const errorCode = err.code || 'SERVER_ERROR';
  
  // Format the response
  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'An unexpected error occurred',
      code: errorCode
    }
  };
  
  // Add stack trace in development mode
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.error.stack = err.stack;
  }
  
  // Add any additional error details
  if (err.details && Object.keys(err.details).length > 0) {
    errorResponse.error.details = err.details;
  }
  
  // Log the error with appropriate level
  if (statusCode >= 500) {
    logger.error(`Server error: ${err.message}`, {
      status: statusCode,
      code: errorCode,
      stack: err.stack,
      details: err.details,
      path: req.path,
      method: req.method
    });
  } else {
    logger.warn(`Client error: ${err.message}`, {
      status: statusCode,
      code: errorCode,
      path: req.path,
      method: req.method
    });
  }
  
  // Send the error response
  res.status(statusCode).json(errorResponse);
}

/**
 * Express middleware to handle 404 errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function notFoundHandler(req, res, next) {
  // Skip handling certain requests like favicon or static assets
  if (
    req.path.startsWith('/favicon.ico') || 
    req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)
  ) {
    return next();
  }
  
  // For API requests, return a JSON 404 response
  if (req.path.startsWith('/api/')) {
    const error = createError(
      `Route not found: ${req.method} ${req.path}`,
      404,
      'ROUTE_NOT_FOUND'
    );
    
    return errorHandler(error, req, res, next);
  }
  
  // For other requests, let the frontend router handle it
  // This enables client-side routing in SPA applications
  next();
}

module.exports = {
  createError,
  errorHandler,
  notFoundHandler
};