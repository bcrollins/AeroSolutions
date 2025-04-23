/**
 * OpenAI Routes
 * 
 * This module defines routes for OpenAI API integrations.
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
 * @route   GET /api/openai/status
 * @desc    Check OpenAI API status
 * @access  Public
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "OpenAI API is operational",
 *   "data": {
 *     "status": "available",
 *     "timestamp": "2025-04-23T12:34:56.789Z"
 *   }
 * }
 */
router.get('/status', openaiController.checkStatus);

/**
 * @route   POST /api/openai/completion
 * @desc    Get completion from OpenAI
 * @access  Public (rate limited)
 * 
 * Request body:
 * {
 *   "prompt": "Explain how AI works",
 *   "model": "gpt-4o",                      (optional, default: "gpt-4o")
 *   "maxTokens": 1024,                      (optional, default: 1024)
 *   "temperature": 0.7                      (optional, default: 0.7)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "text": "AI, or artificial intelligence...",
 *     "model": "gpt-4o",
 *     "usage": { "prompt_tokens": 10, "completion_tokens": 100, "total_tokens": 110 }
 *   }
 * }
 */
router.post('/completion', 
  openaiLimiter,
  validateCompletionRequest,
  openaiController.getCompletion
);

/**
 * @route   POST /api/openai/chat
 * @desc    Get chat completion from OpenAI
 * @access  Public (rate limited)
 * 
 * Request body:
 * {
 *   "messages": [
 *     {"role": "system", "content": "You are a helpful assistant"},
 *     {"role": "user", "content": "How does AI work?"}
 *   ],
 *   "model": "gpt-4o",                      (optional, default: "gpt-4o")
 *   "maxTokens": 1024,                      (optional, default: 1024)
 *   "temperature": 0.7,                     (optional, default: 0.7)
 *   "responseFormat": "json_object"         (optional, default: null)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "message": {
 *       "role": "assistant",
 *       "content": "AI works by processing large amounts of data..."
 *     },
 *     "model": "gpt-4o",
 *     "usage": { "prompt_tokens": 25, "completion_tokens": 120, "total_tokens": 145 }
 *   }
 * }
 */
router.post('/chat', 
  openaiLimiter,
  validateChatRequest,
  openaiController.getChatCompletion
);

/**
 * @route   POST /api/openai/image
 * @desc    Generate image using OpenAI's DALL-E
 * @access  Public (rate limited)
 * 
 * Request body:
 * {
 *   "prompt": "A futuristic city with flying cars",
 *   "n": 1,                                 (optional, default: 1)
 *   "size": "1024x1024",                    (optional, default: "1024x1024")
 *   "quality": "standard",                  (optional, default: "standard")
 *   "responseFormat": "url"                 (optional, default: "url")
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "url": "https://oaidalleapiprodscus.blob.core.windows.net/..."
 *     }
 *   ]
 * }
 */
router.post('/image', 
  openaiLimiter,
  validateImageRequest,
  openaiController.generateImage
);

module.exports = router;