/**
 * Database Controller
 * 
 * Handles logic for database-related routes
 */
const db = require('../config/database');
const logger = require('../config/logger');
const { ServiceUnavailableError, NotFoundError, ValidationError } = require('../middlewares/errorHandler');

/**
 * Test database connection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function testConnection(req, res, next) {
  try {
    const isConnected = await db.testConnection();
    
    if (!isConnected) {
      throw new ServiceUnavailableError('Failed to connect to database');
    }
    
    return res.json({
      success: true,
      data: {
        connected: true,
        message: 'Successfully connected to database',
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all tables
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getTables(req, res, next) {
  try {
    // Query for all tables in the public schema
    const result = await db.query(`
      SELECT 
        table_name,
        (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) AS column_count,
        (
          SELECT pg_size_pretty(pg_total_relation_size(quote_ident(t.table_name)))
          FROM information_schema.tables
          WHERE table_name = t.table_name
          LIMIT 1
        ) AS size
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name ASC
    `);
    
    return res.json({
      success: true,
      data: {
        tables: result.rows,
        count: result.rowCount
      }
    });
  } catch (error) {
    logger.logDatabaseError('Get tables', error, { query: 'Get tables query' });
    next(error);
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
    
    if (!tableName) {
      throw new ValidationError('Table name is required');
    }
    
    // First check if table exists
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      ) AS exists
    `, [tableName]);
    
    if (!tableCheck.rows[0].exists) {
      throw new NotFoundError(`Table '${tableName}' not found`);
    }
    
    // Get columns
    const result = await db.query(`
      SELECT 
        column_name, 
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);
    
    // Get primary key info
    const pkResult = await db.query(`
      SELECT
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public'
      AND tc.table_name = $1
      AND tc.constraint_type = 'PRIMARY KEY'
    `, [tableName]);
    
    // Get foreign key info
    const fkResult = await db.query(`
      SELECT
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_schema = 'public'
      AND tc.table_name = $1
      AND tc.constraint_type = 'FOREIGN KEY'
    `, [tableName]);
    
    // Aggregate primary key and foreign key info into column data
    const primaryKeys = pkResult.rows.map(row => row.column_name);
    const foreignKeys = fkResult.rows.reduce((acc, row) => {
      acc[row.column_name] = {
        foreignTable: row.foreign_table_name,
        foreignColumn: row.foreign_column_name
      };
      return acc;
    }, {});
    
    // Enhance column data with PK and FK info
    const columns = result.rows.map(column => ({
      ...column,
      isPrimaryKey: primaryKeys.includes(column.column_name),
      foreignKey: foreignKeys[column.column_name] || null
    }));
    
    return res.json({
      success: true,
      data: {
        table: tableName,
        columns,
        primaryKeys,
        foreignKeys: Object.keys(foreignKeys),
        count: result.rowCount
      }
    });
  } catch (error) {
    logger.logDatabaseError('Get table columns', error, { tableName: req.params.tableName });
    next(error);
  }
}

/**
 * Get database status and statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getStatus(req, res, next) {
  try {
    // Get database version
    const versionResult = await db.query('SELECT version()');
    
    // Get database size
    const sizeResult = await db.query('SELECT pg_size_pretty(pg_database_size(current_database()))');
    
    // Get connection info
    const connectionsResult = await db.query(`
      SELECT 
        count(*) AS total_connections,
        count(*) FILTER (WHERE state = 'active') AS active_connections,
        count(*) FILTER (WHERE state = 'idle') AS idle_connections
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `);
    
    // Get table count
    const tablesResult = await db.query(`
      SELECT count(*) AS table_count
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `);
    
    // Get index info
    const indexResult = await db.query(`
      SELECT count(*) AS index_count
      FROM pg_indexes
      WHERE schemaname = 'public'
    `);
    
    return res.json({
      success: true,
      data: {
        version: versionResult.rows[0].version,
        size: sizeResult.rows[0].pg_size_pretty,
        connections: connectionsResult.rows[0],
        tables: parseInt(tablesResult.rows[0].table_count),
        indexes: parseInt(indexResult.rows[0].index_count),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.logDatabaseError('Get database status', error, {});
    next(error);
  }
}

module.exports = {
  testConnection,
  getTables,
  getTableColumns,
  getStatus
};