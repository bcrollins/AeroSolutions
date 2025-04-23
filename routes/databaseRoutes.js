/**
 * Database Routes
 * 
 * This module defines routes for database management operations.
 */

const express = require('express');
const router = express.Router();

// Controller
const databaseController = require('../controllers/databaseController');

// Middleware
const { sensitiveOperationsLimiter } = require('../middlewares/rateLimiter');

/**
 * @route   GET /api/database/status
 * @desc    Check database connection status
 * @access  Admin
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "status": "connected",
 *     "timestamp": "2025-04-23T12:34:56.789Z"
 *   }
 * }
 */
router.get('/status',
  sensitiveOperationsLimiter,
  // Authentication middleware would go here
  databaseController.checkStatus
);

/**
 * @route   POST /api/database/init
 * @desc    Initialize database schema
 * @access  Admin
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "message": "Database initialized successfully",
 *     "timestamp": "2025-04-23T12:34:56.789Z"
 *   }
 * }
 */
router.post('/init',
  sensitiveOperationsLimiter,
  // Authentication middleware would go here
  databaseController.initializeDatabase
);

/**
 * @route   GET /api/database/tables
 * @desc    Get information about database tables
 * @access  Admin
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "tables": [
 *       {
 *         "name": "contacts",
 *         "rowCount": 12,
 *         "columns": [
 *           {
 *             "column_name": "id",
 *             "data_type": "integer",
 *             "is_nullable": "NO"
 *           },
 *           ...
 *         ]
 *       },
 *       ...
 *     ],
 *     "count": 3,
 *     "timestamp": "2025-04-23T12:34:56.789Z"
 *   }
 * }
 */
router.get('/tables',
  sensitiveOperationsLimiter,
  // Authentication middleware would go here
  databaseController.getTablesInfo
);

module.exports = router;