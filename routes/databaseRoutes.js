/**
 * Database Routes
 * 
 * Routes for database-related operations
 */
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const logger = require('../config/logger');

// Middleware to check admin permission
const checkAdmin = (req, res, next) => {
  // In a production app, you'd verify the user's role from a JWT token
  // or session data. This is a placeholder.
  if (req.headers['admin-key'] !== process.env.ADMIN_API_KEY) {
    logger.logSecurityEvent('Unauthorized database access attempt', {
      ip: req.ip,
      path: req.originalUrl
    });
    return res.status(403).json({
      success: false,
      error: {
        message: 'Admin access required'
      }
    });
  }
  next();
};

/**
 * @route   GET /api/database/status
 * @desc    Get database connection status
 * @access  Admin
 */
router.get('/status', checkAdmin, async (req, res) => {
  try {
    const isConnected = await db.testConnection();
    
    if (isConnected) {
      // Get basic database status info
      const infoQuery = `
        SELECT 
          current_database() as database_name,
          current_user as user,
          version() as version,
          pg_postmaster_start_time() as start_time,
          pg_size_pretty(pg_database_size(current_database())) as database_size
      `;
      const result = await db.query(infoQuery);
      
      return res.json({
        success: true,
        data: {
          connected: true,
          info: result.rows[0]
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Database connection test failed'
        }
      });
    }
  } catch (error) {
    logger.error('Error checking database status', { error: error.message });
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error checking database status',
        details: error.message
      }
    });
  }
});

/**
 * @route   GET /api/database/tables
 * @desc    Get all tables in database
 * @access  Admin
 */
router.get('/tables', checkAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        table_name, 
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    const result = await db.query(query);
    
    return res.json({
      success: true,
      data: {
        tables: result.rows
      }
    });
  } catch (error) {
    logger.error('Error fetching database tables', { error: error.message });
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching database tables',
        details: error.message
      }
    });
  }
});

/**
 * @route   GET /api/database/tables/:tableName/columns
 * @desc    Get columns for a specific table
 * @access  Admin
 */
router.get('/tables/:tableName/columns', checkAdmin, async (req, res) => {
  try {
    const { tableName } = req.params;
    
    // First validate table name to prevent SQL injection
    const tableValidationQuery = `
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = $1
    `;
    const tableValidation = await db.query(tableValidationQuery, [tableName]);
    
    if (tableValidation.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Table '${tableName}' not found`
        }
      });
    }
    
    const query = `
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position;
    `;
    const result = await db.query(query, [tableName]);
    
    return res.json({
      success: true,
      data: {
        table: tableName,
        columns: result.rows
      }
    });
  } catch (error) {
    logger.error('Error fetching table columns', { 
      error: error.message,
      table: req.params.tableName
    });
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching table columns',
        details: error.message
      }
    });
  }
});

module.exports = router;