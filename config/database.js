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
  // Connection details come from environment variables:
  // PGUSER, PGHOST, PGPASSWORD, PGDATABASE, PGPORT
  // Or alternatively from the DATABASE_URL environment variable
  connectionTimeoutMillis: 5000, // 5 seconds
  idleTimeoutMillis: 30000, // 30 seconds
  max: 20 // Maximum number of clients in the pool
});

// Log pool errors
pool.on('error', (err, client) => {
  logger.error('PostgreSQL pool error', {
    error: err.message,
    stack: err.stack
  });
});

// Log pool connections (debug level)
pool.on('connect', () => {
  logger.debug('PostgreSQL pool connection created');
});

/**
 * Execute a database query with automatic connection management
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} - Query result
 */
async function query(text, params = []) {
  const start = Date.now();
  let client;
  
  try {
    // Get a client from the pool
    client = await pool.connect();
    
    // Execute query
    const result = await client.query(text, params);
    
    // Calculate query time
    const duration = Date.now() - start;
    
    // Log query (debug level)
    logger.debug('Executed query', {
      query: text,
      params,
      rowCount: result.rowCount,
      duration: `${duration}ms`
    });
    
    return result;
  } catch (error) {
    // Log error (error level)
    logger.error('Database query error', {
      query: text,
      params,
      error: error.message,
      stack: error.stack
    });
    
    throw error;
  } finally {
    // Release client back to the pool
    if (client) {
      client.release();
    }
  }
}

/**
 * Close all pooled connections
 * @returns {Promise<void>} - Resolution when all connections are closed
 */
async function end() {
  try {
    logger.info('Closing all database connections');
    await pool.end();
    logger.info('All database connections closed');
  } catch (error) {
    logger.error('Error closing database connections', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Initialize database with required tables if they don't exist
 * @returns {Promise<void>} - Resolution when initialization is complete 
 */
async function initDatabase() {
  try {
    logger.info('Initializing database tables if needed');
    
    // Create contacts table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        company_name VARCHAR(255),
        ip_address VARCHAR(50),
        user_agent TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    
    logger.info('Database initialization completed');
  } catch (error) {
    logger.error('Database initialization failed', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Check database connection status
 * @returns {Promise<boolean>} - True if connection successful
 */
async function checkConnection() {
  let client;
  
  try {
    // Get a client from the pool
    client = await pool.connect();
    
    // Execute simple query
    const result = await client.query('SELECT NOW() as now');
    
    // Check if result exists
    return result && result.rows && result.rows.length > 0;
  } catch (error) {
    logger.error('Database connection check failed', {
      error: error.message,
      stack: error.stack
    });
    return false;
  } finally {
    // Release client back to the pool
    if (client) {
      client.release();
    }
  }
}

module.exports = {
  query,
  end,
  initDatabase,
  checkConnection
};