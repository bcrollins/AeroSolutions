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
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  // Pool configuration for better performance
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10)
};

// Create a pool for handling database connections
const pool = new Pool(dbConfig);

// Log database connection errors
pool.on('error', (err) => {
  logger.error('Unexpected database error', { error: err.message, stack: err.stack });
});

// Log when new connections are created (only in development)
if (process.env.NODE_ENV !== 'production') {
  pool.on('connect', () => {
    logger.debug('New database connection established');
  });
}

/**
 * Execute a query with parameters
 * @param {string} text - The SQL query text
 * @param {Array} params - The query parameters
 * @returns {Promise} - Query result
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    // Redact sensitive queries (e.g., those containing passwords)
    const redactedText = text.toLowerCase().includes('password') 
      ? '[REDACTED PASSWORD QUERY]' 
      : text;
    
    // Log the query in development
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('Executing query', {
        query: redactedText.substring(0, 100) + (redactedText.length > 100 ? '...' : ''),
        parameters: params ? `${params.length} parameters` : 'no parameters'
      });
    }
    
    const res = await pool.query(text, params);
    
    // Log the execution time
    const duration = Date.now() - start;
    logger.debug('Query complete', {
      duration,
      rowCount: res.rowCount
    });
    
    return res;
  } catch (err) {
    const duration = Date.now() - start;
    logger.error('Query error', {
      error: err.message,
      duration,
      query: text.substring(0, 100) + (text.length > 100 ? '...' : '')
    });
    throw err;
  }
};

/**
 * Get a client from the pool for transactions
 * @returns {Promise} - Database client
 */
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;
  
  // Override client.query to log queries
  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };
  
  // Override client.release to track release time and detect leaks
  client.release = () => {
    client.lastReleaseTime = Date.now();
    return release.apply(client);
  };
  
  return client;
};

/**
 * Test the database connection with a simple query
 * @returns {Promise<boolean>} - True if connection successful
 */
const testConnection = async () => {
  try {
    const result = await query('SELECT NOW()');
    return result.rows.length > 0;
  } catch (err) {
    logger.error('Database connection test failed', { error: err.message });
    return false;
  }
};

// Export the pool and helper functions
module.exports = {
  pool,
  query,
  getClient,
  testConnection
};