/**
 * Database Controller
 * 
 * Handles database-related requests for monitoring and inspection
 */

const { pool, query, testConnection } = require('../config/database');

/**
 * Test database connection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const testConnectionHandler = async (req, res) => {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      return res.status(200).json({
        success: true,
        message: 'Database connection successful',
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error in databaseController.testConnection:', error);
    return res.status(500).json({
      success: false,
      message: 'Database connection test error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get all tables in the database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTables = async (req, res) => {
  try {
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    return res.status(200).json({
      success: true,
      data: result.rows.map(row => row.table_name),
      count: result.rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in databaseController.getTables:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve tables',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get columns for a specific table
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTableColumns = async (req, res) => {
  try {
    const { tableName } = req.params;
    
    // Sanitize table name to prevent SQL injection
    // Only allow alphanumeric and underscore characters
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid table name format',
        timestamp: new Date().toISOString()
      });
    }
    
    const result = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Table not found or has no columns',
        timestamp: new Date().toISOString()
      });
    }
    
    return res.status(200).json({
      success: true,
      table: tableName,
      columns: result.rows,
      count: result.rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in databaseController.getTableColumns:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve table columns',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get database status and statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStatus = async (req, res) => {
  try {
    // Get connection pool statistics
    const poolStats = {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount
    };
    
    // Get database version
    const versionResult = await query('SELECT version()');
    const version = versionResult.rows[0].version;
    
    // Get database size
    const sizeResult = await query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size,
             pg_database_size(current_database()) as bytes
    `);
    const size = sizeResult.rows[0];
    
    // Get table stats
    const tableResult = await query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const tableCount = parseInt(tableResult.rows[0].count);
    
    return res.status(200).json({
      success: true,
      database: {
        version,
        size: size.size,
        bytes: parseInt(size.bytes),
        tables: tableCount
      },
      pool: poolStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in databaseController.getStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve database status',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  testConnection: testConnectionHandler,
  getTables,
  getTableColumns,
  getStatus
};