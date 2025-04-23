/**
 * OpenAI API Routes
 * 
 * This module defines routes for interacting with the OpenAI API.
 */

const express = require('express');
const router = express.Router();

// Import controller methods
const {
  generateCompletion,
  generateChatCompletion,
  generateImage,
  checkApiKey
} = require('../controllers/openaiController');

// Import middleware
const {
  validateCompletionRequest,
  validateChatRequest,
  validateImageRequest
} = require('../middlewares/validator');

const { openaiLimiter } = require('../middlewares/rateLimiter');

/**
 * @route   POST /api/openai/completion
 * @desc    Generate a text completion using OpenAI
 * @access  Public (with rate limiting)
 */
router.post('/completion', openaiLimiter, validateCompletionRequest, generateCompletion);

/**
 * @route   POST /api/openai/chat
 * @desc    Generate a chat completion using OpenAI
 * @access  Public (with rate limiting)
 */
router.post('/chat', openaiLimiter, validateChatRequest, generateChatCompletion);

/**
 * @route   POST /api/openai/image
 * @desc    Generate an image using OpenAI DALL-E
 * @access  Public (with rate limiting)
 */
router.post('/image', openaiLimiter, validateImageRequest, generateImage);

/**
 * @route   GET /api/openai/status
 * @desc    Check if the OpenAI API key is valid
 * @access  Public
 */
router.get('/status', checkApiKey);

module.exports = router;