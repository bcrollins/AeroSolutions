/**
 * OpenAI API Routes
 * 
 * This module defines routes for interacting with the OpenAI API.
 * Routes include text generation, JSON generation, image analysis, and connection testing.
 */

const express = require('express');
const router = express.Router();
const openaiController = require('../controllers/openaiController');
const { validateOpenAITextRequest, validateOpenAIImageRequest } = require('../middlewares/validator');
const { openaiLimiter } = require('../middlewares/rateLimiter');

/**
 * @route   POST /api/openai/text
 * @desc    Generate text using OpenAI
 * @access  Public (rate limited)
 * 
 * Request body:
 * {
 *   "prompt": "Your text prompt here",
 *   "model": "gpt-4o" (optional, default: "gpt-4o"),
 *   "max_tokens": 1000 (optional, default: 1000),
 *   "temperature": 0.7 (optional, default: 0.7)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "text": "Generated text response",
 *     "model": "gpt-4o",
 *     "usage": {
 *       "prompt_tokens": 10,
 *       "completion_tokens": 20,
 *       "total_tokens": 30
 *     }
 *   }
 * }
 */
router.post('/text', openaiLimiter, validateOpenAITextRequest, openaiController.generateText);

/**
 * @route   POST /api/openai/json
 * @desc    Generate structured JSON data using OpenAI
 * @access  Public (rate limited)
 * 
 * Request body:
 * {
 *   "prompt": "Generate JSON for...",
 *   "model": "gpt-4o" (optional, default: "gpt-4o"),
 *   "max_tokens": 1000 (optional, default: 1000),
 *   "temperature": 0.7 (optional, default: 0.7)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "json": { ... parsed JSON object ... },
 *     "model": "gpt-4o",
 *     "usage": {
 *       "prompt_tokens": 15,
 *       "completion_tokens": 25,
 *       "total_tokens": 40
 *     }
 *   }
 * }
 */
router.post('/json', openaiLimiter, validateOpenAITextRequest, openaiController.generateJSON);

/**
 * @route   POST /api/openai/image-analysis
 * @desc    Analyze an image using OpenAI Vision
 * @access  Public (rate limited)
 * 
 * Request body:
 * {
 *   "imageUrl": "https://example.com/image.jpg",
 *   "prompt": "Analyze this image" (optional),
 *   "model": "gpt-4o" (optional, default: "gpt-4o")
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "analysis": "Detailed analysis of the image...",
 *     "model": "gpt-4o"
 *   }
 * }
 */
router.post('/image-analysis', openaiLimiter, validateOpenAIImageRequest, openaiController.analyzeImage);

/**
 * @route   GET /api/openai/test
 * @desc    Test OpenAI API connection
 * @access  Public
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "OpenAI API connection test successful",
 *   "data": {
 *     "response": "API connection successful",
 *     "model": "gpt-3.5-turbo"
 *   }
 * }
 */
router.get('/test', openaiController.testConnection);

module.exports = router;