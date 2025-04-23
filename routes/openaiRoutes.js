/**
 * OpenAI Routes
 * 
 * This module defines routes for OpenAI API operations
 * including text completions, chat, and image generation.
 */

const express = require('express');
const router = express.Router();

// Controller
const openaiController = require('../controllers/openaiController');

// Middleware
const { openaiLimiter } = require('../middlewares/rateLimiter');
const { 
  validateCompletionRequest,
  validateChatRequest,
  validateImageRequest
} = require('../middlewares/validator');

/**
 * @route   POST /api/openai/completion
 * @desc    Generate text completion
 * @access  Public (rate limited)
 * 
 * Request body:
 * {
 *   "prompt": "Complete this sentence: The quick brown fox",
 *   "model": "gpt-4o",              (optional, defaults to gpt-4o)
 *   "maxTokens": 100,               (optional, defaults to 1024)
 *   "temperature": 0.7              (optional, defaults to 0.7)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "completion": "jumps over the lazy dog.",
 *     "usage": {
 *       "promptTokens": 10,
 *       "completionTokens": 6, 
 *       "totalTokens": 16
 *     }
 *   }
 * }
 */
router.post('/completion',
  openaiLimiter,
  validateCompletionRequest,
  openaiController.generateCompletion
);

/**
 * @route   POST /api/openai/chat
 * @desc    Generate chat completion
 * @access  Public (rate limited)
 * 
 * Request body:
 * {
 *   "messages": [
 *     { "role": "system", "content": "You are a helpful assistant." },
 *     { "role": "user", "content": "What is the capital of France?" }
 *   ],
 *   "model": "gpt-4o",             (optional, defaults to gpt-4o)
 *   "maxTokens": 100,              (optional, defaults to 1024)
 *   "temperature": 0.7,            (optional, defaults to 0.7)
 *   "responseFormat": "json_object" (optional, sets response format type)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "message": {
 *       "role": "assistant",
 *       "content": "The capital of France is Paris."
 *     },
 *     "usage": {
 *       "promptTokens": 23,
 *       "completionTokens": 7,
 *       "totalTokens": 30
 *     }
 *   }
 * }
 */
router.post('/chat',
  openaiLimiter,
  validateChatRequest,
  openaiController.generateChatCompletion
);

/**
 * @route   POST /api/openai/image
 * @desc    Generate image
 * @access  Public (rate limited)
 * 
 * Request body:
 * {
 *   "prompt": "A beautiful sunset over a mountain landscape",
 *   "n": 1,                       (optional, number of images, defaults to 1)
 *   "size": "1024x1024",          (optional, defaults to 1024x1024)
 *   "quality": "standard",        (optional, "standard" or "hd", defaults to standard)
 *   "responseFormat": "url"       (optional, "url" or "b64_json", defaults to url)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "images": [
 *       {
 *         "url": "https://...",
 *         "revisedPrompt": "A beautiful sunset with golden rays illuminating a majestic mountain landscape..."
 *       }
 *     ]
 *   }
 * }
 */
router.post('/image',
  openaiLimiter,
  validateImageRequest,
  openaiController.generateImage
);

module.exports = router;