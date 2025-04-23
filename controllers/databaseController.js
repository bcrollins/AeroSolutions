/**
 * Database Controller
 * 
 * This controller provides methods for database management and status.
 */

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
    const isConnected = await db.checkConnection();
    
    if (!isConnected) {
      return next(createError(
        'Database connection test failed',
        500,
        'DATABASE_CONNECTION_ERROR'
      ));
    }
    
    return res.json({
      success: true,
      data: {
        status: 'connected',
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    return next(createError(
      'Database connection error: ' + err.message,
      500,
      'DATABASE_ERROR'
    ));
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
    // Only allow in development or explicitly authorized
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SCHEMA_INIT !== 'true') {
      return next(createError(
        'Database initialization not allowed in production',
        403,
        'OPERATION_NOT_ALLOWED'
      ));
    }
    
    await db.initDatabase();
    
    return res.json({
      success: true,
      data: {
        message: 'Database schema initialized successfully',
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    logger.error('Failed to initialize database schema', {
      error: err.message,
      stack: err.stack
    });
    
    return next(createError(
      'Failed to initialize database schema: ' + err.message,
      500,
      'DATABASE_INIT_ERROR'
    ));
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
    // This query approach is not used directly since we need to handle tables that may not exist yet
    // Instead we'll iterate through tables manually
    /* Example of a direct query we're not using:
    const tableInfoQuery = `
      SELECT
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) AS column_count
      FROM
        information_schema.tables t
      WHERE
        table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY
        table_name;
    `;
    */
    
    // This query could fail if a table doesn't exist yet
    // So we'll get the table list first and then get counts if available
    const tableListResult = await db.query(`
      SELECT
        table_name
      FROM
        information_schema.tables 
      WHERE
        table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY
        table_name;
    `);
    
    const tables = [];
    
    // For each table, get row count and column info
    for (const tableRow of tableListResult.rows) {
      const tableName = tableRow.table_name;
      
      // Get column count
      const columnResult = await db.query(`
        SELECT COUNT(*) AS column_count
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [tableName]);
      
      // Try to get row count
      let rowCount = 0;
      try {
        const countResult = await db.query(`SELECT COUNT(*) AS row_count FROM "${tableName}"`);
        rowCount = parseInt(countResult.rows[0].row_count) || 0;
      } catch (countErr) {
        logger.warn(`Could not get row count for table ${tableName}`, {
          error: countErr.message
        });
      }
      
      tables.push({
        name: tableName,
        columns: parseInt(columnResult.rows[0].column_count) || 0,
        rows: rowCount
      });
    }
    
    return res.json({
      success: true,
      data: {
        tables,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    logger.error('Failed to get tables info', {
      error: err.message,
      stack: err.stack
    });
    
    return next(createError(
      'Failed to get database tables info: ' + err.message,
      500,
      'DATABASE_INFO_ERROR'
    ));
  }
}

module.exports = {
  checkStatus,
  initializeDatabase,
  getTablesInfo
};