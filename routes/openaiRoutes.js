/**
 * OpenAI Routes
 * 
 * API routes for OpenAI-related functionality
 */

const express = require('express');
const router = express.Router();
const openaiController = require('../controllers/openaiController');
const rateLimiter = require('../middlewares/rateLimiter');

/**
 * @route POST /api/openai/text
 * @desc Generate text using OpenAI
 * @access Public
 */
router.post('/text', rateLimiter.openai, openaiController.generateText);

/**
 * @route POST /api/openai/json
 * @desc Generate JSON using OpenAI
 * @access Public
 */
router.post('/json', rateLimiter.openai, openaiController.generateJSON);

/**
 * @route POST /api/openai/image-analysis
 * @desc Analyze an image using OpenAI
 * @access Public
 */
router.post('/image-analysis', rateLimiter.openai, openaiController.analyzeImage);

/**
 * @route GET /api/openai/test
 * @desc Test OpenAI API connection
 * @access Public
 */
router.get('/test', openaiController.testConnection);

module.exports = router;