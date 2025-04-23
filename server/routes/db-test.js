/**
 * Database Test Route
 * 
 * This module provides a route to test the PostgreSQL database connection.
 * It executes a simple query to verify connectivity.
 */

const express = require('express');
const router = express.Router();
const db = require('../../config/database');

/**
 * Test Database Connection
 * 
 * This route executes a simple query to verify database connectivity.
 * It returns the current timestamp from the database.
 * 
 * @route GET /api/test-db
 * @returns {Object} 200 - Success response with timestamp
 * @returns {Object} 500 - Error response
 */
router.get('/test-db', async (req, res) => {
  try {
    // Test the database connection
    const success = await db.testConnection();
    
    if (success) {
      const result = await db.query('SELECT NOW() as now');
      return res.status(200).json({
        status: 'success',
        time: { now: result.rows[0].now },
        message: 'Database connection successful'
      });
    } else {
      return res.status(500).json({
        status: 'error',
        message: 'Database connection test failed'
      });
    }
  } catch (error) {
    console.error('Error testing database connection:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Database connection error',
      error: error.message
    });
  }
});

module.exports = router;