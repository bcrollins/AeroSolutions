/**
 * Database Controller
 * 
 * Handles logic for database-related routes
 */

const { pool, testConnection } = require('../config/database');

class DatabaseController {
  /**
   * Test database connection
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async testConnection(req, res) {
    try {
      const connectionResult = await testConnection();
      
      if (connectionResult) {
        res.json({
          success: true,
          message: `Connected to PostgreSQL database (${process.env.PGDATABASE}) at ${process.env.PGHOST}:${process.env.PGPORT}`
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to connect to the database'
        });
      }
    } catch (error) {
      console.error('Database connection test error:', error);
      res.status(500).json({
        success: false,
        message: 'Error testing database connection',
        error: error.message
      });
    }
  }
  
  /**
   * Get database tables
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTables(req, res) {
    try {
      const result = await pool.query(
        `SELECT table_name FROM information_schema.tables 
         WHERE table_schema = 'public' 
         ORDER BY table_name`
      );
      
      const tables = result.rows.map(row => row.table_name);
      
      res.json({
        success: true,
        tables
      });
    } catch (error) {
      console.error('Error getting database tables:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving database tables',
        error: error.message
      });
    }
  }
  
  /**
   * Get table columns
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTableColumns(req, res) {
    try {
      const { tableName } = req.params;
      
      if (!tableName) {
        return res.status(400).json({
          success: false,
          message: 'Table name is required'
        });
      }
      
      // Sanitize table name to prevent SQL injection
      if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid table name'
        });
      }
      
      const result = await pool.query(
        `SELECT column_name, data_type, is_nullable, column_default
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1
         ORDER BY ordinal_position`,
        [tableName]
      );
      
      res.json({
        success: true,
        table: tableName,
        columns: result.rows
      });
    } catch (error) {
      console.error('Error getting table columns:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving table columns',
        error: error.message
      });
    }
  }
  
  /**
   * Get database status information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getStatus(req, res) {
    try {
      // Get database version
      const versionResult = await pool.query('SELECT version()');
      const version = versionResult.rows[0].version;
      
      // Get number of connections
      const connectionsResult = await pool.query(
        `SELECT count(*) as active_connections 
         FROM pg_stat_activity`
      );
      const connections = parseInt(connectionsResult.rows[0].active_connections);
      
      // Get database size
      const sizeResult = await pool.query(
        `SELECT pg_size_pretty(pg_database_size(current_database())) as size`
      );
      const size = sizeResult.rows[0].size;
      
      // Get table counts
      const tablesResult = await pool.query(
        `SELECT count(*) as table_count 
         FROM information_schema.tables 
         WHERE table_schema = 'public'`
      );
      const tableCount = parseInt(tablesResult.rows[0].table_count);
      
      res.json({
        success: true,
        version,
        connections,
        size,
        tableCount,
        host: process.env.PGHOST,
        port: process.env.PGPORT,
        database: process.env.PGDATABASE,
        user: process.env.PGUSER
      });
    } catch (error) {
      console.error('Error getting database status:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving database status',
        error: error.message
      });
    }
  }
}

module.exports = new DatabaseController();