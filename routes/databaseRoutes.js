/**
 * Database Routes
 * 
 * API routes for database-related functionality
 */

const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');

// Auth middleware for admin-only routes
const authMiddleware = require('../middlewares/auth');
const adminOnly = authMiddleware.adminOnly;

/**
 * GET /api/database/test
 * Test database connection
 */
router.get('/test', databaseController.testConnection);

/**
 * GET /api/database/tables
 * Get all tables
 * Admin only
 */
router.get('/tables', adminOnly, databaseController.getTables);

/**
 * GET /api/database/tables/:tableName
 * Get columns for specific table
 * Admin only
 */
router.get('/tables/:tableName', adminOnly, databaseController.getTableColumns);

/**
 * GET /api/database/status
 * Get database status and statistics
 * Admin only
 */
router.get('/status', adminOnly, databaseController.getStatus);

module.exports = router;