/**
 * Rate Limiting Middleware
 * 
 * This module provides rate limiting for API routes to protect 
 * against abuse, DoS attacks, and to ensure fair usage.
 */

const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');
const { createError } = require('./errorHandler');

// Helper function to create a standardized rate limiter
const createRateLimiter = (options) => {
  const {
    windowMs = 60 * 1000, // 1 minute by default
    max = 60,            // Request limit per window
    message = 'Too many requests, please try again later',
    standardHeaders = true,
    legacyHeaders = false,
    keyGenerator = (req) => req.ip, // Default key is IP address
    skip = () => false,            // Don't skip by default
    name = 'rate-limiter'          // Identifier for logging
  } = options;
  
  return rateLimit({
    windowMs,
    max,
    standardHeaders,
    legacyHeaders,
    keyGenerator,
    skip,
    handler: (req, res, next) => {
      logger.warn(`Rate limit exceeded for ${name}`, {
        ip: req.ip,
        path: req.path,
        method: req.method,
        userAgent: req.headers['user-agent']
      });
      
      const error = createError(
        message,
        429,
        'RATE_LIMIT_EXCEEDED',
        { retryAfter: Math.ceil(windowMs / 1000) }
      );
      
      res.status(429).json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      });
    }
  });
};

// General API rate limiter - applies to most API routes
const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000,    // 1 minute
  max: 60,                // 60 requests per minute
  message: 'Too many API requests, please try again later',
  name: 'api'
});

// Stricter rate limiter for OpenAI endpoints that consume tokens/credits
const openaiLimiter = createRateLimiter({
  windowMs: 60 * 1000,    // 1 minute
  max: 10,                // 10 requests per minute
  message: 'Too many OpenAI API requests, please try again later',
  name: 'openai'
});

// Strict rate limiter for authentication attempts to prevent brute force
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                   // 5 attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later',
  name: 'auth'
});

// Rate limiter for contact form submissions
const contactLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,                   // 3 submissions per hour
  message: 'Too many contact form submissions, please try again later',
  name: 'contact'
});

module.exports = {
  apiLimiter,
  openaiLimiter,
  authLimiter,
  contactLimiter,
  createRateLimiter
};