/**
 * PostgreSQL Database Configuration
 * 
 * This module provides a connection pool for PostgreSQL database connections.
 * It uses environment variables for configuration to keep sensitive information secure.
 */

const { Pool } = require('pg');
const logger = require('./logger');

// Get database configuration from environment variables
const isProduction = process.env.NODE_ENV === 'production';

// Configure database connection
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  // Pool configuration - for better performance
  max: process.env.DB_POOL_SIZE ? parseInt(process.env.DB_POOL_SIZE) : 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Log errors from the pool
pool.on('error', (err) => {
  logger.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

/**
 * Execute a query with parameters
 * @param {string} text - The SQL query text
 * @param {Array} params - The query parameters
 * @returns {Promise} - Query result
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (duration > 1000) { // Log slow queries (over 1 second)
      logger.warn(`Slow query: ${text} with params: ${JSON.stringify(params)} (${duration}ms)`);
    } else if (process.env.NODE_ENV === 'development') {
      logger.debug(`Query executed: ${text} with params: ${JSON.stringify(params)} (${duration}ms)`);
    }
    
    return res;
  } catch (err) {
    logger.error(`Query error: ${text} with params: ${JSON.stringify(params)}`, err);
    throw err;
  }
};

/**
 * Get a client from the pool for transactions
 * @returns {Promise} - Database client
 */
const getClient = async () => {
  const client = await pool.connect();
  const originalRelease = client.release;
  
  // Override release method to log duration
  client.release = () => {
    client.query_count = 0;
    originalRelease.apply(client);
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
    logger.info(`Database connection successful, server timestamp: ${result.rows[0].now}`);
    return true;
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
    return false;
  }
};

module.exports = {
  query,
  getClient,
  testConnection,
  pool
};