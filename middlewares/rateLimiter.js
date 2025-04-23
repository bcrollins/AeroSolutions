/**
 * Rate Limiter Middleware
 * 
 * This middleware provides rate limiting for API endpoints.
 * It helps protect against abuse and ensures fair usage.
 */

const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

// Helper to create a rate limiter with consistent error responses
function createRateLimiter(options) {
  return rateLimit({
    // Default window: 15 minutes
    windowMs: options.windowMs || 15 * 60 * 1000,
    
    // Default max requests per window
    max: options.max || 100,
    
    // Standardized rate limit exceeded message
    message: {
      success: false,
      error: {
        message: options.message || 'Too many requests, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        details: {
          retryAfter: Math.ceil(options.windowMs / 1000),
          limit: options.max
        }
      }
    },
    
    // Use consistent headers with configurable prefix
    standardHeaders: true,
    legacyHeaders: false,
    
    // Skip rate limiting in test environment
    skip: () => process.env.NODE_ENV === 'test',
    
    // Log rate limit hits
    onLimitReached: (req, res, options) => {
      logger.warn('Rate limit exceeded', {
        ip: logger.anonymize(req.ip),
        path: req.originalUrl || req.url,
        limit: options.max,
        windowMs: options.windowMs
      });
    }
  });
}

// General API rate limiter (100 requests per 15 minutes)
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many API requests from this IP, please try again after 15 minutes'
});

// More restrictive rate limiter for OpenAI endpoints (30 requests per 15 minutes)
const openaiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many OpenAI requests from this IP, please try again after 15 minutes'
});

// Very restrictive rate limiter for sensitive operations (5 requests per hour)
const sensitiveOperationsLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many sensitive operations from this IP, please try again after 1 hour'
});

module.exports = {
  apiLimiter,
  openaiLimiter,
  sensitiveOperationsLimiter
};