/**
 * Rate Limiter Middleware
 * 
 * Provides different rate limiting strategies for various API endpoints
 */

const rateLimit = require('express-rate-limit');

// General purpose rate limiter for most API routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});

// Stricter rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

// Rate limiter for OpenAI API routes (more expensive operations)
const openaiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 60, // limit each IP to 60 openai requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'OpenAI API rate limit exceeded. Please try again later.'
  }
});

// Rate limiter for admin routes
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 admin requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Admin API rate limit exceeded. Please try again later.'
  }
});

module.exports = {
  general: generalLimiter,
  auth: authLimiter,
  openai: openaiLimiter,
  admin: adminLimiter
};