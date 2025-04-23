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
 * @route   POST /api/openai/completion
 * @desc    Generate text completion
 * @access  Public (rate limited)
 * 
 * Request body:
 * {
 *   "prompt": "Write a summary of the benefits of AI",
 *   "model": "gpt-4o",                   (optional)
 *   "maxTokens": 500,                    (optional)
 *   "temperature": 0.7                   (optional)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "text": "AI offers numerous benefits...",
 *     "usage": {
 *       "prompt_tokens": 9,
 *       "completion_tokens": 156,
 *       "total_tokens": 165
 *     },
 *     "model": "gpt-4o"
 *   }
 * }
 */
router.post('/completion',
  openaiLimiter,
  validateCompletionRequest,
  openaiController.createCompletion
);

/**
 * @route   POST /api/openai/chat
 * @desc    Generate chat completion
 * @access  Public (rate limited)
 * 
 * Request body:
 * {
 *   "messages": [
 *     {"role": "system", "content": "You are a helpful assistant"},
 *     {"role": "user", "content": "Tell me about AI"}
 *   ],
 *   "model": "gpt-4o",                   (optional)
 *   "maxTokens": 1000,                   (optional)
 *   "temperature": 0.7,                  (optional)
 *   "responseFormat": "text"             (optional, can be "text" or "json_object")
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "content": "AI, or Artificial Intelligence...",
 *     "usage": {
 *       "prompt_tokens": 21,
 *       "completion_tokens": 312,
 *       "total_tokens": 333
 *     },
 *     "model": "gpt-4o"
 *   }
 * }
 */
router.post('/chat',
  openaiLimiter,
  validateChatRequest,
  openaiController.createChatCompletion
);

/**
 * @route   POST /api/openai/image
 * @desc    Generate image from prompt
 * @access  Public (rate limited)
 * 
 * Request body:
 * {
 *   "prompt": "A serene mountain landscape at sunset",
 *   "n": 1,                             (optional)
 *   "size": "1024x1024",                (optional)
 *   "quality": "standard",              (optional, can be "standard" or "hd")
 *   "responseFormat": "url"             (optional, can be "url" or "b64_json")
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "images": [
 *       {
 *         "url": "https://...",
 *         "revised_prompt": "A serene mountain landscape..."
 *       }
 *     ],
 *     "created": 1714567890
 *   }
 * }
 */
router.post('/image',
  openaiLimiter,
  validateImageRequest,
  openaiController.createImage
);

module.exports = router;