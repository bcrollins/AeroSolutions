/**
 * Rate Limiter Middleware
 * 
 * This module provides middleware for limiting request rates
 * to prevent abuse and manage API usage.
 */

const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

// Helper function to create customized limiters
const createLimiter = (options) => {
  const {
    windowMs = 60 * 1000, // 1 minute default
    maxRequests = 10,     // 10 requests per minute default
    message = 'Too many requests, please try again later',
    standardHeaders = true,
    legacyHeaders = false,
    path = '*'
  } = options;
  
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: {
      success: false,
      error: {
        message,
        code: 'RATE_LIMIT_EXCEEDED',
        status: 429
      }
    },
    standardHeaders,
    legacyHeaders,
    keyGenerator: (req) => {
      // Use IP address as default rate limit key
      return req.ip || req.connection.remoteAddress;
    },
    handler: (req, res, _next, options) => {
      // Log rate limit hit
      logger.warn(`Rate limit exceeded for ${req.method} ${req.originalUrl}`, {
        ip: logger.anonymize(req.ip || req.connection.remoteAddress),
        path: req.originalUrl,
        limit: maxRequests,
        windowMs
      });
      
      // Send rate limit error response
      res.status(429).json(options.message);
    },
    skip: (req, _res) => {
      // Example: Could skip rate limiting for certain paths or authenticated users
      // Example: return req.path.startsWith('/public') || req.user?.admin;
      return false; // Apply rate limiting to all requests by default
    }
  });
};

// General API rate limiter (20 requests per minute)
const generalLimiter = createLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
  message: 'Too many API requests, please try again in a minute'
});

// More restricted limiter for expensive AI API calls (5 per minute)
// Note: openaiLimiter kept for backward compatibility, but all routes now use xAI
const openaiLimiter = createLimiter({
  windowMs: 60 * 1000,
  maxRequests: 5,
  message: 'AI API rate limit exceeded. Please try again in a minute.'
});

// XAI API rate limiter (5 per minute)
const xaiLimiter = createLimiter({
  windowMs: 60 * 1000,
  maxRequests: 5,
  message: 'XAI API rate limit exceeded. Please try again in a minute.'
});

// Very restrictive limiter for auth endpoints to prevent brute force attempts
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts
  message: 'Too many login attempts, please try again after 15 minutes'
});

module.exports = {
  createLimiter,
  generalLimiter,
  openaiLimiter,
  xaiLimiter,
  authLimiter
};