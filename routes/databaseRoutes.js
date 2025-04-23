/**
 * Database Routes
 * 
 * This module defines routes for database management functions.
 */

const express = require('express');
const router = express.Router();

// Controller
const databaseController = require('../controllers/databaseController');

// We typically don't rate limit these routes as they are admin-only

/**
 * @route   GET /api/database/status
 * @desc    Check database connection status
 * @access  Admin
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Database connection successful",
 *   "data": {
 *     "status": "connected",
 *     "timestamp": "2025-04-23T12:34:56.789Z"
 *   }
 * }
 */
router.get('/status', databaseController.testConnection);

/**
 * @route   GET /api/database/info
 * @desc    Get detailed database status information
 * @access  Admin
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "active_connections": 5,
 *     "db_size": "8192 kB",
 *     "table_count": 3,
 *     "timestamp": "2025-04-23T12:34:56.789Z"
 *   }
 * }
 */
router.get('/info', databaseController.getStatus);

/**
 * @route   GET /api/database/tables
 * @desc    Get all tables in the database
 * @access  Admin
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": ["contacts", "users", "products"]
 * }
 */
router.get('/tables', databaseController.getTables);

/**
 * @route   GET /api/database/tables/:tableName
 * @desc    Get columns for a specific table
 * @access  Admin
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "tableName": "contacts",
 *     "columns": [
 *       {
 *         "column_name": "id",
 *         "data_type": "integer",
 *         "is_nullable": "NO",
 *         "column_default": "nextval('contacts_id_seq'::regclass)"
 *       },
 *       {
 *         "column_name": "name",
 *         "data_type": "character varying",
 *         "is_nullable": "NO",
 *         "column_default": null
 *       },
 *       ...
 *     ]
 *   }
 * }
 */
router.get('/tables/:tableName', databaseController.getTableColumns);

module.exports = router;