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
    // Simple query to test the connection
    const result = await db.query('SELECT NOW() as time');
    
    logger.info('Database connection test successful');
    
    res.json({
      success: true,
      message: 'Database connection successful',
      data: {
        timestamp: result.rows[0].time,
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    logger.error('Database connection test failed', {
      error: error.message,
      stack: error.stack
    });
    
    next(createError(
      'Database connection failed',
      500,
      'DATABASE_CONNECTION_ERROR',
      { details: error.message }
    ));
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
    // Query to get all tables with their size and row count estimate
    const result = await db.query(`
      SELECT 
        t.table_schema,
        t.table_name,
        pg_size_pretty(pg_total_relation_size('"' || t.table_schema || '"."' || t.table_name || '"')) as size,
        pg_size_pretty(pg_relation_size('"' || t.table_schema || '"."' || t.table_name || '"')) as table_size,
        pg_size_pretty(pg_indexes_size('"' || t.table_schema || '"."' || t.table_name || '"')) as indexes_size,
        pg_stat_get_live_tuples('"' || t.table_schema || '"."' || t.table_name || '"'::regclass) as row_count_estimate
      FROM 
        information_schema.tables t
      WHERE 
        t.table_schema NOT IN ('pg_catalog', 'information_schema')
        AND t.table_type = 'BASE TABLE'
      ORDER BY 
        t.table_schema, t.table_name
    `);
    
    logger.info('Successfully retrieved database tables', {
      tableCount: result.rows.length
    });
    
    res.json({
      success: true,
      data: {
        tables: result.rows
      }
    });
  } catch (error) {
    logger.error('Failed to retrieve database tables', {
      error: error.message,
      stack: error.stack
    });
    
    next(createError(
      'Failed to retrieve database tables',
      500,
      'DATABASE_QUERY_ERROR',
      { details: error.message }
    ));
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
    const { tableName } = req.params;
    
    if (!tableName) {
      return next(createError(
        'Table name is required',
        400,
        'INVALID_PARAMETERS'
      ));
    }
    
    // Query to get all columns for the specified table
    const result = await db.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        column_default,
        is_nullable
      FROM 
        information_schema.columns
      WHERE 
        table_name = $1
        AND table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY 
        ordinal_position
    `, [tableName]);
    
    logger.info(`Successfully retrieved columns for table "${tableName}"`, {
      columnCount: result.rows.length
    });
    
    res.json({
      success: true,
      data: {
        tableName,
        columns: result.rows
      }
    });
  } catch (error) {
    logger.error('Failed to retrieve table columns', {
      error: error.message,
      stack: error.stack,
      tableName: req.params.tableName
    });
    
    next(createError(
      'Failed to retrieve table columns',
      500,
      'DATABASE_QUERY_ERROR',
      { details: error.message }
    ));
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
    // Get database version
    const versionResult = await db.query('SELECT version()');
    const version = versionResult.rows[0].version;
    
    // Get active connections
    const connectionsResult = await db.query(`
      SELECT 
        count(*) as total,
        sum(CASE WHEN state = 'active' THEN 1 ELSE 0 END) as active,
        sum(CASE WHEN state = 'idle' THEN 1 ELSE 0 END) as idle
      FROM 
        pg_stat_activity
    `);
    const connections = connectionsResult.rows[0];
    
    // Get database size
    const sizeResult = await db.query(`
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as size,
        pg_database_size(current_database()) as size_bytes
    `);
    const dbSize = sizeResult.rows[0].size;
    const dbSizeBytes = parseInt(sizeResult.rows[0].size_bytes);
    
    // Get table count
    const tableCountResult = await db.query(`
      SELECT 
        count(*) as count
      FROM 
        information_schema.tables
      WHERE 
        table_schema NOT IN ('pg_catalog', 'information_schema')
        AND table_type = 'BASE TABLE'
    `);
    const tablesCount = parseInt(tableCountResult.rows[0].count);
    
    // Get largest tables
    const largestTablesResult = await db.query(`
      SELECT 
        table_schema || '.' || table_name as name,
        pg_size_pretty(pg_total_relation_size('"' || table_schema || '"."' || table_name || '"')) as size,
        pg_total_relation_size('"' || table_schema || '"."' || table_name || '"') as size_bytes,
        pg_stat_get_live_tuples('"' || table_schema || '"."' || table_name || '"'::regclass) as row_count_estimate
      FROM 
        information_schema.tables
      WHERE 
        table_schema NOT IN ('pg_catalog', 'information_schema')
        AND table_type = 'BASE TABLE'
      ORDER BY 
        pg_total_relation_size('"' || table_schema || '"."' || table_name || '"') DESC
      LIMIT 5
    `);
    
    logger.info('Successfully retrieved database status');
    
    res.json({
      success: true,
      data: {
        version,
        connections,
        dbSize,
        dbSizeBytes,
        tablesCount,
        largestTables: largestTablesResult.rows
      }
    });
  } catch (error) {
    logger.error('Failed to retrieve database status', {
      error: error.message,
      stack: error.stack
    });
    
    next(createError(
      'Failed to retrieve database status',
      500,
      'DATABASE_QUERY_ERROR',
      { details: error.message }
    ));
  }
}

module.exports = {
  testConnection,
  getTables,
  getTableColumns,
  getStatus
};