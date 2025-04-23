/**
 * Database Controller
 * 
 * Handles logic for database-related routes
 */

const db = require('../config/database');
const logger = require('../config/logger');
const { createError } = require('../middlewares/errorHandler');

/**
 * Test database connection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function testConnection(req, res, next) {
  try {
    const isConnected = await db.testConnection();
    
    if (isConnected) {
      return res.json({
        success: true,
        message: 'Database connection successful'
      });
    } else {
      return next(createError('Database connection failed', 'DATABASE_ERROR', 500));
    }
  } catch (error) {
    logger.error('Database connection test error', {
      error: error.message,
      stack: error.stack
    });
    
    return next(createError(`Database connection failed: ${error.message}`, 'DATABASE_ERROR', 500));
  }
}

/**
 * Get all tables
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getTables(req, res, next) {
  try {
    // SQL query to get all tables in the public schema
    const query = `
      SELECT 
        table_name 
      FROM 
        information_schema.tables 
      WHERE 
        table_schema = 'public' 
      ORDER BY 
        table_name;
    `;
    
    const result = await db.query(query);
    
    // Extract table names
    const tables = result.rows.map(row => row.table_name);
    
    logger.info('Retrieved database tables', {
      count: tables.length
    });
    
    return res.json({
      success: true,
      data: {
        tables,
        count: tables.length
      }
    });
  } catch (error) {
    logger.error('Error retrieving database tables', {
      error: error.message,
      stack: error.stack
    });
    
    return next(createError(`Error retrieving database tables: ${error.message}`, 'DATABASE_ERROR', 500));
  }
}

/**
 * Get columns for specific table
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getTableColumns(req, res, next) {
  try {
    const { tableName } = req.params;
    
    // Validate input to prevent SQL injection
    // Even though we're using parameterized queries, this is an extra safeguard
    if (!tableName.match(/^[a-zA-Z0-9_]+$/)) {
      return next(createError('Invalid table name', 'VALIDATION_ERROR', 400));
    }
    
    // SQL query to get columns for the specified table
    const query = `
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length
      FROM 
        information_schema.columns 
      WHERE 
        table_schema = 'public' 
        AND table_name = $1 
      ORDER BY 
        ordinal_position;
    `;
    
    const result = await db.query(query, [tableName]);
    
    if (result.rows.length === 0) {
      return next(createError(`Table '${tableName}' not found or has no columns`, 'NOT_FOUND', 404));
    }
    
    logger.info(`Retrieved columns for table '${tableName}'`, {
      count: result.rows.length
    });
    
    return res.json({
      success: true,
      data: {
        table: tableName,
        columns: result.rows,
        count: result.rows.length
      }
    });
  } catch (error) {
    logger.error('Error retrieving table columns', {
      error: error.message,
      stack: error.stack,
      tableName: req.params.tableName
    });
    
    return next(createError(`Error retrieving table columns: ${error.message}`, 'DATABASE_ERROR', 500));
  }
}

/**
 * Get database status and statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getStatus(req, res, next) {
  try {
    // SQL queries to get database statistics
    const versionQuery = 'SELECT version();';
    const sizeQuery = `
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as db_size;
    `;
    const tablesQuery = `
      SELECT 
        COUNT(*) as table_count 
      FROM 
        information_schema.tables 
      WHERE 
        table_schema = 'public';
    `;
    const connectionsQuery = `
      SELECT 
        count(*) as connection_count 
      FROM 
        pg_stat_activity;
    `;
    
    // Execute queries in parallel
    const [versionResult, sizeResult, tablesResult, connectionsResult] = await Promise.all([
      db.query(versionQuery),
      db.query(sizeQuery),
      db.query(tablesQuery),
      db.query(connectionsQuery)
    ]);
    
    // Extra query to get table sizes (executes after retrieving basic info)
    const tableSizesQuery = `
      SELECT 
        table_name, 
        pg_size_pretty(pg_total_relation_size('"' || table_name || '"')) as size,
        pg_relation_size('"' || table_name || '"') as raw_size
      FROM 
        information_schema.tables 
      WHERE 
        table_schema = 'public' 
      ORDER BY 
        pg_relation_size('"' || table_name || '"') DESC 
      LIMIT 10;
    `;
    
    const tableSizesResult = await db.query(tableSizesQuery);
    
    logger.info('Retrieved database status information');
    
    return res.json({
      success: true,
      data: {
        version: versionResult.rows[0].version,
        size: sizeResult.rows[0].db_size,
        tables: {
          count: parseInt(tablesResult.rows[0].table_count),
          top10BySize: tableSizesResult.rows
        },
        connections: parseInt(connectionsResult.rows[0].connection_count),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error retrieving database status', {
      error: error.message,
      stack: error.stack
    });
    
    return next(createError(`Error retrieving database status: ${error.message}`, 'DATABASE_ERROR', 500));
  }
}

module.exports = {
  testConnection,
  getTables,
  getTableColumns,
  getStatus
};