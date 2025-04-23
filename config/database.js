/**
 * PostgreSQL Database Configuration
 * 
 * This module provides a connection pool for PostgreSQL database connections.
 * It uses environment variables for configuration to keep sensitive information secure.
 */

const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool with the database connection string from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Log when the pool connects for the first time
pool.on('connect', () => {
  console.log('PostgreSQL database connection established');
});

// Log any errors in the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
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
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error executing query', { text, error });
    throw error;
  }
};

/**
 * Test the database connection with a simple query
 * @returns {Promise<boolean>} - True if connection successful
 */
const testConnection = async () => {
  try {
    const result = await query('SELECT NOW()');
    console.log('Database connection test successful at:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

module.exports = {
  pool,
  query,
  testConnection
};