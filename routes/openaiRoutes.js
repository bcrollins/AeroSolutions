/**
 * OpenAI Routes
 * 
 * Routes for OpenAI-related functionality
 */
const express = require('express');
const router = express.Router();
const openaiController = require('../controllers/openaiController');
const { check, validationResult } = require('express-validator');
const logger = require('../config/logger');

/**
 * Middleware to validate API requests
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error('Validation error in OpenAI request', { errors: errors.array() });
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

/**
 * @route   POST /api/openai/text
 * @desc    Generate text using OpenAI
 * @access  Private
 */
router.post('/text', [
  check('prompt', 'Prompt is required').notEmpty(),
  check('model').optional(),
  check('max_tokens').optional().isInt({ min: 1, max: 4000 }),
  check('temperature').optional().isFloat({ min: 0, max: 1 }),
], validateRequest, openaiController.generateText);

/**
 * @route   POST /api/openai/json
 * @desc    Generate JSON using OpenAI
 * @access  Private
 */
router.post('/json', [
  check('prompt', 'Prompt is required').notEmpty(),
  check('model').optional(),
  check('max_tokens').optional().isInt({ min: 1, max: 4000 }),
  check('temperature').optional().isFloat({ min: 0, max: 1 }),
  check('schema').optional()
], validateRequest, openaiController.generateJSON);

/**
 * @route   POST /api/openai/analyze-image
 * @desc    Analyze image using OpenAI
 * @access  Private
 */
router.post('/analyze-image', [
  check('image_url', 'Image URL is required').notEmpty().isURL(),
  check('prompt').optional(),
  check('model').optional()
], validateRequest, openaiController.analyzeImage);

/**
 * @route   GET /api/openai/test
 * @desc    Test OpenAI API connection
 * @access  Private (Admin)
 */
router.get('/test', openaiController.testConnection);

module.exports = router;