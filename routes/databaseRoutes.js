/**
 * Database API Routes
 * 
 * This module defines routes for database management and diagnostics.
 * It provides endpoints for checking connection status, viewing tables,
 * and examining database structure.
 */

const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');
const { apiLimiter } = require('../middlewares/rateLimiter');

/**
 * @route   GET /api/database/test
 * @desc    Test database connection
 * @access  Admin
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
router.get('/test', apiLimiter, databaseController.testConnection);

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
 *         "table_schema": "public",
 *         "table_name": "users",
 *         "size": "256 KB",
 *         "table_size": "192 KB",
 *         "indexes_size": "64 KB",
 *         "row_count_estimate": 1000
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
 *         "character_maximum_length": null,
 *         "column_default": "nextval('users_id_seq'::regclass)",
 *         "is_nullable": "NO"
 *       },
 *       {
 *         "column_name": "username",
 *         "data_type": "character varying",
 *         "character_maximum_length": 255,
 *         "column_default": null,
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
 * @desc    Get database status information
 * @access  Admin
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "version": "PostgreSQL 14.5 on x86_64-pc-linux-gnu...",
 *     "connections": {
 *       "total": 5,
 *       "active": 2,
 *       "idle": 3
 *     },
 *     "dbSize": "10 MB",
 *     "dbSizeBytes": 10485760,
 *     "tablesCount": 10,
 *     "largestTables": [
 *       {
 *         "name": "public.users",
 *         "size": "256 KB",
 *         "sizeBytes": 262144,
 *         "rowCountEstimate": 1000
 *       },
 *       ...
 *     ]
 *   }
 * }
 */
router.get('/status', apiLimiter, databaseController.getStatus);

module.exports = router;