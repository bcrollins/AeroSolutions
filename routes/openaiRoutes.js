/**
 * OpenAI API Routes
 * 
 * Handles routing for OpenAI API endpoints
 */
const express = require('express');
const { 
  generateText, 
  generateJSON, 
  analyzeImage, 
  testConnection 
} = require('../controllers/openaiController');
const { openaiLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

/**
 * @route POST /api/openai/text
 * @desc Generate text using OpenAI API
 * @access Public (but can be restricted via middleware)
 */
router.post('/text', openaiLimiter, generateText);

/**
 * @route POST /api/openai/json
 * @desc Generate JSON using OpenAI API
 * @access Public (but can be restricted via middleware)
 */
router.post('/json', openaiLimiter, generateJSON);

/**
 * @route POST /api/openai/analyze-image
 * @desc Analyze image using OpenAI Vision API
 * @access Public (but can be restricted via middleware)
 */
router.post('/analyze-image', openaiLimiter, analyzeImage);

/**
 * @route GET /api/openai/test
 * @desc Test OpenAI API connection
 * @access Public
 */
router.get('/test', testConnection);

module.exports = router;