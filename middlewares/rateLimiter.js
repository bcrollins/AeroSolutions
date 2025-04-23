/**
 * Rate Limiter Middleware
 * 
 * Implements request rate limiting to prevent abuse
 */

const logger = require('../config/logger');
const NodeCache = require('node-cache');

// Simple in-memory cache for rate limiting
const requestCache = new NodeCache({
  stdTTL: 60, // Cache expires after 60 seconds
  checkperiod: 120, // Check for expired entries every 120 seconds
});

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @param {number} options.maxRequests - Maximum number of requests allowed in the time window
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {string} options.message - Error message to send when rate limit is exceeded
 * @returns {Function} - Express middleware function
 */
const rateLimiter = ({ maxRequests = 30, windowMs = 60000, message = 'Too many requests' } = {}) => {
  return (req, res, next) => {
    // Generate a key based on IP address and optional path
    const ip = req.ip || req.connection.remoteAddress;
    const key = `${ip}-${req.path}`;
    
    // Get current count and timestamp from cache
    const record = requestCache.get(key) || { count: 0, resetTime: Date.now() + windowMs };
    
    // Reset counter if time window has expired
    if (Date.now() > record.resetTime) {
      record.count = 0;
      record.resetTime = Date.now() + windowMs;
    }
    
    // Increment request count
    record.count += 1;
    
    // Update cache
    requestCache.set(key, record);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
    
    // If limit exceeded, send 429 response
    if (record.count > maxRequests) {
      logger.warn(`Rate limit exceeded for ${ip} on ${req.path}`);
      
      return res.status(429).json({
        success: false,
        error: {
          message,
          retryAfter: Math.ceil((record.resetTime - Date.now()) / 1000)
        }
      });
    }
    
    next();
  };
};

/**
 * Specific rate limiters for different API endpoints
 */
const limiter = {
  // Default API rate limiter (30 requests per minute)
  default: rateLimiter({
    maxRequests: 30,
    windowMs: 60000,
    message: 'Too many requests, please try again later'
  }),
  
  // Stricter rate limiter for OpenAI endpoints (10 requests per minute)
  openai: rateLimiter({
    maxRequests: 10,
    windowMs: 60000,
    message: 'Too many AI requests, please try again later'
  }),
  
  // More permissive rate limiter for static content (100 requests per minute)
  static: rateLimiter({
    maxRequests: 100,
    windowMs: 60000,
    message: 'Too many requests, please try again later'
  })
};

module.exports = limiter;