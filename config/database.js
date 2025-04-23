/**
 * Database Configuration
 * 
 * This module configures and manages the database connection pool
 * for PostgreSQL using the pg library.
 */

const { Pool } = require('pg');
const logger = require('./logger');

// Check for required environment variable
if (!process.env.DATABASE_URL) {
  logger.warn('DATABASE_URL environment variable is not set');
  logger.warn('Please set DATABASE_URL in your .env file or environment variables');
}

// Configure PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Maximum number of clients the pool should contain
  max: process.env.PG_MAX_CLIENTS ? parseInt(process.env.PG_MAX_CLIENTS) : 10,
  // Maximum time (ms) a client can stay idle before being closed
  idleTimeoutMillis: 30000,
  // Maximum time (ms) to wait for a client to become available
  connectionTimeoutMillis: 10000
});

// Log connection events
pool.on('connect', (client) => {
  logger.debug('New database connection established');
});

pool.on('error', (err, client) => {
  logger.error('Unexpected database error', { 
    error: err.message,
    stack: err.stack
  });
});

pool.on('remove', (client) => {
  logger.debug('Database client returned to pool');
});

/**
 * Execute a database query with automatic connection management
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} - Query result
 */
async function query(text, params = []) {
  const start = Date.now();
  const client = await pool.connect();
  
  try {
    const result = await client.query(text, params);
    
    const duration = Date.now() - start;
    logger.debug('Database query executed', {
      query: text.replace(/\s+/g, ' ').trim().slice(0, 100) + (text.length > 100 ? '...' : ''),
      duration: `${duration}ms`,
      rowCount: result.rowCount
    });
    
    return result;
  } catch (error) {
    logger.error('Database query error', {
      error: error.message,
      stack: error.stack,
      query: text.replace(/\s+/g, ' ').trim().slice(0, 100) + (text.length > 100 ? '...' : '')
    });
    
    // Re-throw the error for handling in the calling code
    throw error;
  } finally {
    // Always release the client back to the pool
    client.release();
  }
}

/**
 * Close all pooled connections
 * @returns {Promise<void>} - Resolution when all connections are closed
 */
async function end() {
  logger.info('Closing all database connections');
  return pool.end();
}

/**
 * Initialize database with required tables if they don't exist
 * @returns {Promise<void>} - Resolution when initialization is complete 
 */
async function initDatabase() {
  try {
    // Create contacts table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        company_name VARCHAR(100),
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      )
    `);

    logger.info('Database initialization completed successfully');
  } catch (error) {
    logger.error('Failed to initialize database', {
      error: error.message,
      stack: error.stack
    });
    
    // Re-throw the error for handling in the calling code
    throw error;
  }
}

// Export functions for use in other modules
module.exports = {
  query,
  end,
  initDatabase
};