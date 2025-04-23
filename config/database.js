/**
 * Database Configuration
 * 
 * This module configures and manages the database connection pool
 * for PostgreSQL using the pg library.
 */

const { Pool } = require('pg');
const logger = require('./logger');

// Create a database configuration object
const dbConfig = {
  // Use DATABASE_URL environment variable for connection string
  connectionString: process.env.DATABASE_URL,
  
  // Configure SSL based on environment
  ssl: process.env.NODE_ENV === 'production' ? 
    { rejectUnauthorized: false } : 
    false,
  
  // Connection pool configuration
  max: parseInt(process.env.DB_POOL_SIZE) || 10, // Maximum number of clients
  idleTimeoutMillis: 30000, // How long a client is kept inactive (30 seconds)
  connectionTimeoutMillis: 5000, // Max time to wait for connection (5 seconds)
};

// Create a connection pool
const pool = new Pool(dbConfig);

// Log pool events
pool.on('connect', () => {
  logger.info('Database connection established');
});

pool.on('error', (err) => {
  logger.error('Database connection error', {
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
  const startTime = Date.now();
  
  try {
    const result = await pool.query(text, params);
    
    // Log query performance for slow queries
    const duration = Date.now() - startTime;
    if (duration > 200) { // Log queries slower than 200ms
      logger.warn('Slow database query', {
        query: text,
        duration: duration + 'ms',
        rowCount: result.rowCount
      });
    }
    
    return result;
  } catch (err) {
    // Add query information to error
    err.query = text;
    err.params = params;
    
    // Log the error
    logger.error('Database query error', {
      error: err.message,
      query: text,
      duration: Date.now() - startTime + 'ms'
    });
    
    // Rethrow the error
    throw err;
  }
}

/**
 * Close all pooled connections
 * @returns {Promise<void>} - Resolution when all connections are closed
 */
async function end() {
  try {
    await pool.end();
    logger.info('Database connection pool closed');
  } catch (err) {
    logger.error('Error closing database connection pool', {
      error: err.message,
      stack: err.stack
    });
    throw err;
  }
}

/**
 * Initialize database with required tables if they don't exist
 * @returns {Promise<void>} - Resolution when initialization is complete 
 */
async function initDatabase() {
  try {
    // Read the schema file and execute it
    const fs = require('fs').promises;
    const path = require('path');
    
    const schemaPath = path.join(process.cwd(), 'models', 'schema.sql');
    const schemaSQL = await fs.readFile(schemaPath, 'utf8');
    
    await query(schemaSQL);
    logger.info('Database schema initialized successfully');
  } catch (err) {
    logger.error('Failed to initialize database schema', {
      error: err.message,
      stack: err.stack
    });
    throw err;
  }
}

/**
 * Check database connection status
 * @returns {Promise<boolean>} - True if connection successful
 */
async function checkConnection() {
  try {
    const result = await query('SELECT NOW() as time');
    logger.info('Database connection is working', {
      timestamp: result.rows[0].time
    });
    return true;
  } catch (err) {
    logger.error('Database connection check failed', {
      error: err.message
    });
    return false;
  }
}

// Export the database interface
module.exports = {
  query,
  end,
  initDatabase,
  checkConnection
};