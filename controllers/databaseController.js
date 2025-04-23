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
    
    if (isConnected) {
      logger.info('Database status check: Connected');
      res.json({
        success: true,
        data: {
          status: 'connected',
          timestamp: new Date().toISOString()
        }
      });
    } else {
      logger.warn('Database status check: Disconnected');
      res.status(503).json({
        success: false,
        error: {
          message: 'Database is not connected',
          code: 'DATABASE_DISCONNECTED'
        }
      });
    }
  } catch (error) {
    logger.error('Database status check error', {
      error: error.message,
      stack: error.stack
    });
    next(createError('Error checking database status', 500, 'DATABASE_STATUS_ERROR'));
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
    logger.info('Database initialization requested');
    
    await db.initDatabase();
    
    res.json({
      success: true,
      data: {
        message: 'Database initialized successfully',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Database initialization error', {
      error: error.message,
      stack: error.stack
    });
    next(createError('Error initializing database', 500, 'DATABASE_INIT_ERROR'));
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
    // Query to get the list of tables
    const tablesQuery = `
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM 
        information_schema.tables t
      WHERE 
        table_schema = 'public'
      ORDER BY 
        table_name
    `;
    
    const tablesResult = await db.query(tablesQuery);
    
    const tables = [];
    
    // For each table, get row count and column details
    for (const table of tablesResult.rows) {
      // Get row count
      const countResult = await db.query(`SELECT COUNT(*) FROM "${table.table_name}"`);
      const rowCount = parseInt(countResult.rows[0].count);
      
      // Get column details
      const columnsQuery = `
        SELECT 
          column_name, 
          data_type,
          is_nullable
        FROM 
          information_schema.columns
        WHERE 
          table_name = $1
        ORDER BY 
          ordinal_position
      `;
      
      const columnsResult = await db.query(columnsQuery, [table.table_name]);
      
      tables.push({
        name: table.table_name,
        rowCount,
        columns: columnsResult.rows
      });
    }
    
    res.json({
      success: true,
      data: {
        tables,
        count: tables.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching database tables info', {
      error: error.message,
      stack: error.stack
    });
    
    next(createError('Error retrieving database information', 500, 'DATABASE_INFO_ERROR'));
  }
}

module.exports = {
  checkStatus,
  initializeDatabase,
  getTablesInfo
};