/**
 * OpenAI Routes
 * 
 * Routes for OpenAI-related functionality
 */

const express = require('express');
const router = express.Router();
const openaiController = require('../controllers/openaiController');
const { authMiddleware } = require('../middlewares/auth');
const rateLimiter = require('../middlewares/rateLimiter');

// Public test route
router.get('/test', openaiController.testConnection);

// Protected routes (require authentication)
router.post('/generate/text', authMiddleware, rateLimiter, openaiController.generateText);
router.post('/generate/json', authMiddleware, rateLimiter, openaiController.generateJson);
router.post('/analyze/image', authMiddleware, rateLimiter, openaiController.analyzeImage);

module.exports = router;