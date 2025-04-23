/**
 * Rate Limiter Middleware
 * 
 * This middleware implements rate limiting for API endpoints to prevent
 * abuse and ensure fair usage of resources.
 */

const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

// Customize rate limit exceeded message
const rateLimitExceededMessage = {
  success: false,
  error: {
    message: 'Too many requests from this IP, please try again after some time',
    code: 'RATE_LIMIT_EXCEEDED'
  }
};

// Helper function to log rate limit hits
const logRateLimitHit = (req, res, options) => {
  logger.warn('Rate limit exceeded', {
    ip: logger.anonymize(req.ip),
    path: req.originalUrl || req.url,
    limit: options.max,
    windowMs: options.windowMs
  });
};

/**
 * General API rate limiter - less strict
 * Allows 50 requests per minute per IP
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // 50 requests per minute
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: rateLimitExceededMessage,
  handler: (req, res, next, options) => {
    logRateLimitHit(req, res, options);
    res.status(options.statusCode).json(options.message);
  }
});

/**
 * OpenAI endpoints rate limiter - more strict due to cost
 * Allows 10 requests per minute per IP
 */
const openaiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitExceededMessage,
  handler: (req, res, next, options) => {
    logRateLimitHit(req, res, options);
    res.status(options.statusCode).json(options.message);
  }
});

/**
 * Contact form rate limiter - prevents spam
 * Allows 5 submissions per hour per IP
 */
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitExceededMessage,
  handler: (req, res, next, options) => {
    logRateLimitHit(req, res, options);
    res.status(options.statusCode).json(options.message);
  }
});

module.exports = {
  apiLimiter,
  openaiLimiter,
  contactLimiter
};