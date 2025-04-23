/**
 * PostgreSQL Database Configuration
 * 
 * This module provides a connection pool for PostgreSQL database connections.
 * It uses environment variables for configuration to keep sensitive information secure.
 * 
 * The connection pool automatically manages database connections for efficiency:
 * - Creates connections on demand up to a maximum limit
 * - Reuses existing connections when available
 * - Handles connection errors and reconnection
 * - Times out idle connections to conserve resources
 */

const { Pool } = require('pg');
const logger = require('./logger');

// Load environment variables with fallbacks for development
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  // SSL configuration for production environments
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  // Connection pool settings
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '10'), // Maximum connections in pool
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'), // Close idle connections after 30 seconds
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000') // Connection attempt timeout
};

// Create the connection pool
const pool = new Pool(dbConfig);

// Connection error handling
pool.on('error', (err) => {
  logger.error('Unexpected error on idle database connection', {
    error: err.message,
    stack: err.stack
  });
  // Don't exit process here, instead let pool handle reconnection
});

// Pool connection status monitoring
pool.on('connect', (client) => {
  logger.debug('New database connection established');
});

/**
 * Execute a query with parameters
 * @param {string} text - The SQL query text
 * @param {Array} params - The query parameters
 * @returns {Promise} - Query result
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries (over 1000ms) for performance monitoring
    if (duration > 1000) {
      logger.warn('Slow query detected', {
        query: text,
        duration,
        rows: result.rowCount,
        params
      });
    } else {
      logger.debug('Query executed', { 
        duration,
        rows: result.rowCount
      });
    }
    
    return result;
  } catch (error) {
    logger.error('Database query error', {
      query: text,
      params,
      error: error.message,
      code: error.code,
      duration: Date.now() - start
    });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * @returns {Promise} - Database client
 */
async function getClient() {
  const client = await pool.connect();
  const originalRelease = client.release;
  
  // Wrap release function to keep track of connection management
  client.release = () => {
    logger.debug('Client returned to pool');
    return originalRelease.call(client);
  };
  
  // Add convenience transaction wrapper to client
  client.transactionWrapper = async (callback) => {
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };
  
  return client;
}

/**
 * Test the database connection with a simple query
 * @returns {Promise<boolean>} - True if connection successful
 */
async function testConnection() {
  try {
    const result = await query('SELECT NOW() as current_time');
    logger.info('Database connection successful', {
      timestamp: result.rows[0].current_time
    });
    return true;
  } catch (error) {
    logger.error('Database connection test failed', {
      error: error.message,
      stack: error.stack,
      code: error.code
    });
    return false;
  }
}

/**
 * Close the pool and end all connections
 * @returns {Promise<void>}
 */
async function end() {
  try {
    await pool.end();
    logger.info('Database connection pool closed');
  } catch (error) {
    logger.error('Error closing database connections', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

module.exports = {
  query,
  getClient,
  testConnection,
  end,
  pool
};