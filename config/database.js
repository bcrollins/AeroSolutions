/**
 * Database Configuration
 * 
 * This module configures and manages the database connection pool
 * for PostgreSQL using the pg library.
 */

const { Pool } = require('pg');
const logger = require('./logger');

// Configure connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // If DATABASE_URL is not set, use individual parameters
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  // Connection pool settings
  max: 20,                       // Maximum connections in pool
  idleTimeoutMillis: 30000,      // How long a client is idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for connection
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Log pool errors
pool.on('error', (err) => {
  logger.error('Unexpected PostgreSQL error on idle client', {
    error: err.message,
    stack: err.stack
  });
});

/**
 * Execute a database query with automatic connection management
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} - Query result
 */
async function query(text, params = []) {
  const start = Date.now();
  
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      
      // Log query performance for monitoring
      const duration = Date.now() - start;
      logger.debug('Executed query', {
        query: text.replace(/\s+/g, ' ').trim(),
        duration,
        rows: result.rowCount
      });
      
      return result;
    } finally {
      // Always release the client back to the pool
      client.release();
    }
  } catch (error) {
    logger.error('Database query error', {
      query: text.replace(/\s+/g, ' ').trim(),
      error: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Close all pooled connections
 * @returns {Promise<void>} - Resolution when all connections are closed
 */
async function end() {
  try {
    await pool.end();
    logger.info('Database pool has been closed');
  } catch (error) {
    logger.error('Error closing database pool', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Initialize database with required tables if they don't exist
 * @returns {Promise<void>} - Resolution when initialization is complete 
 */
async function initDatabase() {
  try {
    // Create required tables
    await query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        company_name VARCHAR(200),
        ip_address VARCHAR(50),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Add index for efficient searches
    await query(`
      CREATE INDEX IF NOT EXISTS contacts_email_idx ON contacts(email);
      CREATE INDEX IF NOT EXISTS contacts_created_at_idx ON contacts(created_at);
    `);

    logger.info('Database tables initialized successfully');
  } catch (error) {
    logger.error('Database initialization error', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Check database connection status
 * @returns {Promise<boolean>} - True if connection successful
 */
async function checkConnection() {
  try {
    // Simple query to check connection
    const result = await query('SELECT NOW() as time');
    return !!result.rows[0].time;
  } catch (error) {
    logger.error('Database connection check failed', {
      error: error.message,
      stack: error.stack
    });
    return false;
  }
}

module.exports = {
  query,
  end,
  initDatabase,
  checkConnection,
  pool
};