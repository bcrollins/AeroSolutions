/**
 * Main Routes Index
 * 
 * This module combines all API routes and exports them 
 * for use in the main application.
 */

const express = require('express');
const router = express.Router();

// Import route modules
const openaiRoutes = require('./openaiRoutes');
const databaseRoutes = require('./databaseRoutes');

// Middleware
const validator = require('../middlewares/validator');
const { apiLimiter, contactLimiter } = require('../middlewares/rateLimiter');
const logger = require('../config/logger');

// Mount OpenAI routes
router.use('/openai', openaiRoutes);

// Mount Database routes 
router.use('/database', databaseRoutes);

/**
 * @route   GET /api/health
 * @desc    API health check endpoint
 * @access  Public
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "API is operational",
 *   "data": {
 *     "version": "1.0.0",
 *     "timestamp": "2025-04-23T12:34:56.789Z",
 *     "environment": "production"
 *   }
 * }
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is operational',
    data: {
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

/**
 * @route   POST /api/contact
 * @desc    Submit contact form
 * @access  Public (rate limited)
 * 
 * Request body:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "phone": "555-123-4567", (optional)
 *   "subject": "Business Inquiry",
 *   "message": "I'm interested in your services...",
 *   "companyName": "Acme Corp" (optional)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 123,
 *     "timestamp": "2025-04-23T12:34:56.789Z"
 *   },
 *   "message": "Contact form submitted successfully"
 * }
 */
router.post('/contact', 
  contactLimiter,
  validator.validateContactRequest,
  async (req, res, next) => {
    try {
      // Import controller here to avoid circular dependency
      const contactController = require('../controllers/contactController');
      await contactController.submitContact(req, res, next);
    } catch (error) {
      logger.error('Error in contact route', {
        error: error.message,
        stack: error.stack
      });
      next(error);
    }
  }
);

module.exports = router;