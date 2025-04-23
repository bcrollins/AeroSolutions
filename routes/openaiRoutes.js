/**
 * OpenAI Routes
 * 
 * API routes for OpenAI-related functionality
 */

const express = require('express');
const router = express.Router();
const openaiController = require('../controllers/openaiController');
const limiter = require('../middlewares/rateLimiter');

/**
 * @route   POST /api/openai/text
 * @desc    Generate text using OpenAI
 * @access  Public
 */
router.post(
  '/text',
  limiter.openai,
  openaiController.textGenerationRules,
  openaiController.generateText
);

/**
 * @route   POST /api/openai/json
 * @desc    Generate JSON using OpenAI
 * @access  Public
 */
router.post(
  '/json',
  limiter.openai,
  openaiController.jsonGenerationRules,
  openaiController.generateJSON
);

/**
 * @route   POST /api/openai/image/analyze
 * @desc    Analyze an image using OpenAI
 * @access  Public
 */
router.post(
  '/image/analyze',
  limiter.openai,
  openaiController.imageAnalysisRules,
  openaiController.analyzeImage
);

/**
 * @route   GET /api/openai/test
 * @desc    Test OpenAI API connection
 * @access  Public
 */
router.get(
  '/test',
  limiter.default,
  openaiController.testConnection
);

module.exports = router;