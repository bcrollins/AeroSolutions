/**
 * OpenAI Routes
 * 
 * Routes for OpenAI API functionality
 */

const express = require('express');
const router = express.Router();
const openaiController = require('../controllers/openaiController');
const rateLimiter = require('../middlewares/rateLimiter');

// Apply specific rate limiting for OpenAI routes
router.use(rateLimiter.openai);

// Text generation
router.post('/generate-text', openaiController.generateText);

// JSON generation
router.post('/generate-json', openaiController.generateJson);

// Image analysis
router.post('/analyze-image', openaiController.analyzeImage);

// Test connection
router.get('/test', openaiController.testConnection);

module.exports = router;