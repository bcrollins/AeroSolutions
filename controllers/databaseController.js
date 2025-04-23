/**
 * Database Controller
 * 
 * Handles logic for database-related routes
 */

const { query, testConnection: dbTestConnection } = require('../config/database');
const logger = require('../config/logger');

/**
 * Test database connection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function testConnection(req, res) {
  try {
    const isConnected = await dbTestConnection();
    
    if (!isConnected) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Database connection failed',
          code: 'DB_CONNECTION_ERROR'
        }
      });
    }
    
    return res.json({
      success: true,
      message: 'Database connection successful'
    });
  } catch (error) {
    logger.error(`Error in database testConnection: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Failed to test database connection',
        details: error.message
      }
    });
  }
}

/**
 * Get all tables
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getTables(req, res) {
  try {
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    return res.json({
      success: true,
      tables: result.rows.map(row => row.table_name)
    });
  } catch (error) {
    logger.error(`Error getting tables: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get database tables',
        details: error.message
      }
    });
  }
}

/**
 * Get columns for specific table
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getTableColumns(req, res) {
  try {
    const { tableName } = req.params;
    
    if (!tableName) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Table name is required',
          code: 'MISSING_PARAMETER'
        }
      });
    }
    
    // Check if table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )
    `, [tableName]);
    
    if (!tableCheck.rows[0].exists) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Table '${tableName}' not found`,
          code: 'TABLE_NOT_FOUND'
        }
      });
    }
    
    // Get column information
    const result = await query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);
    
    return res.json({
      success: true,
      table: tableName,
      columns: result.rows
    });
  } catch (error) {
    logger.error(`Error getting table columns: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get table columns',
        details: error.message
      }
    });
  }
}

/**
 * Get database status and statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getStatus(req, res) {
  try {
    // Get database version
    const versionResult = await query('SELECT version()');
    const version = versionResult.rows[0].version;
    
    // Get database size
    const sizeResult = await query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `);
    const size = sizeResult.rows[0].size;
    
    // Get table counts
    const tableCountResult = await query(`
      SELECT count(*) as count
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const tableCount = parseInt(tableCountResult.rows[0].count);
    
    // Get active connections
    const connectionsResult = await query(`
      SELECT count(*) as count
      FROM pg_stat_activity
      WHERE datname = current_database()
    `);
    const connections = parseInt(connectionsResult.rows[0].count);
    
    return res.json({
      success: true,
      status: {
        version,
        size,
        tableCount,
        connections,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error(`Error getting database status: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get database status',
        details: error.message
      }
    });
  }
}

module.exports = {
  testConnection,
  getTables,
  getTableColumns,
  getStatus
};