/**
 * Rate Limiter Middleware
 * 
 * Middleware for limiting request rates to prevent abuse
 */

const rateLimit = require('express-rate-limit');
const { redisClient } = require('../utils/redis');

/**
 * Create a rate limiter middleware
 * 
 * If Redis is available, uses Redis store for distributed rate limiting
 * Otherwise, falls back to memory store
 * 
 * @param {Object} options - Rate limiter options
 * @return {Function} - Express middleware
 */
const rateLimiter = (options) => {
  // Default options
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
      success: false,
      message: 'Too many requests, please try again later'
    }
  };
  
  // Merge default options with provided options
  const limiterOptions = {
    ...defaultOptions,
    ...options
  };
  
  // Try to use Redis store if available, otherwise use memory store
  if (redisClient && redisClient.isReady) {
    try {
      const RedisStore = require('rate-limit-redis');
      
      limiterOptions.store = new RedisStore({
        client: redisClient,
        prefix: 'rate-limit:'
      });
      
      console.log('Using Redis store for rate limiting');
    } catch (error) {
      console.warn('Failed to use Redis store for rate limiting, falling back to memory store', error);
    }
  } else {
    console.log('Using memory store for rate limiting');
  }
  
  return rateLimit(limiterOptions);
};

module.exports = rateLimiter;