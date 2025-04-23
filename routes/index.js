/**
 * API Routes
 * 
 * This is the main router file that brings together all route modules
 * and applies middleware to them as needed.
 */

const express = require('express');
const router = express.Router();

// Middleware
const { apiLimiter } = require('../middlewares/rateLimiter');
const requestLogger = require('../middlewares/requestLogger');
const { errorHandler, notFoundHandler } = require('../middlewares/errorHandler');

// Route modules
const openaiRoutes = require('./openaiRoutes');
const databaseRoutes = require('./databaseRoutes');
const contactRoutes = require('./contactRoutes');

// Apply global middleware to all routes
router.use(requestLogger);

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * @route   GET /api/version
 * @desc    Get API version info
 * @access  Public
 */
router.get('/version', (req, res) => {
  res.status(200).json({
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Mount route modules
router.use('/openai', openaiRoutes);
router.use('/database', databaseRoutes);
router.use('/contact', contactRoutes);

// Apply rate limiting to all API routes
// Note: Some individual routes may have stricter rate limits
router.use(apiLimiter);

// Apply 404 handler for unmatched routes
router.use(notFoundHandler);

// Apply error handler (must be the last middleware)
router.use(errorHandler);

module.exports = router;