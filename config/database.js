/**
 * PostgreSQL Database Configuration
 * 
 * This module provides a connection pool for PostgreSQL database connections.
 * It uses environment variables for configuration to keep sensitive information secure.
 */

const { Pool } = require('pg');
const logger = require('./logger');

// Get database configuration from environment variables
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  // SSL options for production environments
  ssl: process.env.NODE_ENV === 'production' ? 
    { rejectUnauthorized: false } : 
    false,
  // Maximum number of clients in the pool
  max: parseInt(process.env.PG_MAX_CLIENTS || '10'),
  // How long a client can stay idle before being closed
  idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT || '30000'),
  // How long to wait for a connection from the pool
  connectionTimeoutMillis: parseInt(process.env.PG_CONNECTION_TIMEOUT || '5000')
};

// Create a new pool instance
const pool = new Pool(dbConfig);

// Register pool error event handler
pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client', {
    error: err.message,
    stack: err.stack
  });
  process.exit(-1); // exit in case of critical errors
});

// Register pool connect event handler for debugging
pool.on('connect', (client) => {
  logger.debug('New client connected to PostgreSQL');
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
    
    logger.debug('Executed query', {
      query: text.replace(/\s+/g, ' ').trim(),
      duration,
      rows: result.rowCount
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    
    logger.error('Query error', {
      query: text.replace(/\s+/g, ' ').trim(),
      params,
      duration,
      error: error.message,
      stack: error.stack
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
  
  // Override client release method to track release events
  client.release = () => {
    logger.debug('Client returned to pool');
    originalRelease.apply(client);
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
    logger.info('Database connection test successful', {
      currentTime: result.rows[0].current_time
    });
    return true;
  } catch (error) {
    logger.error('Database connection test failed', {
      error: error.message,
      stack: error.stack
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
    logger.info('Database pool has ended and all connections are closed');
  } catch (error) {
    logger.error('Error closing database pool', {
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