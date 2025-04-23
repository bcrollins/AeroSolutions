/**
 * PostgreSQL Database Configuration
 * 
 * This module provides a connection pool for PostgreSQL database connections.
 * It uses environment variables for configuration to keep sensitive information secure.
 */

const { Pool } = require('pg');

// Create a connection pool using environment variables
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  // Enable SSL for production environments (e.g., Heroku)
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Log connection errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Log successful connection
pool.on('connect', () => {
  console.log(`Connected to PostgreSQL database (${process.env.PGDATABASE}) at ${process.env.PGHOST}:${process.env.PGPORT}`);
});

/**
 * Execute a query with parameters
 * @param {string} text - The SQL query text
 * @param {Array} params - The query parameters
 * @returns {Promise} - Query result
 */
const query = async (text, params) => {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  
  // Log slow queries (over 100ms) for debugging
  if (duration > 100) {
    console.log(`Slow query (${duration}ms): ${text}`);
  }
  
  return result;
};

/**
 * Get a client from the pool for transactions
 * @returns {Promise} - Database client
 */
const getClient = async () => {
  const client = await pool.connect();
  const originalQuery = client.query;
  const originalRelease = client.release;
  
  // Add query execution time monitoring
  client.query = async (...args) => {
    const start = Date.now();
    const result = await originalQuery.apply(client, args);
    const duration = Date.now() - start;
    
    // Log slow queries (over 100ms) for debugging
    if (duration > 100) {
      console.log(`Slow transaction query (${duration}ms): ${args[0]}`);
    }
    
    return result;
  };
  
  // Ensure clients are always released back to the pool
  client.release = () => {
    client.query = originalQuery;
    return originalRelease.apply(client);
  };
  
  return client;
};

/**
 * Test the database connection with a simple query
 * @returns {Promise<boolean>} - True if connection successful
 */
const testConnection = async () => {
  try {
    await pool.query('SELECT NOW()');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

module.exports = {
  pool,
  query,
  getClient,
  testConnection
};