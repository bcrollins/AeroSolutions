/**
 * API Routes Index
 * 
 * This file acts as a central point for registering all API routes.
 */

const express = require('express');
const router = express.Router();

// Import route modules
const openaiRoutes = require('./openaiRoutes');
const contactRoutes = require('./contactRoutes');

// Import middleware
const { apiLimiter } = require('../middlewares/rateLimiter');

// Apply global middleware to all API routes
router.use(apiLimiter);

// Register routes with their base paths
router.use('/openai', openaiRoutes);
router.use('/contact', contactRoutes);

/**
 * @route   GET /api
 * @desc    API Status
 * @access  Public
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "API is running",
 *   "data": {
 *     "version": "1.0.0",
 *     "timestamp": "2025-04-23T12:34:56.789Z"
 *   }
 * }
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    data: {
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;