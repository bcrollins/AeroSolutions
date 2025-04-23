/**
 * Database Controller
 * 
 * This controller provides functionality for database diagnostics
 * and management. It allows checking database status, viewing tables,
 * and examining table structures.
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
    logger.debug('Testing database connection');
    
    const result = await db.query('SELECT NOW() as timestamp');
    
    logger.info('Database connection test successful', {
      timestamp: result.rows[0].timestamp
    });
    
    res.json({
      success: true,
      message: 'Database connection successful',
      data: {
        timestamp: result.rows[0].timestamp
      }
    });
  } catch (error) {
    logger.error('Database connection test failed', {
      error: error.message,
      stack: error.stack
    });
    
    next(createError(
      'Database connection test failed: ' + error.message,
      500,
      'DATABASE_CONNECTION_ERROR'
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
    logger.debug('Getting database tables');
    
    const query = `
      SELECT 
        table_schema,
        table_name,
        pg_total_relation_size('"' || table_schema || '"."' || table_name || '"') AS size_in_bytes,
        pg_relation_size('"' || table_schema || '"."' || table_name || '"') AS table_size_in_bytes,
        pg_indexes_size('"' || table_schema || '"."' || table_name || '"') AS indexes_size_in_bytes,
        (SELECT reltuples FROM pg_class WHERE oid = ('"' || table_schema || '"."' || table_name || '"')::regclass) AS row_count_estimate
      FROM 
        information_schema.tables
      WHERE 
        table_schema NOT IN ('pg_catalog', 'information_schema') 
        AND table_type = 'BASE TABLE'
      ORDER BY 
        table_schema, table_name;
    `;
    
    const result = await db.query(query);
    
    // Format the response for better readability
    const tables = result.rows.map(table => ({
      table_schema: table.table_schema,
      table_name: table.table_name,
      size: formatBytes(table.size_in_bytes),
      table_size: formatBytes(table.table_size_in_bytes),
      indexes_size: formatBytes(table.indexes_size_in_bytes),
      row_count_estimate: parseInt(table.row_count_estimate)
    }));
    
    logger.info('Retrieved database tables', {
      count: tables.length
    });
    
    res.json({
      success: true,
      data: {
        tables
      }
    });
  } catch (error) {
    logger.error('Failed to get database tables', {
      error: error.message,
      stack: error.stack
    });
    
    next(createError(
      'Failed to get database tables: ' + error.message,
      500,
      'DATABASE_ERROR'
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
    
    // Validate table name to prevent SQL injection
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      return next(createError(
        'Invalid table name. Only alphanumeric characters and underscores are allowed.',
        400,
        'INVALID_TABLE_NAME'
      ));
    }
    
    logger.debug('Getting columns for table', { tableName });
    
    const query = `
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
        ordinal_position;
    `;
    
    const result = await db.query(query, [tableName]);
    
    if (result.rows.length === 0) {
      return next(createError(
        `Table '${tableName}' not found or has no columns`,
        404,
        'TABLE_NOT_FOUND'
      ));
    }
    
    logger.info('Retrieved table columns', {
      tableName,
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
    logger.error('Failed to get table columns', {
      error: error.message,
      stack: error.stack,
      tableName: req.params.tableName
    });
    
    next(createError(
      'Failed to get table columns: ' + error.message,
      500,
      'DATABASE_ERROR'
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
    logger.debug('Getting database status');
    
    // Get PostgreSQL version
    const versionQuery = 'SELECT version();';
    const versionResult = await db.query(versionQuery);
    const version = versionResult.rows[0].version;
    
    // Get current connections
    const connectionsQuery = `
      SELECT 
        count(*) AS total,
        sum(CASE WHEN state = 'active' THEN 1 ELSE 0 END) AS active,
        sum(CASE WHEN state = 'idle' THEN 1 ELSE 0 END) AS idle
      FROM 
        pg_stat_activity;
    `;
    const connectionsResult = await db.query(connectionsQuery);
    const connections = connectionsResult.rows[0];
    
    // Get database size
    const sizeQuery = `
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) AS size,
        pg_database_size(current_database()) AS size_bytes;
    `;
    const sizeResult = await db.query(sizeQuery);
    const dbSize = sizeResult.rows[0];
    
    // Get largest tables
    const tablesQuery = `
      SELECT 
        table_schema || '.' || table_name AS name,
        pg_size_pretty(pg_total_relation_size('"' || table_schema || '"."' || table_name || '"')) AS size,
        pg_total_relation_size('"' || table_schema || '"."' || table_name || '"') AS size_bytes,
        (SELECT reltuples FROM pg_class WHERE oid = ('"' || table_schema || '"."' || table_name || '"')::regclass) AS row_count_estimate
      FROM 
        information_schema.tables
      WHERE 
        table_schema NOT IN ('pg_catalog', 'information_schema') 
        AND table_type = 'BASE TABLE'
      ORDER BY 
        pg_total_relation_size('"' || table_schema || '"."' || table_name || '"') DESC
      LIMIT 5;
    `;
    const tablesResult = await db.query(tablesQuery);
    const largestTables = tablesResult.rows;
    
    // Get table count
    const countQuery = `
      SELECT 
        count(*) AS table_count
      FROM 
        information_schema.tables
      WHERE 
        table_schema NOT IN ('pg_catalog', 'information_schema') 
        AND table_type = 'BASE TABLE';
    `;
    const countResult = await db.query(countQuery);
    const tablesCount = parseInt(countResult.rows[0].table_count);
    
    logger.info('Retrieved database status');
    
    res.json({
      success: true,
      data: {
        version,
        connections: {
          total: parseInt(connections.total),
          active: parseInt(connections.active),
          idle: parseInt(connections.idle)
        },
        dbSize: dbSize.size,
        dbSizeBytes: parseInt(dbSize.size_bytes),
        tablesCount,
        largestTables: largestTables.map(table => ({
          name: table.name,
          size: table.size,
          sizeBytes: parseInt(table.size_bytes),
          rowCountEstimate: parseInt(table.row_count_estimate)
        }))
      }
    });
  } catch (error) {
    logger.error('Failed to get database status', {
      error: error.message,
      stack: error.stack
    });
    
    next(createError(
      'Failed to get database status: ' + error.message,
      500,
      'DATABASE_ERROR'
    ));
  }
}

/**
 * Format bytes to human-readable format
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted size string
 */
function formatBytes(bytes, decimals = 2) {
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

module.exports = {
  testConnection,
  getTables,
  getTableColumns,
  getStatus
};