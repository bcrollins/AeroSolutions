/**
 * OpenAI Routes
 * 
 * This module defines routes for interacting with the OpenAI API.
 * It includes routes for text completions, chat completions, and image generation.
 */

const express = require('express');
const router = express.Router();

// Import controller methods
const {
  handleCompletion,
  handleChatCompletion,
  handleImageGeneration
} = require('../controllers/openaiController');

// Import middleware
const { 
  validateCompletionRequest, 
  validateChatRequest, 
  validateImageRequest 
} = require('../middlewares/validator');
const { openaiLimiter } = require('../middlewares/rateLimiter');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @route   POST /api/openai/completions
 * @desc    Generate text completions from a prompt
 * @access  Public (with rate limiting)
 */
router.post('/completions', 
  openaiLimiter,
  validateCompletionRequest,
  asyncHandler(handleCompletion)
);

/**
 * @route   POST /api/openai/chat
 * @desc    Generate chat completions from a message array
 * @access  Public (with rate limiting)
 */
router.post('/chat', 
  openaiLimiter,
  validateChatRequest,
  asyncHandler(handleChatCompletion)
);

/**
 * @route   POST /api/openai/images
 * @desc    Generate images from a text prompt
 * @access  Public (with rate limiting)
 */
router.post('/images', 
  openaiLimiter,
  validateImageRequest,
  asyncHandler(handleImageGeneration)
);

// Health check for OpenAI API connection
router.get('/status', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        success: false,
        error: {
          message: 'OpenAI API key not configured',
          code: 'OPENAI_API_KEY_MISSING',
          status: 503
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        status: 'available',
        message: 'OpenAI API connection configured'
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to check OpenAI API status',
        code: 'OPENAI_API_ERROR',
        status: 500
      }
    });
  }
});

module.exports = router;