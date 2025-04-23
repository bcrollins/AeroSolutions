/**
 * Rate Limiter Middleware
 * 
 * Handles rate limiting for various API endpoints
 */

const rateLimit = require('express-rate-limit');

// Common settings
const standardSettings = {
  standardWindow: 15 * 60 * 1000, // 15 minutes window (in milliseconds)
  standardMax: 100, // 100 requests per window
  message: 'Too many requests, please try again later.'
};

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: standardSettings.standardWindow,
  max: standardSettings.standardMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: standardSettings.message
  }
});

// Authentication rate limiter (more restrictive to prevent brute force)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // 10 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

// OpenAI API rate limiter (to avoid excessive token usage)
const openaiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 50, // 50 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'OpenAI request limit reached, please try again later.'
  }
});

// Special admin-only endpoints rate limiter
const adminLimiter = rateLimit({
  windowMs: standardSettings.standardWindow,
  max: 200, // Higher limit for admin operations
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: standardSettings.message
  }
});

module.exports = {
  api: apiLimiter,
  auth: authLimiter,
  openai: openaiLimiter,
  admin: adminLimiter
};