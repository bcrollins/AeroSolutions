/**
 * Database Routes
 * 
 * Routes for database information and operations
 */

const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const rateLimiter = require('../middlewares/rateLimiter');

// Apply admin rate limiting
router.use(rateLimiter.admin);

// Basic connection test (public for health checks)
router.get('/test', databaseController.testConnection);

// Protected routes (admin only)
router.get('/tables', authMiddleware, adminMiddleware, databaseController.getTables);
router.get('/tables/:tableName', authMiddleware, adminMiddleware, databaseController.getTableColumns);
router.get('/status', authMiddleware, adminMiddleware, databaseController.getStatus);

module.exports = router;