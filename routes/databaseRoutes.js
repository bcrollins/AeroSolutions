/**
 * Database Routes
 * 
 * This module defines routes for database management and status.
 */

const express = require('express');
const router = express.Router();

// Controller
const databaseController = require('../controllers/databaseController');

/**
 * @route   GET /api/database/status
 * @desc    Check database connection status
 * @access  Public
 * 
 * Response (Connected):
 * {
 *   "success": true,
 *   "data": {
 *     "status": "connected",
 *     "timestamp": "2025-04-23T12:34:56.789Z"
 *   }
 * }
 * 
 * Response (Not Connected):
 * {
 *   "success": false,
 *   "error": {
 *     "message": "Database is not connected",
 *     "code": "DATABASE_DISCONNECTED"
 *   }
 * }
 */
router.get('/status', databaseController.checkStatus);

/**
 * @route   POST /api/database/init
 * @desc    Initialize database schema
 * @access  Admin (should be protected)
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
router.post('/init', databaseController.initializeDatabase);

/**
 * @route   GET /api/database/tables
 * @desc    Get database tables information
 * @access  Admin (should be protected)
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "tables": [
 *       {
 *         "name": "contacts",
 *         "rowCount": 10,
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
router.get('/tables', databaseController.getTablesInfo);

module.exports = router;