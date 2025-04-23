/**
 * Rate Limiter Middleware
 * 
 * This middleware implements rate limiting for API endpoints.
 * It uses a tiered approach to protect against abuse while allowing
 * legitimate usage patterns.
 */

const rateLimit = require('express-rate-limit');
const { createError } = require('./errorHandler');
const logger = require('../config/logger');

// Helper to format error responses consistently
const errorHandler = (req, res, next, options) => {
  const err = createError(
    `Too many requests, please try again later.`,
    429,
    'RATE_LIMIT_EXCEEDED',
    {
      retryAfter: options.windowMs / 1000,
      limit: options.max,
      windowMs: options.windowMs
    }
  );
  
  // Log rate limit exceeded
  logger.warn('Rate limit exceeded', {
    ip: logger.anonymize(req.ip),
    path: req.originalUrl || req.url,
    limit: options.max,
    windowMs: options.windowMs
  });
  
  next(err);
};

// Standard rate limit for most API endpoints
const standardLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after a minute',
  handler: errorHandler
});

// Stricter rate limit for authentication-related endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts, please try again after 15 minutes',
  handler: errorHandler
});

// Rate limit for sensitive operations like password reset
const sensitiveOperationsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many sensitive operations, please try again later',
  handler: errorHandler
});

// Rate limit for OpenAI API endpoints (higher limit but still protected)
const openaiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Rate limit exceeded for AI operations, please try again after a minute',
  handler: errorHandler
});

// Rate limit for public APIs without authentication
const publicApiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 requests per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 5 minutes',
  handler: errorHandler
});

// Very strict rate limit for endpoints that need extra protection
const strictLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // 3 requests per day
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests for this operation, daily limit exceeded',
  handler: errorHandler
});

module.exports = {
  standardLimiter,
  authLimiter,
  sensitiveOperationsLimiter,
  openaiLimiter,
  publicApiLimiter,
  strictLimiter
};