/**
 * Rate Limiting Middleware
 * 
 * This middleware implements rate limiting for API endpoints to 
 * prevent abuse and ensure fair usage of resources.
 */

const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

// Custom handler for rate limit exceeded
const limitExceededHandler = (req, res, next, options) => {
  const message = `Rate limit exceeded: ${options.message || 'Too many requests'}`;
  
  logger.warn(message, {
    ip: req.ip,
    endpoint: req.originalUrl,
    method: req.method,
    limit: options.max,
    windowMs: options.windowMs
  });
  
  res.status(options.statusCode).json({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: options.message || 'Too many requests, please try again later.',
      type: 'rate_limit',
      details: {
        retryAfter: Math.ceil(options.windowMs / 1000),
        limit: options.max,
        windowMs: options.windowMs
      }
    }
  });
};

// Default rate limiter for standard API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  handler: limitExceededHandler,
  keyGenerator: (req) => req.ip, // Use IP address as the key
  skip: (req, res) => {
    // Skip rate limiting for certain endpoints or conditions if needed
    return false;
  },
  onLimitReached: (req, res, options) => {
    logger.warn('API rate limit reached', {
      ip: req.ip,
      endpoint: req.originalUrl,
      method: req.method
    });
  }
});

// More restrictive rate limiter for OpenAI API endpoints
const openaiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 requests per windowMs
  message: 'Too many OpenAI API requests from this IP, please try again after 1 hour',
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitExceededHandler,
  keyGenerator: (req) => req.ip,
  skip: (req, res) => {
    // Skip for status endpoint
    if (req.path === '/status' && req.method === 'GET') {
      return true;
    }
    return false;
  },
  onLimitReached: (req, res, options) => {
    logger.warn('OpenAI API rate limit reached', {
      ip: req.ip,
      endpoint: req.originalUrl,
      method: req.method
    });
  }
});

// Strict rate limiter for auth-related endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per windowMs
  message: 'Too many authentication attempts from this IP, please try again after 1 hour',
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitExceededHandler,
  keyGenerator: (req) => req.ip,
  onLimitReached: (req, res, options) => {
    logger.warn('Auth rate limit reached', {
      ip: req.ip,
      endpoint: req.originalUrl,
      method: req.method
    });
  }
});

// Contact form submission limiter
const contactLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // 5 submissions per day
  message: 'Too many contact form submissions from this IP, please try again tomorrow',
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitExceededHandler,
  keyGenerator: (req) => req.ip,
  onLimitReached: (req, res, options) => {
    logger.warn('Contact form submission rate limit reached', {
      ip: req.ip,
      endpoint: req.originalUrl,
      method: req.method
    });
  }
});

module.exports = {
  apiLimiter,
  openaiLimiter,
  authLimiter,
  contactLimiter
};