/**
 * OpenAI Routes
 * 
 * Routes for OpenAI API interactions
 */

const express = require('express');
const router = express.Router();
const openaiController = require('../controllers/openaiController');
const { authMiddleware, optionalAuthMiddleware } = require('../middlewares/auth');
const rateLimiter = require('../middlewares/rateLimiter');

// Apply rate limiting to all OpenAI routes
router.use(rateLimiter.openai);

// Test OpenAI connection (public route for health checks)
router.get('/test', openaiController.testConnection);

// Text generation (auth optional)
router.post('/generate-text', optionalAuthMiddleware, openaiController.generateText);

// JSON generation (auth optional)
router.post('/generate-json', optionalAuthMiddleware, openaiController.generateJSON);

// Image analysis (auth optional)
router.post('/analyze-image', optionalAuthMiddleware, openaiController.analyzeImage);

module.exports = router;