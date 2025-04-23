/**
 * Rate Limiter Middleware
 * 
 * This module provides rate limiting middleware to protect against abuse.
 * It uses in-memory storage for simplicity, but can be extended to use 
 * Redis or another distributed store for production.
 */

const { createError } = require('./errorHandler');
const NodeCache = require('node-cache');

// Cache for storing rate limit data
const rateCache = new NodeCache({ 
  stdTTL: 60, // Default expiry in seconds
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false
});

/**
 * Create a rate limiter middleware
 * @param {number} maxRequests - Maximum number of requests allowed in the time window
 * @param {number} windowMs - Time window in milliseconds
 * @param {string} limitType - Type of limit (for error messages)
 * @returns {Function} - Express middleware function
 */
function createRateLimiter(maxRequests, windowMs, limitType = 'standard') {
  const windowSec = Math.ceil(windowMs / 1000);
  
  return (req, res, next) => {
    // Get client IP
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Create unique key for this route and IP
    const key = `rate_limit:${limitType}:${req.originalUrl || req.url}:${ip}`;
    
    // Get current count from cache or initialize
    let rateLimitData = rateCache.get(key) || { count: 0, resetTime: Date.now() + windowMs };
    
    // Check if we need to reset the counter (time window expired)
    if (Date.now() > rateLimitData.resetTime) {
      rateLimitData = { count: 0, resetTime: Date.now() + windowMs };
    }
    
    // Increment the counter
    rateLimitData.count += 1;
    
    // Calculate remaining requests and reset time
    const remaining = Math.max(0, maxRequests - rateLimitData.count);
    const resetAt = new Date(rateLimitData.resetTime).toISOString();
    
    // Add rate limit info to response headers
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': remaining,
      'X-RateLimit-Reset': resetAt
    });
    
    // Update the cache
    rateCache.set(key, rateLimitData);
    
    // Check if rate limit is exceeded
    if (rateLimitData.count > maxRequests) {
      // Return rate limit error
      return next(createError(
        `Rate limit exceeded. Please try again in ${windowSec} seconds.`,
        429,
        'RATE_LIMIT_EXCEEDED',
        {
          limit: maxRequests,
          windowSec,
          resetAt
        }
      ));
    }
    
    // Proceed to next middleware
    next();
  };
}

// Different rate limiters for different types of requests
const standardLimiter = createRateLimiter(60, 60 * 1000, 'standard'); // 60 requests per minute
const strictLimiter = createRateLimiter(10, 60 * 1000, 'strict'); // 10 requests per minute
const openaiLimiter = createRateLimiter(20, 60 * 1000, 'openai'); // 20 requests per minute

module.exports = {
  createRateLimiter,
  standardLimiter,
  strictLimiter,
  openaiLimiter
};