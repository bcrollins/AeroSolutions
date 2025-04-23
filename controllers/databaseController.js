/**
 * Database Controller
 * 
 * This controller provides methods for database management and status.
 */

const fs = require('fs').promises;
const path = require('path');
const db = require('../config/database');
const logger = require('../config/logger');
const { createError } = require('../middlewares/errorHandler');

/**
 * Check database status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function checkStatus(req, res, next) {
  try {
    // Test database connection with a simple query
    const result = await db.query('SELECT NOW() as time');
    
    // Log successful connection
    logger.info('Database connection test successful', {
      timestamp: result.rows[0].time
    });
    
    // Send success response
    res.json({
      success: true,
      data: {
        status: 'connected',
        timestamp: result.rows[0].time
      }
    });
  } catch (err) {
    // Log error
    logger.error('Database connection test failed', {
      error: err.message,
      stack: err.stack
    });
    
    // Send error response
    next(createError('Database is not connected', 500, 'DATABASE_DISCONNECTED'));
  }
}

/**
 * Initialize database schema
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function initializeDatabase(req, res, next) {
  try {
    // Path to SQL schema
    const schemaPath = path.join(process.cwd(), 'models', 'schema.sql');
    
    // Read schema SQL
    const schemaSql = await fs.readFile(schemaPath, 'utf8');
    
    // Execute schema SQL
    await db.query(schemaSql);
    
    // Log successful initialization
    logger.info('Database schema initialized');
    
    // Send success response
    res.json({
      success: true,
      data: {
        message: 'Database initialized successfully',
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    // Log error
    logger.error('Database initialization failed', {
      error: err.message,
      stack: err.stack
    });
    
    // Send error response
    next(createError('Failed to initialize database schema', 500, 'DATABASE_INIT_ERROR'));
  }
}

/**
 * Get database tables info
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getTablesInfo(req, res, next) {
  try {
    // Get list of tables
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tables = [];
    
    // For each table, get additional info
    for (const tableRow of tablesResult.rows) {
      const tableName = tableRow.table_name;
      
      // Get column information
      const columnsResult = await db.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);
      
      // Get row count
      const countResult = await db.query(`
        SELECT COUNT(*) as row_count
        FROM "${tableName}"
      `);
      
      tables.push({
        name: tableName,
        rowCount: parseInt(countResult.rows[0].row_count),
        columns: columnsResult.rows
      });
    }
    
    // Send response
    res.json({
      success: true,
      data: {
        tables,
        count: tables.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    // Log error
    logger.error('Failed to get database tables info', {
      error: err.message,
      stack: err.stack
    });
    
    // Send error response
    next(createError('Failed to get database tables information', 500, 'DATABASE_INFO_ERROR'));
  }
}

module.exports = {
  checkStatus,
  initializeDatabase,
  getTablesInfo
};