/**
 * PostgreSQL Database Configuration
 * 
 * This module provides a connection pool for PostgreSQL database connections.
 * It uses environment variables for configuration to keep sensitive information secure.
 */

const { Pool } = require('pg');

// Get database configuration from environment variables
const config = {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT || '5432'),
  
  // Connection pool configuration
  max: parseInt(process.env.PG_MAX_CONNECTIONS || '10'), // Maximum connections in pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000 // Return an error after 2 seconds if connection cannot be established
};

// Create connection pool
const pool = new Pool(config);

// Event handlers
pool.on('connect', () => {
  console.log('PostgreSQL pool: new connection established');
});

pool.on('error', (err, client) => {
  console.error('PostgreSQL pool: unexpected error on idle client', err);
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
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (duration > 1000) {
      // Log slow queries (over 1 second)
      console.warn('Slow query detected:', {
        text,
        params,
        duration,
        rowCount: result.rowCount
      });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', {
      text,
      params,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 * @returns {Promise} - Database client
 */
const getClient = async () => {
  const client = await pool.connect();
  const originalRelease = client.release;
  
  // Override release method to log connection release
  client.release = () => {
    client.release = originalRelease;
    return client.release();
  };
  
  return client;
};

/**
 * Test the database connection with a simple query
 * @returns {Promise<boolean>} - True if connection successful
 */
const testConnection = async () => {
  try {
    const result = await query('SELECT NOW() as current_time');
    return {
      connected: true,
      version: result.rows[0]?.version || 'Unknown',
      current_time: result.rows[0]?.current_time,
      database: config.database,
      host: config.host,
      port: config.port
    };
  } catch (error) {
    console.error('Database connection test failed:', error);
    return {
      connected: false,
      error: error.message,
      database: config.database,
      host: config.host,
      port: config.port
    };
  }
};

module.exports = {
  pool,
  query,
  getClient,
  testConnection
};