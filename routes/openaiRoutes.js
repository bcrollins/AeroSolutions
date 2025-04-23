/**
 * OpenAI Routes
 * 
 * API routes for OpenAI-related functionality
 */

const express = require('express');
const { body } = require('express-validator');
const openaiController = require('../controllers/openaiController');
const router = express.Router();

// Middleware for rate limiting OpenAI API calls
const rateLimiter = require('../middlewares/rateLimiter');
const openaiRateLimit = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 50, // limit each IP to 50 requests per window
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  },
  keyGenerator: (req) => {
    // If authenticated, use user ID as key, otherwise use IP
    return req.user ? `user:${req.user.id}` : req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * POST /api/openai/text
 * Generate text using OpenAI
 */
router.post('/text', 
  openaiRateLimit,
  [
    body('prompt').notEmpty().withMessage('Prompt is required'),
    body('model').optional(),
    body('max_tokens').optional().isInt({ min: 1, max: 4000 }).withMessage('Max tokens must be between 1 and 4000'),
    body('temperature').optional().isFloat({ min: 0, max: 2 }).withMessage('Temperature must be between 0 and 2')
  ],
  openaiController.generateText
);

/**
 * POST /api/openai/json
 * Generate JSON using OpenAI
 */
router.post('/json', 
  openaiRateLimit,
  [
    body('prompt').notEmpty().withMessage('Prompt is required'),
    body('model').optional(),
    body('max_tokens').optional().isInt({ min: 1, max: 4000 }).withMessage('Max tokens must be between 1 and 4000'),
    body('temperature').optional().isFloat({ min: 0, max: 2 }).withMessage('Temperature must be between 0 and 2')
  ],
  openaiController.generateJSON
);

/**
 * POST /api/openai/image-analysis
 * Analyze an image using OpenAI Vision
 */
router.post('/image-analysis', 
  openaiRateLimit,
  [
    body('image').notEmpty().withMessage('Image data is required'),
    body('prompt').optional(),
    body('model').optional(),
    body('max_tokens').optional().isInt({ min: 1, max: 4000 }).withMessage('Max tokens must be between 1 and 4000')
  ],
  openaiController.analyzeImage
);

/**
 * GET /api/openai/test-connection
 * Test the OpenAI API connection
 */
router.get('/test-connection', openaiController.testConnection);

module.exports = router;