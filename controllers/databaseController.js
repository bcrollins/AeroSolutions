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
    const result = await db.testConnection();
    
    res.json({
      success: true,
      data: {
        connected: result,
        connectionString: process.env.DATABASE_URL ? 'configured' : 'missing',
        timestamp: new Date().toISOString()
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
 * Get all tables
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getTables(req, res, next) {
  try {
    // Query to get all tables in the current database
    const query = `
      SELECT 
        table_name, 
        pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size,
        pg_relation_size(quote_ident(table_name)) as raw_size,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
        obj_description(quote_ident(table_name)::regclass::oid, 'pg_class') as description
      FROM 
        information_schema.tables t
      WHERE 
        table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY 
        raw_size DESC;
    `;
    
    const result = await db.query(query);
    
    res.json({
      success: true,
      data: {
        tables: result.rows,
        count: result.rowCount
      }
    });
  } catch (error) {
    logger.error('Failed to get tables list', {
      error: error.message,
      stack: error.stack
    });
    
    next(createError(
      'Failed to get tables list: ' + error.message,
      500,
      'DATABASE_ERROR'
    ));
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
    
    // Validate that table exists
    const tableCheckQuery = `
      SELECT to_regclass('public.${tableName}') IS NOT NULL as exists;
    `;
    
    const tableExists = await db.query(tableCheckQuery);
    
    if (!tableExists.rows[0].exists) {
      return next(createError(
        `Table '${tableName}' does not exist`,
        404,
        'TABLE_NOT_FOUND'
      ));
    }
    
    // Query to get detailed column information
    const columnsQuery = `
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length,
        column_default,
        is_nullable,
        CASE 
          WHEN pk.column_name IS NOT NULL THEN true 
          ELSE false 
        END as is_primary_key,
        obj_description(
          pg_attribute.attrelid, 
          pg_attribute.attnum
        ) as description
      FROM 
        information_schema.columns
      LEFT JOIN (
        SELECT 
          pg_attribute.attname as column_name
        FROM 
          pg_index, pg_class, pg_attribute, pg_namespace
        WHERE 
          pg_class.oid = '${tableName}'::regclass
          AND indrelid = pg_class.oid 
          AND pg_class.relnamespace = pg_namespace.oid
          AND pg_attribute.attrelid = pg_class.oid
          AND pg_attribute.attnum = any(pg_index.indkey)
          AND indisprimary
      ) pk ON pk.column_name = columns.column_name
      LEFT JOIN 
        pg_catalog.pg_attribute ON 
          pg_attribute.attname = columns.column_name
          AND pg_attribute.attrelid = '${tableName}'::regclass
      WHERE 
        table_name = '${tableName}'
        AND table_schema = 'public'
      ORDER BY 
        ordinal_position;
    `;
    
    const result = await db.query(columnsQuery);
    
    // Query to get table indexes
    const indexesQuery = `
      SELECT
        idx.indexname as index_name,
        idx.indexdef as index_definition,
        idx_stat.idx_scan as usage_count,
        pg_size_pretty(pg_relation_size(quote_ident(idx.indexname)::regclass)) as size
      FROM
        pg_indexes idx
      LEFT JOIN
        pg_stat_user_indexes idx_stat ON idx.indexname = idx_stat.indexrelname
      WHERE
        idx.tablename = '${tableName}'
      ORDER BY
        idx_stat.idx_scan DESC NULLS LAST;
    `;
    
    const indexesResult = await db.query(indexesQuery);
    
    // Get approximate row count
    const rowCountQuery = `
      SELECT 
        reltuples::bigint as row_count_estimate
      FROM 
        pg_class
      WHERE 
        oid = '${tableName}'::regclass;
    `;
    
    const rowCountResult = await db.query(rowCountQuery);
    
    res.json({
      success: true,
      data: {
        tableName,
        columns: result.rows,
        columnCount: result.rowCount,
        indexes: indexesResult.rows,
        indexCount: indexesResult.rowCount,
        rowCountEstimate: rowCountResult.rows[0]?.row_count_estimate || 0
      }
    });
  } catch (error) {
    logger.error(`Failed to get columns for table '${req.params.tableName}'`, {
      error: error.message,
      stack: error.stack
    });
    
    next(createError(
      `Failed to get columns for table '${req.params.tableName}': ${error.message}`,
      500,
      'DATABASE_ERROR'
    ));
  }
}

/**
 * Get database status and statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getStatus(req, res, next) {
  try {
    // Get database size
    const dbSizeQuery = `SELECT pg_size_pretty(pg_database_size(current_database())) as size;`;
    const dbSizeResult = await db.query(dbSizeQuery);
    
    // Get connection count and client info
    const connectionsQuery = `
      SELECT 
        count(*) as connection_count,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM 
        pg_stat_activity 
      WHERE 
        datname = current_database();
    `;
    const connectionsResult = await db.query(connectionsQuery);
    
    // Get table count
    const tableCountQuery = `
      SELECT count(*) as table_count
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `;
    const tableCountResult = await db.query(tableCountQuery);
    
    // Get transaction statistics
    const transactionStatsQuery = `
      SELECT 
        sum(xact_commit) as commits, 
        sum(xact_rollback) as rollbacks,
        sum(blks_read) as blocks_read,
        sum(blks_hit) as blocks_hit,
        sum(tup_returned) as rows_returned,
        sum(tup_fetched) as rows_fetched,
        sum(tup_inserted) as rows_inserted,
        sum(tup_updated) as rows_updated,
        sum(tup_deleted) as rows_deleted
      FROM 
        pg_stat_database 
      WHERE 
        datname = current_database();
    `;
    const transactionStatsResult = await db.query(transactionStatsQuery);
    
    // Calculate cache hit ratio
    const cacheHitRatio = transactionStatsResult.rows[0].blocks_hit / 
      (transactionStatsResult.rows[0].blocks_read + transactionStatsResult.rows[0].blocks_hit);
    
    res.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        databaseName: process.env.PGDATABASE || 'unknown',
        databaseSize: dbSizeResult.rows[0].size,
        connections: {
          total: parseInt(connectionsResult.rows[0].connection_count),
          active: parseInt(connectionsResult.rows[0].active_connections),
          idle: parseInt(connectionsResult.rows[0].idle_connections)
        },
        tables: {
          count: parseInt(tableCountResult.rows[0].table_count)
        },
        transactions: {
          commits: parseInt(transactionStatsResult.rows[0].commits),
          rollbacks: parseInt(transactionStatsResult.rows[0].rollbacks),
          cacheHitRatio: cacheHitRatio.toFixed(4)
        },
        operations: {
          rowsReturned: parseInt(transactionStatsResult.rows[0].rows_returned),
          rowsFetched: parseInt(transactionStatsResult.rows[0].rows_fetched),
          rowsInserted: parseInt(transactionStatsResult.rows[0].rows_inserted),
          rowsUpdated: parseInt(transactionStatsResult.rows[0].rows_updated),
          rowsDeleted: parseInt(transactionStatsResult.rows[0].rows_deleted)
        }
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

module.exports = {
  testConnection,
  getTables,
  getTableColumns,
  getStatus
};