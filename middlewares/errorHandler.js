/**
 * Error Handler Middleware
 * 
 * Centralized error handling middleware for consistent error responses
 */

const logger = require('../config/logger');

/**
 * Error handler middleware for Express
 */
function errorHandler(err, req, res, next) {
  // Log the error
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    errorCode: err.code || 'UNKNOWN'
  });

  // Determine the error code based on the error type
  let statusCode = err.statusCode || 500;
  let errorMessage = err.message || 'Internal Server Error';
  let errorDetails = err.details || null;
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = 'Validation error';
    errorDetails = err.errors || err.details;
  } else if (err.name === 'UnauthorizedError' || err.message === 'Unauthorized') {
    statusCode = 401;
    errorMessage = 'Unauthorized access';
  } else if (err.name === 'ForbiddenError' || err.message === 'Forbidden') {
    statusCode = 403;
    errorMessage = 'Access forbidden';
  } else if (err.name === 'NotFoundError' || err.message.includes('not found')) {
    statusCode = 404;
    errorMessage = 'Resource not found';
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    errorMessage = 'File too large';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    errorMessage = 'Invalid file type';
  } else if (err.code === 'EBADCSRFTOKEN') {
    statusCode = 403;
    errorMessage = 'Invalid CSRF token';
  }

  // Handle database connection errors
  if (err.code === 'ECONNREFUSED' && err.message.includes('database')) {
    statusCode = 503;
    errorMessage = 'Database service unavailable';
  }

  // Handle OpenAI API errors
  if (err.message.includes('OpenAI')) {
    if (err.message.includes('API key')) {
      statusCode = 401;
      errorMessage = 'OpenAI API authentication failed';
    } else {
      statusCode = 502;
      errorMessage = 'OpenAI API error';
    }
  }

  // Clean up error details for production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    errorDetails = null; // Don't expose detailed error info in production
  }

  // Send the error response
  res.status(statusCode).json({
    success: false,
    error: {
      message: errorMessage,
      code: err.code || err.name || 'INTERNAL_ERROR',
      details: errorDetails,
      requestId: req.id // Assuming request ID middleware is used
    },
    timestamp: new Date().toISOString()
  });
}

module.exports = errorHandler;