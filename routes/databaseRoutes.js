/**
 * Database API Routes
 * 
 * This module defines routes for database management and diagnostics.
 * These routes are primarily for administration and monitoring.
 */

const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');
const { apiLimiter } = require('../middlewares/rateLimiter');

/**
 * @route   GET /api/database/test
 * @desc    Test database connection
 * @access  Public
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Database connection successful",
 *   "data": {
 *     "timestamp": "2025-04-23T12:34:56.789Z"
 *   }
 * }
 */
router.get('/test', databaseController.testConnection);

/**
 * @route   GET /api/database/tables
 * @desc    Get all tables in the database
 * @access  Admin
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "tables": [
 *       {
 *         "table_name": "users",
 *         "table_schema": "public",
 *         "row_count_estimate": 125
 *       },
 *       ...
 *     ]
 *   }
 * }
 */
router.get('/tables', apiLimiter, databaseController.getTables);

/**
 * @route   GET /api/database/tables/:tableName/columns
 * @desc    Get columns for a specific table
 * @access  Admin
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "tableName": "users",
 *     "columns": [
 *       {
 *         "column_name": "id",
 *         "data_type": "integer",
 *         "is_nullable": "NO"
 *       },
 *       ...
 *     ]
 *   }
 * }
 */
router.get('/tables/:tableName/columns', apiLimiter, databaseController.getTableColumns);

/**
 * @route   GET /api/database/status
 * @desc    Get database status information and statistics
 * @access  Admin
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "version": "PostgreSQL 14.5",
 *     "uptime": "10 days 5 hours 30 minutes",
 *     "connections": {
 *       "active": 5,
 *       "idle": 2,
 *       "max": 100
 *     },
 *     "dbSize": "1.2 GB",
 *     "tablesCount": 15,
 *     "largestTables": [
 *       {
 *         "name": "logs",
 *         "size": "500 MB",
 *         "rows": 1000000
 *       },
 *       ...
 *     ]
 *   }
 * }
 */
router.get('/status', apiLimiter, databaseController.getStatus);

module.exports = router;