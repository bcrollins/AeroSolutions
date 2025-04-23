/**
 * Database Routes
 * 
 * This module defines routes for database management and monitoring.
 */

const express = require('express');
const router = express.Router();

// Import controller methods
const {
  checkStatus,
  initializeDatabase,
  getTablesInfo
} = require('../controllers/databaseController');

// Import middleware
const { standardLimiter, strictLimiter } = require('../middlewares/rateLimiter');

/**
 * @route   GET /api/database/status
 * @desc    Check database connection status
 * @access  Public (with rate limiting)
 */
router.get('/status', standardLimiter, checkStatus);

/**
 * @route   POST /api/database/init
 * @desc    Initialize database schema
 * @access  Public (with strict rate limiting)
 */
router.post('/init', strictLimiter, initializeDatabase);

/**
 * @route   GET /api/database/tables
 * @desc    Get information about database tables
 * @access  Public (with rate limiting)
 */
router.get('/tables', standardLimiter, getTablesInfo);

module.exports = router;