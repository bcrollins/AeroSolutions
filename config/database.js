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
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Maximum number of clients in the pool
  max: parseInt(process.env.DB_POOL_MAX || '10', 10),
  // Maximum time (ms) a client can stay idle before being closed
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  // Maximum time (ms) to wait for a client to become available
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000', 10),
};

// Create a pool of connections
const pool = new Pool(dbConfig);

// Error handler for unexpected pool errors
pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', { error: err.message, stack: err.stack });
});

// Log pool creation
logger.info('Database pool created', { 
  host: process.env.PGHOST || 'from connection string',
  database: process.env.PGDATABASE || 'from connection string',
  max: dbConfig.max,
  idleTimeoutMillis: dbConfig.idleTimeoutMillis,
  connectionTimeoutMillis: dbConfig.connectionTimeoutMillis
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
    
    // Log query info (excluding sensitive parameters)
    logger.debug('Executed query', {
      query: text,
      rows: result.rowCount,
      duration: `${duration}ms`
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    
    // Log query error
    logger.error('Query error', {
      query: text,
      error: error.message,
      code: error.code,
      duration: `${duration}ms`
    });
    
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * @returns {Promise} - Database client
 */
async function getClient() {
  try {
    const client = await pool.connect();
    const originalRelease = client.release;
    
    // Override the release method to log the duration
    const startTime = Date.now();
    client.release = () => {
      const duration = Date.now() - startTime;
      logger.debug('Client released', { duration: `${duration}ms` });
      originalRelease.apply(client);
    };
    
    logger.debug('Client acquired');
    return client;
  } catch (error) {
    logger.error('Error acquiring client', { error: error.message });
    throw error;
  }
}

/**
 * Test the database connection with a simple query
 * @returns {Promise<boolean>} - True if connection successful
 */
async function testConnection() {
  try {
    const result = await query('SELECT NOW()');
    logger.info('Database connection test successful', {
      timestamp: result.rows[0].now,
    });
    return true;
  } catch (error) {
    logger.error('Database connection test failed', {
      error: error.message,
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
    logger.info('Database pool has ended and all connections are closed');
  } catch (error) {
    logger.error('Error closing database pool', { error: error.message });
    throw error;
  }
}

module.exports = {
  query,
  getClient,
  testConnection,
  end,
  pool,
};