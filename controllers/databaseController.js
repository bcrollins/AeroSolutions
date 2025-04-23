/**
 * Database Controller
 * 
 * Handles logic for database-related routes
 */

const pool = require('../config/database');

const databaseController = {
  /**
   * Test database connection
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async testConnection(req, res) {
    try {
      // Use the already imported pool from db.ts
      const result = await pool.query('SELECT NOW() as now');
      
      res.status(200).json({ 
        status: 'success', 
        time: { now: result.rows[0].now },
        message: 'Database connection successful'
      });
    } catch (err) {
      console.error('Database connection test failed:', err);
      
      res.status(500).json({ 
        status: 'error', 
        message: err.message,
        error: 'Database connection failed'
      });
    }
  },

  /**
   * Get database tables
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTables(req, res) {
    try {
      const result = await pool.query(`
        SELECT 
          table_name,
          (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
        FROM 
          information_schema.tables t
        WHERE 
          table_schema = 'public'
        ORDER BY 
          table_name
      `);
      
      res.status(200).json({
        status: 'success',
        tables: result.rows,
        count: result.rows.length,
        message: 'Database tables retrieved successfully'
      });
    } catch (err) {
      console.error('Get database tables failed:', err);
      
      res.status(500).json({
        status: 'error',
        message: err.message,
        error: 'Failed to get database tables'
      });
    }
  },

  /**
   * Get table columns
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTableColumns(req, res) {
    try {
      const { tableName } = req.params;
      
      // Validate table name to prevent SQL injection
      if (!tableName.match(/^[a-zA-Z0-9_]+$/)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid table name'
        });
      }
      
      const result = await pool.query(`
        SELECT 
          column_name, 
          data_type,
          is_nullable,
          column_default
        FROM 
          information_schema.columns
        WHERE 
          table_name = $1
          AND table_schema = 'public'
        ORDER BY 
          ordinal_position
      `, [tableName]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: `Table '${tableName}' not found`
        });
      }
      
      res.status(200).json({
        status: 'success',
        table: tableName,
        columns: result.rows,
        count: result.rows.length,
        message: `Columns for table '${tableName}' retrieved successfully`
      });
    } catch (err) {
      console.error('Get table columns failed:', err);
      
      res.status(500).json({
        status: 'error',
        message: err.message,
        error: 'Failed to get table columns'
      });
    }
  },

  /**
   * Get database status information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getStatus(req, res) {
    try {
      // Get database version
      const versionResult = await pool.query('SELECT version()');
      
      // Get connection count
      const connectionResult = await pool.query('SELECT count(*) as connection_count FROM pg_stat_activity');
      
      // Get database size
      const sizeResult = await pool.query(`
        SELECT pg_size_pretty(pg_database_size(current_database())) as database_size
      `);
      
      // Get table counts
      const tableCountResult = await pool.query(`
        SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public'
      `);
      
      res.status(200).json({
        status: 'success',
        database_info: {
          version: versionResult.rows[0].version,
          connection_count: parseInt(connectionResult.rows[0].connection_count),
          database_size: sizeResult.rows[0].database_size,
          table_count: parseInt(tableCountResult.rows[0].table_count)
        },
        message: 'Database status retrieved successfully'
      });
    } catch (err) {
      console.error('Get database status failed:', err);
      
      res.status(500).json({
        status: 'error',
        message: err.message,
        error: 'Failed to get database status'
      });
    }
  }
};

module.exports = databaseController;