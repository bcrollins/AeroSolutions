/**
 * Database Controller
 * 
 * Handles logic for database-related routes
 */

const { pool, query, testConnection: testConnectionFn } = require('../config/database');

/**
 * Test database connection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function testConnection(req, res) {
  try {
    const result = await testConnectionFn();
    
    return res.status(result.connected ? 200 : 500).json({
      success: result.connected,
      ...result
    });
  } catch (error) {
    console.error('Error in databaseController.testConnection:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to test database connection',
      error: error.message
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
      SELECT
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) AS column_count,
        (
          SELECT pg_size_pretty(pg_total_relation_size(quote_ident(t.table_name)))
          FROM information_schema.tables
          WHERE table_name = t.table_name
          LIMIT 1
        ) AS size
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    return res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    console.error('Error in databaseController.getTables:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get tables',
      error: error.message
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
    
    // Validate table name to prevent SQL injection
    if (!tableName.match(/^[a-zA-Z0-9_]+$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid table name'
      });
    }
    
    const result = await query(`
      SELECT
        column_name,
        data_type,
        character_maximum_length,
        column_default,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);
    
    return res.status(200).json({
      success: true,
      data: {
        tableName,
        columns: result.rows
      },
      count: result.rowCount
    });
  } catch (error) {
    console.error('Error in databaseController.getTableColumns:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get table columns',
      error: error.message
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
    
    // Get connection count
    const connectionsResult = await query(`
      SELECT count(*) as active_connections
      FROM pg_stat_activity
    `);
    
    // Get database size
    const sizeResult = await query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as db_size
    `);
    
    // Get table counts
    const tableCountResult = await query(`
      SELECT count(*) as table_count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    
    // Get largest tables
    const largestTablesResult = await query(`
      SELECT
        table_name,
        pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size,
        pg_total_relation_size(quote_ident(table_name)) as raw_size
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC
      LIMIT 5
    `);
    
    return res.status(200).json({
      success: true,
      data: {
        version: versionResult.rows[0]?.version,
        connections: parseInt(connectionsResult.rows[0]?.active_connections) || 0,
        size: sizeResult.rows[0]?.db_size,
        tableCount: parseInt(tableCountResult.rows[0]?.table_count) || 0,
        largestTables: largestTablesResult.rows
      }
    });
  } catch (error) {
    console.error('Error in databaseController.getStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get database status',
      error: error.message
    });
  }
}

module.exports = {
  testConnection,
  getTables,
  getTableColumns,
  getStatus
};