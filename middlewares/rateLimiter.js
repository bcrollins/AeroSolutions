/**
 * Rate Limiting Middleware
 * 
 * Provides different rate limiters for API endpoints based on 
 * their resource intensity or potential for abuse.
 */

const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');
const { createError } = require('./errorHandler');

/**
 * Handle rate limit exceeded
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function handleRateLimitExceeded(req, res, next) {
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.id
  });
  
  next(createError(
    'Too many requests, please try again later',
    429,
    'RATE_LIMIT_EXCEEDED',
    { retryAfter: res.getHeader('Retry-After') || 60 }
  ));
}

// Standard API rate limiter (general purpose API endpoints)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: handleRateLimitExceeded,
  keyGenerator: (req) => req.ip // Use IP address as key
});

// Contact form rate limiter (prevent form spam)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 submissions per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: handleRateLimitExceeded,
  keyGenerator: (req) => req.ip
});

// Stricter rate limiter for OpenAI API routes (prevent abuse and high costs)
const openaiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // Limit each IP to 30 requests per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: handleRateLimitExceeded,
  keyGenerator: (req) => req.ip
});

// Login/Auth limiter to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: handleRateLimitExceeded,
  keyGenerator: (req) => req.ip
});

module.exports = {
  apiLimiter,
  contactLimiter,
  openaiLimiter,
  authLimiter
};