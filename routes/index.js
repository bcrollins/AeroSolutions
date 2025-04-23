/**
 * API Routes Index
 * 
 * This module is the central point for all API routes.
 * It registers all route modules and applies common middleware.
 */

const express = require('express');
const router = express.Router();

// Import route modules
const contactRoutes = require('./contactRoutes');
const databaseRoutes = require('./databaseRoutes');
const openaiRoutes = require('./openaiRoutes');

// Import middleware
const { apiLimiter } = require('../middlewares/rateLimiter');
const requestLogger = require('../middlewares/requestLogger');

// Apply global middleware to all API routes
router.use(requestLogger);
router.use(apiLimiter);

// Mount route modules
router.use('/contact', contactRoutes);
router.use('/database', databaseRoutes);
router.use('/openai', openaiRoutes);

/**
 * @route   GET /api
 * @desc    API status check
 * @access  Public
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      version: '1.0.0',
      name: 'API Server',
      status: 'operational',
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;