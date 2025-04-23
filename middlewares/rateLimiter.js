/**
 * Rate Limiter Middleware
 * 
 * API rate limiting middleware to prevent abuse
 */

const NodeCache = require('node-cache');
const logger = require('../config/logger');

// In-memory cache for rate limiting
const rateCache = new NodeCache({
  stdTTL: 60, // Default time-to-live in seconds
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false // Don't clone data to improve performance
});

/**
 * Create a rate limiter middleware
 * @param {number} maxRequests - Maximum requests allowed in the window
 * @param {number} windowMs - Time window in milliseconds
 * @param {string} limitType - Type of rate limit for identification
 * @returns {Function} - Express middleware
 */
function createRateLimiter(maxRequests, windowMs, limitType) {
  return (req, res, next) => {
    // Get client IP or custom identifier (e.g. API key)
    const identifier = req.headers['x-api-key'] || 
                       req.headers['x-forwarded-for'] || 
                       req.ip || 
                       'unknown';
    
    // Create a unique key for this rate limit type and client
    const key = `${limitType}:${identifier}`;
    
    // Get current request count
    let requestCount = rateCache.get(key) || { count: 0, resetTime: Date.now() + windowMs };
    
    // Check if window has expired and reset if needed
    if (Date.now() > requestCount.resetTime) {
      requestCount = { count: 0, resetTime: Date.now() + windowMs };
    }
    
    // Increment request count
    requestCount.count += 1;
    
    // Set remaining requests and reset time headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - requestCount.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(requestCount.resetTime / 1000)); // in seconds
    
    // Update cache
    rateCache.set(key, requestCount);
    
    // Check if rate limit exceeded
    if (requestCount.count > maxRequests) {
      // Calculate retry after time
      const retryAfterSeconds = Math.ceil((requestCount.resetTime - Date.now()) / 1000);
      
      // Set retry headers
      res.setHeader('Retry-After', retryAfterSeconds);
      
      // Log rate limit hit
      logger.warn(`Rate limit exceeded for ${limitType}`, {
        ip: identifier,
        path: req.originalUrl,
        method: req.method,
        rateLimit: {
          type: limitType,
          max: maxRequests,
          current: requestCount.count,
          resetTime: new Date(requestCount.resetTime).toISOString()
        }
      });
      
      // Return rate limit error
      return res.status(429).json({
        success: false,
        error: {
          message: 'Too many requests, please try again later',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: retryAfterSeconds
        }
      });
    }
    
    // Continue if within rate limit
    next();
  };
}

// Export rate limiters for different endpoints
module.exports = {
  // Standard rate limiter for general API endpoints
  standard: createRateLimiter(60, 60 * 1000, 'standard'), // 60 requests per minute
  
  // More restrictive rate limiter for expensive operations
  api: createRateLimiter(30, 60 * 1000, 'api'), // 30 requests per minute
  
  // Highly restrictive rate limiter for OpenAI APIs
  openai: createRateLimiter(10, 60 * 1000, 'openai'), // 10 requests per minute
  
  // Custom rate limiter factory for specific needs
  create: createRateLimiter
};