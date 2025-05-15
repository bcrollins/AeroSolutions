/**
 * XAI Routes
 * 
 * This module defines routes for interacting with the XAI (SAI) API.
 * It includes routes for text completions, chat completions, image generation, and vision analysis.
 */

const express = require('express');
const router = express.Router();

// Import controller methods
const {
  handleCompletion,
  handleChatCompletion,
  handleImageGeneration,
  handleImageAnalysis
} = require('../controllers/xaiController');

// Import middleware
const { 
  validateCompletionRequest, 
  validateChatRequest, 
  validateImageRequest,
  validateVisionRequest
} = require('../middlewares/validator');
const { xaiLimiter } = require('../middlewares/rateLimiter');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @route   POST /api/xai/completions
 * @desc    Generate text completions from a prompt
 * @access  Public (with rate limiting)
 */
router.post('/completions', 
  xaiLimiter,
  validateCompletionRequest,
  asyncHandler(handleCompletion)
);

/**
 * @route   POST /api/xai/chat
 * @desc    Generate chat completions from a message array
 * @access  Public (with rate limiting)
 */
router.post('/chat', 
  xaiLimiter,
  validateChatRequest,
  asyncHandler(handleChatCompletion)
);

/**
 * @route   POST /api/xai/images
 * @desc    Generate images from a text prompt
 * @access  Public (with rate limiting)
 */
router.post('/images', 
  xaiLimiter,
  validateImageRequest,
  asyncHandler(handleImageGeneration)
);

/**
 * @route   POST /api/xai/vision
 * @desc    Analyze images using vision models
 * @access  Public (with rate limiting)
 */
router.post('/vision', 
  xaiLimiter,
  validateVisionRequest,
  asyncHandler(handleImageAnalysis)
);

// Health check for XAI API connection
router.get('/status', async (req, res) => {
  try {
    if (!process.env.XAI_API_KEY) {
      return res.status(503).json({
        success: false,
        error: {
          message: 'XAI API key not configured',
          code: 'XAI_API_KEY_MISSING',
          status: 503
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        status: 'available',
        message: 'XAI API connection configured'
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to check XAI API status',
        code: 'XAI_API_ERROR',
        status: 500
      }
    });
  }
});

module.exports = router;