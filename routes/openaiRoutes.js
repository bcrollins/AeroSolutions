/**
 * OpenAI API Routes
 * 
 * This module defines routes for interacting with the OpenAI API.
 * It includes endpoints for text completion, chat responses, and image generation.
 */

const express = require('express');
const router = express.Router();
const openaiController = require('../controllers/openaiController');
const { openaiLimiter } = require('../middlewares/rateLimiter');

/**
 * @route   GET /api/openai/status
 * @desc    Check OpenAI API status
 * @access  Public
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "apiStatus": "operational", // or "error", "unconfigured", "unknown"
 *     "hasApiKey": true,
 *     "error": null, // or error message if apiStatus is "error"
 *     "models": [
 *       {
 *         "id": "gpt-4o",
 *         "owned_by": "openai"
 *       },
 *       ...
 *     ]
 *   }
 * }
 */
router.get('/status', openaiLimiter, openaiController.checkStatus);

/**
 * @route   POST /api/openai/completion
 * @desc    Get text completion from OpenAI
 * @access  Public (rate limited)
 * 
 * Request body:
 * {
 *   "prompt": "Complete this sentence: The quick brown fox",
 *   "model": "text-davinci-003", (optional, default: text-davinci-003)
 *   "maxTokens": 150, (optional, default: 150)
 *   "temperature": 0.7 (optional, default: 0.7)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "text": "jumps over the lazy dog.",
 *     "model": "text-davinci-003",
 *     "usage": {
 *       "prompt_tokens": 9,
 *       "completion_tokens": 6,
 *       "total_tokens": 15
 *     }
 *   }
 * }
 */
router.post('/completion', openaiLimiter, openaiController.getCompletion);

/**
 * @route   POST /api/openai/chat
 * @desc    Get chat completion from OpenAI
 * @access  Public (rate limited)
 * 
 * Request body:
 * {
 *   "messages": [
 *     {"role": "system", "content": "You are a helpful assistant."},
 *     {"role": "user", "content": "Who won the world series in 2020?"}
 *   ],
 *   "model": "gpt-4o", (optional, default: gpt-4o)
 *   "maxTokens": 1000, (optional, default: 1000)
 *   "temperature": 0.7 (optional, default: 0.7)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "message": {
 *       "role": "assistant",
 *       "content": "The Los Angeles Dodgers won the World Series in 2020..."
 *     },
 *     "model": "gpt-4o",
 *     "usage": {
 *       "prompt_tokens": 27,
 *       "completion_tokens": 20,
 *       "total_tokens": 47
 *     }
 *   }
 * }
 */
router.post('/chat', openaiLimiter, openaiController.getChatCompletion);

/**
 * @route   POST /api/openai/image
 * @desc    Generate image from OpenAI DALL-E
 * @access  Public (rate limited)
 * 
 * Request body:
 * {
 *   "prompt": "A beautiful sunset over the ocean",
 *   "n": 1, (optional, default: 1)
 *   "size": "1024x1024", (optional, default: 1024x1024)
 *   "quality": "standard", (optional, default: standard)
 *   "responseFormat": "url" (optional, default: url)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "images": [
 *       {
 *         "url": "https://oaidalleapiprodscus.blob.core.windows.net/..."
 *       }
 *     ],
 *     "created": 1589478378
 *   }
 * }
 */
router.post('/image', openaiLimiter, openaiController.generateImage);

module.exports = router;