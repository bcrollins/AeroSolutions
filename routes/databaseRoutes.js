/**
 * Database Routes
 * 
 * Routes for database management and information
 */

const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');
const { apiLimiter } = require('../middlewares/rateLimiter');

/**
 * @route GET /api/database/test
 * @desc Test database connection
 * @access Public
 */
router.get('/test', databaseController.testConnection);

/**
 * @route GET /api/database/tables
 * @desc Get all tables in the database
 * @access Admin only
 */
router.get('/tables', apiLimiter, databaseController.getTables);

/**
 * @route GET /api/database/tables/:tableName/columns
 * @desc Get columns for a specific table
 * @access Admin only
 */
router.get('/tables/:tableName/columns', apiLimiter, databaseController.getTableColumns);

/**
 * @route GET /api/database/status
 * @desc Get database status and statistics
 * @access Admin only
 */
router.get('/status', apiLimiter, databaseController.getStatus);

module.exports = router;