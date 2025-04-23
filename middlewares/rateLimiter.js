/**
 * Rate Limiter Middleware
 * 
 * Implements rate limiting to protect API endpoints from abuse
 */
const rateLimit = require('express-rate-limit');
const { ServiceUnavailableError } = require('./errorHandler');
const logger = require('../config/logger');

// Create a store for production environments (if needed)
// For example, you might want to use Redis store for distributed applications
// const RedisStore = require('rate-limit-redis');
// const redisClient = require('../config/redis'); // You would need to create this

/**
 * Create rate limiter based on provided options
 * @param {Object} options - Rate limiting options
 * @returns {Function} Express middleware
 */
function createRateLimiter(options = {}) {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests: false, // Don't count successful requests
    message: 'Too many requests, please try again later.',
    skip: (req) => false, // No default skip function
  };

  // Merge provided options with defaults
  const limiterOptions = {
    ...defaultOptions,
    ...options,
    handler: (req, res, next, options) => {
      // Log rate limit hit
      logger.warn(`Rate limit exceeded`, {
        ip: req.ip,
        path: req.originalUrl,
        method: req.method,
        userAgent: req.get('user-agent'),
        limit: options.max,
        window: options.windowMs,
      });
      
      // Use our error handler for consistency
      next(new ServiceUnavailableError(options.message || 'Too many requests, please try again later.'));
    }
  };
  
  // Return the configured middleware
  return rateLimit(limiterOptions);
}

// Standard API rate limiter
const apiLimiter = createRateLimiter({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many API requests, please try again after 15 minutes',
});

// More strict rate limiter for authentication routes
const authLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  message: 'Too many login attempts, please try again after an hour',
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Rate limiter specifically for OpenAI endpoints
const openaiLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 60, // 60 requests per hour (1 per minute on average)
  message: 'OpenAI request limit reached. Please try again later.',
});

module.exports = {
  createRateLimiter,
  apiLimiter,
  authLimiter,
  openaiLimiter
};