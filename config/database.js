/**
 * Database Configuration
 * 
 * This module configures and manages the database connection pool
 * for PostgreSQL using the pg library.
 */

const { Pool } = require('pg');
const logger = require('./logger');

// Create connection pool using environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: process.env.PG_MAX_CONNECTIONS ? parseInt(process.env.PG_MAX_CONNECTIONS) : 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

// Log connection errors
pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', {
    error: err.message,
    stack: err.stack
  });
});

/**
 * Execute a database query with automatic connection management
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} - Query result
 */
async function query(text, params = []) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log query for debugging (obfuscate sensitive data in params)
    if (process.env.LOG_QUERIES === 'true') {
      logger.debug('Executed query', {
        text,
        params: params.map(p => typeof p === 'string' && p.length > 20 ? p.substring(0, 10) + '...' : p),
        rowCount: res.rowCount,
        duration
      });
    }
    
    return res;
  } catch (err) {
    // Log the error with query details
    logger.error('Database query error', {
      text,
      error: err.message,
      code: err.code
    });
    throw err;
  }
}

/**
 * Close all pooled connections
 * @returns {Promise<void>} - Resolution when all connections are closed
 */
async function end() {
  return pool.end();
}

/**
 * Initialize database with required tables if they don't exist
 * @returns {Promise<void>} - Resolution when initialization is complete 
 */
async function initDatabase() {
  // Create tables if they don't exist
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS api_usage_logs (
      id SERIAL PRIMARY KEY,
      endpoint VARCHAR(255) NOT NULL,
      ip_address VARCHAR(100),
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      tokens_used INTEGER DEFAULT 0,
      request_time INTEGER NOT NULL,
      success BOOLEAN DEFAULT TRUE,
      error_type VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage_logs(endpoint);
    CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage_logs(created_at);
  `);
  
  logger.info('Database initialized successfully');
  return true;
}

/**
 * Check database connection status
 * @returns {Promise<boolean>} - True if connection successful
 */
async function checkConnection() {
  try {
    const result = await query('SELECT 1');
    return result.rows.length > 0;
  } catch (err) {
    logger.error('Database connection check failed', {
      error: err.message,
      stack: err.stack
    });
    return false;
  }
}

module.exports = {
  query,
  end,
  initDatabase,
  checkConnection
};