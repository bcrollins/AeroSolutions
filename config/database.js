/**
 * PostgreSQL Database Configuration
 * 
 * This module provides a connection pool for PostgreSQL database connections.
 * It uses environment variables for configuration to keep sensitive information secure.
 */
const { Pool } = require('pg');
const logger = require('./logger');

// Get database connection details from environment variables
const connectionString = process.env.DATABASE_URL;

// Basic validation
if (!connectionString) {
  logger.error('DATABASE_URL environment variable is not set');
  throw new Error('DATABASE_URL environment variable is required');
}

// Configure connection pool
const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: parseInt(process.env.PG_MAX_CONNECTIONS, 10) || 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
});

// Log pool events
pool.on('connect', () => {
  logger.debug('New client connected to PostgreSQL pool');
});

pool.on('error', (err) => {
  logger.logDatabaseError('Pool error', err, { connectionString: 'REDACTED' });
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
      text, 
      params, 
      duration, 
      rowCount: result.rowCount 
    });
    
    return result;
  } catch (error) {
    logger.logDatabaseError('Query execution', error, { 
      query: text, 
      params 
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
  
  // Override the release method to track release time
  client.release = () => {
    logger.debug('Client returned to pool');
    return originalRelease.apply(client);
  };
  
  return client;
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
    logger.error('Database connection test failed', { error: error.message });
    return false;
  }
}

module.exports = {
  query,
  getClient,
  testConnection,
  pool, // Exported for direct use if needed
};