/**
 * Database Routes
 * 
 * API routes for database-related functionality
 */

const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');
const rateLimiter = require('../middlewares/rateLimiter');

/**
 * @route GET /api/database/test
 * @desc Test database connection
 * @access Public
 */
router.get('/test', databaseController.testConnection);

/**
 * @route GET /api/database/tables
 * @desc Get all tables in the database
 * @access Admin
 */
router.get('/tables', rateLimiter.api, databaseController.getTables);

/**
 * @route GET /api/database/tables/:tableName
 * @desc Get columns for a specific table
 * @access Admin
 */
router.get('/tables/:tableName', rateLimiter.api, databaseController.getTableColumns);

/**
 * @route GET /api/database/status
 * @desc Get database status and statistics
 * @access Admin
 */
router.get('/status', rateLimiter.api, databaseController.getStatus);

module.exports = router;