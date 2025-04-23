/**
 * Rate Limiting Middleware
 * 
 * Provides rate limiting for API endpoints to prevent abuse
 */

const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');
const { createError } = require('./errorHandler');

// Configure rate limiting options for different endpoints
const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_MAX_REQUESTS = 100; // 100 requests per window

// Helper to create a rate limiter with custom options
function createLimiter(options = {}) {
  const {
    windowMs = DEFAULT_WINDOW_MS,
    max = DEFAULT_MAX_REQUESTS,
    message = 'Too many requests from this IP, please try again later',
    statusCode = 429,
    standardHeaders = true,
    legacyHeaders = false,
    skipSuccessfulRequests = false,
    requestPropertyName = 'rateLimit',
    keyGenerator = (req) => req.ip,
    handler
  } = options;
  
  // Custom handler for rate limit exceeded
  const defaultHandler = (req, res, next, options) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.originalUrl,
      method: req.method,
      userAgent: req.headers['user-agent'],
      limit: max,
      window: windowMs / 1000 / 60 + ' minutes'
    });
    
    const error = createError(
      message,
      statusCode,
      'RATE_LIMIT_EXCEEDED',
      {
        timeWindow: windowMs / 1000 + ' seconds',
        maxRequests: max
      }
    );
    
    next(error);
  };
  
  return rateLimit({
    windowMs,
    max,
    message,
    statusCode,
    standardHeaders,
    legacyHeaders,
    skipSuccessfulRequests,
    requestPropertyName,
    keyGenerator,
    handler: handler || defaultHandler
  });
}

// Create different rate limiters for different endpoints

// API rate limiter (used for most API endpoints)
const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
});

// Contact form rate limiter (more restrictive)
const contactLimiter = createLimiter({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5, // 5 requests per window
  message: 'Too many contact form submissions, please try again later'
});

// OpenAI API rate limiter (restricted due to cost)
const openaiLimiter = createLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 requests per window
  message: 'Too many AI requests, please try again later'
});

// Authentication rate limiter (to prevent brute force)
const authLimiter = createLimiter({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 10, // 10 requests per window
  message: 'Too many authentication attempts, please try again later'
});

// Strict rate limiter for sensitive operations
const strictLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 5, // 5 requests per window
  message: 'Too many requests for this operation, please try again later'
});

module.exports = {
  apiLimiter,
  contactLimiter,
  openaiLimiter,
  authLimiter,
  strictLimiter,
  createLimiter // Export the factory function for custom limiters
};