/**
 * OpenAI Routes
 */
const express = require('express');
const router = express.Router();
const openaiController = require('../controllers/openaiController');

/**
 * @route   POST /api/openai/text
 * @desc    Generate text using OpenAI
 * @access  Public
 */
router.post('/text', openaiController.generateText);

/**
 * @route   POST /api/openai/json
 * @desc    Generate structured JSON using OpenAI
 * @access  Public
 */
router.post('/json', openaiController.generateJSON);

/**
 * @route   POST /api/openai/analyze-image
 * @desc    Analyze an image using OpenAI
 * @access  Public
 */
router.post('/analyze-image', openaiController.analyzeImage);

/**
 * @route   GET /api/openai/test
 * @desc    Test OpenAI API connection
 * @access  Public
 */
router.get('/test', openaiController.testConnection);

module.exports = router;