/**
 * Database Controller
 * 
 * Handles API routes for database information and operations
 */

const { pool, testConnection: testDbConnection } = require('../config/database');

/**
 * Test database connection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const testConnection = async (req, res) => {
  try {
    const isConnected = await testDbConnection();
    
    if (isConnected) {
      return res.status(200).json({
        success: true,
        message: 'Database connection successful'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Database connection failed'
      });
    }
  } catch (error) {
    console.error('Error in database testConnection controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Database connection test failed',
      error: error.message
    });
  }
};

/**
 * Get all database tables (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTables = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    return res.status(200).json({
      success: true,
      data: result.rows.map(row => row.table_name)
    });
  } catch (error) {
    console.error('Error in database getTables controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get database tables',
      error: error.message
    });
  }
};

/**
 * Get columns for a specified table (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTableColumns = async (req, res) => {
  try {
    const { tableName } = req.params;
    
    if (!tableName) {
      return res.status(400).json({
        success: false,
        message: 'Table name is required'
      });
    }
    
    // Check if table exists
    const tableExistsResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      ) as exists
    `, [tableName]);
    
    if (!tableExistsResult.rows[0].exists) {
      return res.status(404).json({
        success: false,
        message: `Table '${tableName}' not found`
      });
    }
    
    // Get table columns
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);
    
    return res.status(200).json({
      success: true,
      data: {
        tableName,
        columns: result.rows
      }
    });
  } catch (error) {
    console.error('Error in database getTableColumns controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get table columns',
      error: error.message
    });
  }
};

/**
 * Get database status and statistics (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStatus = async (req, res) => {
  try {
    // Get database version
    const versionResult = await pool.query('SELECT version()');
    
    // Get database size
    const sizeResult = await pool.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `);
    
    // Get connection count
    const connectionResult = await pool.query(`
      SELECT count(*) as connection_count 
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `);
    
    // Get table counts
    const tableCountResult = await pool.query(`
      SELECT count(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    return res.status(200).json({
      success: true,
      data: {
        version: versionResult.rows[0].version,
        size: sizeResult.rows[0].size,
        connectionCount: parseInt(connectionResult.rows[0].connection_count),
        tableCount: parseInt(tableCountResult.rows[0].table_count)
      }
    });
  } catch (error) {
    console.error('Error in database getStatus controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get database status',
      error: error.message
    });
  }
};

module.exports = {
  testConnection,
  getTables,
  getTableColumns,
  getStatus
};