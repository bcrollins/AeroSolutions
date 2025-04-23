/**
 * PostgreSQL Database Configuration
 * 
 * This module provides a connection pool for PostgreSQL database connections.
 * It uses environment variables for configuration to keep sensitive information secure.
 */

const { Pool } = require('pg');
const logger = require('./logger');

// Database configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false }
    : false,
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000')
};

// Create a connection pool
const pool = new Pool(dbConfig);

// Connection error handling
pool.on('error', (err) => {
  logger.error('Unexpected PostgreSQL pool error', {
    error: err.message,
    stack: err.stack
  });
});

// Pool event listeners for monitoring
pool.on('connect', () => {
  logger.debug('PostgreSQL pool new client connected');
});

pool.on('acquire', () => {
  logger.debug('PostgreSQL pool client acquired from pool');
});

pool.on('remove', () => {
  logger.debug('PostgreSQL pool client removed from pool');
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
    
    logger.debug(`SQL query executed`, {
      query: text,
      params,
      rows: result.rowCount,
      duration: `${duration}ms`
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    
    logger.error(`SQL query error`, {
      query: text,
      params,
      error: error.message,
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
  const client = await pool.connect();
  
  // Monkey patch the query method to implement the same logging
  const query = client.query;
  client.query = async (...args) => {
    const [text, params] = args;
    const start = Date.now();
    
    try {
      const result = await query.apply(client, args);
      const duration = Date.now() - start;
      
      logger.debug(`SQL transaction query executed`, {
        query: text,
        params,
        rows: result.rowCount,
        duration: `${duration}ms`
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      
      logger.error(`SQL transaction query error`, {
        query: text,
        params,
        error: error.message,
        duration: `${duration}ms`
      });
      
      throw error;
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
    const result = await query('SELECT NOW()');
    
    logger.info(`Database connection test successful`, {
      timestamp: result.rows[0].now
    });
    
    return true;
  } catch (error) {
    logger.error(`Database connection test failed`, {
      error: error.message
    });
    
    return false;
  }
}

// Export the pool and utilities
module.exports = {
  pool,
  query,
  getClient,
  testConnection
};