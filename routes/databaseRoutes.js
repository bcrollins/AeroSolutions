/**
 * Database Routes
 * 
 * Routes for database operations and information
 */

const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const rateLimiter = require('../middlewares/rateLimiter');

// Apply rate limiting to admin routes
router.use(rateLimiter.admin);

// Test database connection (public route for health checks)
router.get('/test', databaseController.testConnection);

// The following routes require admin authentication
router.use(authMiddleware);
router.use(adminMiddleware);

// Get all database tables
router.get('/tables', databaseController.getTables);

// Get columns for a specified table
router.get('/tables/:tableName/columns', databaseController.getTableColumns);

// Get database status and statistics
router.get('/status', databaseController.getStatus);

module.exports = router;