/**
 * Error Handler Middleware
 * 
 * Centralized error handling for the API
 */
const logger = require('../config/logger');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * HTTP 400 Bad Request Error
 */
class BadRequestError extends ApiError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

/**
 * HTTP 401 Unauthorized Error
 */
class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * HTTP 403 Forbidden Error
 */
class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * HTTP 404 Not Found Error
 */
class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * HTTP 409 Conflict Error
 */
class ConflictError extends ApiError {
  constructor(message = 'Conflict with current state') {
    super(message, 409);
  }
}

/**
 * HTTP 422 Validation Error
 */
class ValidationError extends ApiError {
  constructor(message = 'Validation failed', errors = null) {
    super(message, 422);
    this.errors = errors;
  }
}

/**
 * HTTP 429 Too Many Requests Error
 */
class TooManyRequestsError extends ApiError {
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}

/**
 * HTTP 500 Internal Server Error
 */
class InternalServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(message, 500);
  }
}

/**
 * HTTP 503 Service Unavailable Error
 */
class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service unavailable') {
    super(message, 503);
  }
}

/**
 * Global error handling middleware
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Set default error status and message
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Something went wrong';
  
  // Determine if this is a trusted operational error or an unknown error
  const isOperational = err.isOperational === true;
  
  // Log the error appropriately
  if (isOperational) {
    // For operational errors, log with less severity
    if (err.statusCode >= 500) {
      logger.error('Operational Error', {
        message: err.message,
        statusCode: err.statusCode,
        path: req.originalUrl,
        method: req.method,
        stack: err.stack,
      });
    } else {
      logger.warn('Client Error', {
        message: err.message,
        statusCode: err.statusCode,
        path: req.originalUrl,
        method: req.method,
      });
    }
  } else {
    // For programming or unexpected errors, log with high severity
    logger.error('Unexpected Error', {
      message: err.message,
      statusCode: err.statusCode,
      path: req.originalUrl,
      method: req.method,
      stack: err.stack,
    });
  }
  
  // Send appropriate response based on environment
  if (process.env.NODE_ENV === 'development') {
    // In development, send detailed error information
    res.status(err.statusCode).json({
      success: false,
      error: {
        status: err.statusCode,
        message: err.message,
        stack: err.stack,
        ...(err.errors && { errors: err.errors }),
      },
    });
  } else {
    // In production, send limited error information
    if (err.statusCode >= 500 && !isOperational) {
      // For unexpected server errors, don't expose details
      res.status(500).json({
        success: false,
        error: {
          status: 500,
          message: 'Something went wrong. Our team has been notified.',
        },
      });
    } else {
      // For operational errors, send the actual error
      res.status(err.statusCode).json({
        success: false,
        error: {
          status: err.statusCode,
          message: err.message,
          ...(err.errors && { errors: err.errors }),
        },
      });
    }
  }
};

module.exports = {
  errorHandler,
  ApiError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  TooManyRequestsError,
  InternalServerError,
  ServiceUnavailableError,
};