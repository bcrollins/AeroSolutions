/**
 * Rate Limiter Middleware
 * 
 * Implements request rate limiting to prevent abuse and ensure fair API usage
 */

const logger = require('../config/logger');
const NodeCache = require('node-cache');

// In-memory cache for storing rate limit information
const cache = new NodeCache({
  stdTTL: 60, // Default 60 seconds TTL
  checkperiod: 30, // Check for expired keys every 30 seconds
  useClones: false // Don't clone objects when getting/setting
});

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @returns {Function} - Express middleware
 */
function createRateLimiter(options = {}) {
  // Default options
  const config = {
    windowMs: options.windowMs || 60 * 1000, // 1 minute window
    maxRequests: options.maxRequests || 100, // Max 100 requests per window
    message: options.message || 'Too many requests, please try again later.',
    statusCode: options.statusCode || 429, // Too Many Requests
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    keyGenerator: options.keyGenerator || ((req) => req.ip),
    skip: options.skip || (() => false),
    handler: options.handler || defaultHandler,
    headers: options.headers !== false, // Enable headers by default
  };

  /**
   * Default rate limit exceeded handler
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  function defaultHandler(req, res) {
    res.status(config.statusCode).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: config.message,
        retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
      }
    });
  }

  /**
   * Rate limiter middleware function
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Next middleware
   */
  return function rateLimiter(req, res, next) {
    // Skip rate limiting if the condition is met
    if (config.skip(req, res)) {
      return next();
    }

    // Generate the rate limit key (default is IP-based)
    const key = config.keyGenerator(req);
    
    // Get current time to calculate reset time
    const now = Date.now();
    
    // Get existing rate limit info for this key
    let rateLimitInfo = cache.get(key);
    
    if (!rateLimitInfo) {
      // Initialize new rate limit record
      rateLimitInfo = {
        count: 0,
        resetTime: now + config.windowMs,
        lastRequest: now
      };
    }
    
    // Reset count if the window has expired
    if (now > rateLimitInfo.resetTime) {
      rateLimitInfo = {
        count: 0,
        resetTime: now + config.windowMs,
        lastRequest: now
      };
    }
    
    // Increment request count
    rateLimitInfo.count += 1;
    rateLimitInfo.lastRequest = now;
    
    // Store the updated rate limit info
    const ttl = Math.ceil((rateLimitInfo.resetTime - now) / 1000);
    cache.set(key, rateLimitInfo, ttl);
    
    // Attach rate limit info to the request
    req.rateLimit = {
      limit: config.maxRequests,
      current: rateLimitInfo.count,
      remaining: Math.max(0, config.maxRequests - rateLimitInfo.count),
      resetTime: rateLimitInfo.resetTime - now
    };
    
    // Set rate limit headers if enabled
    if (config.headers) {
      res.setHeader('X-RateLimit-Limit', config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', req.rateLimit.remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimitInfo.resetTime / 1000));
    }
    
    // Check if rate limit is exceeded
    if (rateLimitInfo.count > config.maxRequests) {
      // Log rate limit exceeded
      logger.warn(`Rate limit exceeded for ${key}`, {
        key,
        count: rateLimitInfo.count,
        limit: config.maxRequests,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
      });
      
      // Handle rate limit exceeded
      return config.handler(req, res, next);
    }
    
    // If skipSuccessfulRequests is true, decrease the counter when the response is successful
    if (config.skipSuccessfulRequests) {
      const originalSend = res.send;
      res.send = function(...args) {
        // If the response is successful (2xx), decrement the counter
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const updatedRateLimitInfo = cache.get(key);
          if (updatedRateLimitInfo && updatedRateLimitInfo.count > 0) {
            updatedRateLimitInfo.count -= 1;
            cache.set(key, updatedRateLimitInfo, ttl);
          }
        }
        originalSend.apply(res, args);
      };
    }
    
    next();
  };
}

// Export pre-configured rate limiters for common scenarios
module.exports = {
  // Standard rate limiter
  standard: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100
  }),
  
  // API rate limiter
  api: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60
  }),
  
  // Strict rate limiter for sensitive endpoints
  strict: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20
  }),
  
  // Very strict rate limiter for login, registration, etc.
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    message: 'Too many authentication attempts, please try again later.'
  }),
  
  // OpenAI API rate limiter (prevents excessive API usage)
  openai: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'OpenAI API rate limit exceeded, please try again in a moment.'
  }),
  
  // Factory function to create custom rate limiters
  createRateLimiter
};