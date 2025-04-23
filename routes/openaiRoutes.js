/**
 * OpenAI API Routes
 * 
 * This module defines routes for OpenAI API interactions.
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
 *   "prompt": "Generate a creative story about...",
 *   "model": "gpt-4o",                         (optional, default: "gpt-4o")
 *   "maxTokens": 500,                          (optional, default: 500)
 *   "temperature": 0.7                         (optional, default: 0.7)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "text": "Once upon a time...",
 *     "usage": {
 *       "prompt_tokens": 10,
 *       "completion_tokens": 100,
 *       "total_tokens": 110
 *     },
 *     "model": "gpt-4o"
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
 *     {"role": "system", "content": "You are a helpful assistant."},
 *     {"role": "user", "content": "Tell me about AI."}
 *   ],
 *   "model": "gpt-4o",                         (optional, default: "gpt-4o")
 *   "maxTokens": 1000,                         (optional, default: 1000)
 *   "temperature": 0.7,                        (optional, default: 0.7)
 *   "responseFormat": "text"                   (optional, default: "text", can be "text" or "json_object")
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "message": {
 *       "role": "assistant",
 *       "content": "AI, or artificial intelligence..."
 *     },
 *     "usage": {
 *       "prompt_tokens": 23,
 *       "completion_tokens": 156,
 *       "total_tokens": 179
 *     },
 *     "model": "gpt-4o"
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
 * @desc    Generate image with DALL-E
 * @access  Public (rate limited)
 * 
 * Request body:
 * {
 *   "prompt": "A futuristic city with flying cars...",
 *   "n": 1,                                    (optional, default: 1, max: 10)
 *   "size": "1024x1024",                       (optional, default: "1024x1024")
 *   "quality": "standard",                     (optional, default: "standard", can be "standard" or "hd")
 *   "responseFormat": "url"                    (optional, default: "url", can be "url" or "b64_json")
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "images": [
 *       {
 *         "url": "https://...",
 *         "revised_prompt": "A detailed futuristic city..."
 *       }
 *     ],
 *     "created": 1682596287
 *   }
 * }
 */
router.post('/image',
  openaiLimiter,
  validateImageRequest,
  openaiController.generateImage
);

module.exports = router;