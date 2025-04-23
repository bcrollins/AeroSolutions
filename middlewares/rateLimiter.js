/**
 * Rate Limiter Middleware
 * 
 * This middleware provides rate limiting for API endpoints to
 * prevent abuse and ensure fair usage.
 */

const { rateLimit } = require('express-rate-limit');
const logger = require('../config/logger');
const { createError } = require('./errorHandler');

// Helper to format remaining time for error messages
function formatTimeLeft(remainingTime) {
  const seconds = Math.ceil(remainingTime / 1000);
  
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

// Customize the rate limit exceeded message
function createLimiterError(req, res, options) {
  // Get the retry-after value in seconds
  const retryAfter = Math.ceil(options.resetTime.getTime() - Date.now()) / 1000;
  
  // Set the retry-after header
  res.setHeader('Retry-After', String(retryAfter));
  
  // Standardize the error in our application format
  const error = createError(
    `Too many requests, please try again after ${formatTimeLeft(options.resetTime.getTime() - Date.now())}`,
    429,
    'RATE_LIMIT_EXCEEDED',
    { limit: options.limit, windowMs: options.windowMs }
  );
  
  // Log the rate limit error
  logger.warn('Rate limit exceeded', {
    path: req.path,
    ip: logger.anonymize(req.ip),
    limit: options.limit,
    windowMs: options.windowMs
  });
  
  // Return the standardized error response
  return res.status(429).json({
    success: false,
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      retryAfter
    }
  });
}

// General API rate limiter (less strict)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,     // 15 minute window
  max: 100,                      // 100 requests per window
  standardHeaders: true,         // Return rate limit info in the 'RateLimit-*' headers
  legacyHeaders: false,          // Disable the 'X-RateLimit-*' headers
  handler: createLimiterError,
  skip: (req, res) => {
    // Skip rate limiting for health checks and status endpoints
    return req.path === '/health' || req.path === '/status';
  }
});

// Stricter rate limiter for expensive OpenAI operations
const openaiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,       // 5 minute window
  max: 10,                        // 10 requests per window
  standardHeaders: true,          // Return rate limit info in the 'RateLimit-*' headers
  legacyHeaders: false,           // Disable the 'X-RateLimit-*' headers
  handler: createLimiterError
});

// Contact form rate limiter (to prevent spam)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,       // 1 hour window
  max: 5,                          // 5 form submissions per hour
  standardHeaders: true,           // Return rate limit info in the 'RateLimit-*' headers
  legacyHeaders: false,            // Disable the 'X-RateLimit-*' headers
  handler: createLimiterError
});

module.exports = {
  apiLimiter,
  openaiLimiter,
  contactLimiter
};