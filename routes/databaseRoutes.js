/**
 * Database Routes
 * 
 * API routes for database-related functionality
 */

const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');
const limiter = require('../middlewares/rateLimiter');

/**
 * @route   GET /api/database/test
 * @desc    Test database connection
 * @access  Public
 */
router.get(
  '/test',
  limiter.default,
  databaseController.testConnection
);

/**
 * @route   GET /api/database/tables
 * @desc    Get all tables
 * @access  Admin
 */
router.get(
  '/tables',
  limiter.default,
  databaseController.getTables
);

/**
 * @route   GET /api/database/tables/:table/columns
 * @desc    Get columns for a specific table
 * @access  Admin
 */
router.get(
  '/tables/:table/columns',
  limiter.default,
  databaseController.getTableColumns
);

/**
 * @route   GET /api/database/status
 * @desc    Get database status and statistics
 * @access  Admin
 */
router.get(
  '/status',
  limiter.default,
  databaseController.getStatus
);

module.exports = router;