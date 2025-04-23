/**
 * Database Routes
 * 
 * This module defines routes for database information and management.
 */

const express = require('express');
const router = express.Router();

// Controller
const databaseController = require('../controllers/databaseController');

// Middleware
const { apiLimiter } = require('../middlewares/rateLimiter');

/**
 * @route   GET /api/database/test
 * @desc    Test database connection
 * @access  Public
 */
router.get('/test', 
  apiLimiter,
  databaseController.testConnection
);

/**
 * @route   GET /api/database/tables
 * @desc    Get all tables in the database
 * @access  Public
 */
router.get('/tables', 
  apiLimiter,
  databaseController.getTables
);

/**
 * @route   GET /api/database/tables/:tableName/columns
 * @desc    Get columns for a specific table
 * @access  Public
 */
router.get('/tables/:tableName/columns', 
  apiLimiter,
  databaseController.getTableColumns
);

/**
 * @route   GET /api/database/status
 * @desc    Get database status information
 * @access  Public
 */
router.get('/status', 
  apiLimiter,
  databaseController.getStatus
);

module.exports = router;