/**
 * Database Controller
 * 
 * This controller provides methods for interacting with the database,
 * checking its status, and querying database objects.
 */

const db = require('../config/database');
const logger = require('../config/logger');
const { createError } = require('../middlewares/errorHandler');

/**
 * Test database connection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function testConnection(req, res, next) {
  try {
    const isConnected = await db.checkConnection();
    
    if (isConnected) {
      return res.json({
        success: true,
        message: 'Database connection successful',
        data: {
          status: 'connected',
          timestamp: new Date().toISOString()
        }
      });
    }
    
    throw new Error('Database connection test failed');
  } catch (error) {
    logger.error('Database connection test failed', {
      error: error.message,
      stack: error.stack
    });
    next(createError('Database connection error', 500, 'DATABASE_CONNECTION_ERROR'));
  }
}

/**
 * Get all tables in the database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getTables(req, res, next) {
  try {
    const result = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    res.json({
      success: true,
      data: result.rows.map(row => row.table_name)
    });
  } catch (error) {
    logger.error('Error fetching database tables', {
      error: error.message,
      stack: error.stack
    });
    next(createError('Error fetching database tables', 500, 'DATABASE_TABLES_ERROR'));
  }
}

/**
 * Get columns for a specific table
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getTableColumns(req, res, next) {
  try {
    const tableName = req.params.tableName;
    
    // Validate table name to prevent SQL injection
    if (!tableName.match(/^[a-zA-Z0-9_]+$/)) {
      return next(createError('Invalid table name', 400, 'INVALID_TABLE_NAME'));
    }
    
    const result = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);
    
    res.json({
      success: true,
      data: {
        tableName,
        columns: result.rows
      }
    });
  } catch (error) {
    logger.error('Error fetching table columns', {
      error: error.message,
      tableName: req.params.tableName,
      stack: error.stack
    });
    next(createError('Error fetching table columns', 500, 'DATABASE_COLUMNS_ERROR'));
  }
}

/**
 * Get database status information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getStatus(req, res, next) {
  try {
    // Get current connections
    const connectionsResult = await db.query(`
      SELECT count(*) as active_connections 
      FROM pg_stat_activity
    `);
    
    // Get database size
    const sizeResult = await db.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as db_size
    `);
    
    // Get table counts
    const tablesResult = await db.query(`
      SELECT count(*) as table_count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    
    // Return combined status
    res.json({
      success: true,
      data: {
        active_connections: parseInt(connectionsResult.rows[0].active_connections, 10),
        db_size: sizeResult.rows[0].db_size,
        table_count: parseInt(tablesResult.rows[0].table_count, 10),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching database status', {
      error: error.message,
      stack: error.stack
    });
    next(createError('Error fetching database status', 500, 'DATABASE_STATUS_ERROR'));
  }
}

module.exports = {
  testConnection,
  getTables,
  getTableColumns,
  getStatus
};