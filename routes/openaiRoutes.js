/**
 * OpenAI Routes
 * 
 * This module defines routes for OpenAI API integration.
 */

const express = require('express');
const router = express.Router();

// Controller
const openaiController = require('../controllers/openaiController');

// Middleware
const { openaiLimiter } = require('../middlewares/rateLimiter');
const validator = require('../middlewares/validator');

/**
 * @route   POST /api/openai/completion
 * @desc    Get text completion from OpenAI
 * @access  Public (rate limited)
 * 
 * Request body:
 * {
 *   "prompt": "Complete this sentence: The quick brown fox",
 *   "model": "gpt-4o", (optional, default: "gpt-4o")
 *   "maxTokens": 100, (optional, default: 1024)
 *   "temperature": 0.7 (optional, default: 0.7)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "text": "jumps over the lazy dog.",
 *     "model": "gpt-4o",
 *     "usage": {
 *       "prompt_tokens": 8,
 *       "completion_tokens": 6,
 *       "total_tokens": 14
 *     }
 *   }
 * }
 */
router.post('/completion', 
  openaiLimiter,
  validator.validateCompletionRequest,
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
 *     {"role": "system", "content": "You are a helpful assistant."},
 *     {"role": "user", "content": "Tell me about the solar system."}
 *   ],
 *   "model": "gpt-4o", (optional, default: "gpt-4o")
 *   "maxTokens": 1000, (optional, default: 1024)
 *   "temperature": 0.7, (optional, default: 0.7)
 *   "responseFormat": "json_object" (optional, default: null)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "message": {
 *       "role": "assistant",
 *       "content": "The solar system consists of the Sun and everything that orbits around it..."
 *     },
 *     "model": "gpt-4o",
 *     "usage": {
 *       "prompt_tokens": 30,
 *       "completion_tokens": 120,
 *       "total_tokens": 150
 *     }
 *   }
 * }
 */
router.post('/chat', 
  openaiLimiter,
  validator.validateChatRequest,
  openaiController.getChatCompletion
);

/**
 * @route   POST /api/openai/image
 * @desc    Generate image from OpenAI DALL-E
 * @access  Public (rate limited)
 * 
 * Request body:
 * {
 *   "prompt": "A futuristic city with flying cars",
 *   "n": 1, (optional, default: 1)
 *   "size": "1024x1024", (optional, default: "1024x1024")
 *   "quality": "standard", (optional, default: "standard")
 *   "responseFormat": "url" (optional, default: "url")
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "images": [
 *       {
 *         "url": "https://..."
 *       }
 *     ],
 *     "created": 1683044108
 *   }
 * }
 */
router.post('/image', 
  openaiLimiter,
  validator.validateImageRequest,
  openaiController.generateImage
);

/**
 * @route   GET /api/openai/status
 * @desc    Check OpenAI API status
 * @access  Public
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "apiStatus": "available",
 *     "hasApiKey": true,
 *     "apiVersion": null,
 *     "availableModels": [
 *       {
 *         "id": "gpt-4o",
 *         "owned_by": "openai"
 *       },
 *       {
 *         "id": "gpt-4-turbo",
 *         "owned_by": "openai"
 *       }
 *     ]
 *   }
 * }
 */
router.get('/status', openaiController.checkStatus);

module.exports = router;