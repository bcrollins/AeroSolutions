/**
 * PostgreSQL Database Configuration
 * 
 * This module provides a connection pool for PostgreSQL database connections.
 * It uses environment variables for configuration to keep sensitive information secure.
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection configuration
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Create a connection pool
const pool = new Pool(poolConfig);

// Log when the pool connects for the first time
pool.on('connect', () => {
  console.log('PostgreSQL database connection established');
});

// Log any errors in the pool
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

/**
 * Execute a query with parameters
 * @param {string} text - The SQL query text
 * @param {Array} params - The query parameters
 * @returns {Promise<QueryResult>} - Query result
 */
const query = async (text: string, params?: any[]): Promise<QueryResult> => {
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
 * Get a client from the pool for transactions
 * @returns {Promise<PoolClient>} - Database client
 */
const getClient = async (): Promise<PoolClient> => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
    console.error(`The last executed query on this client was: ${client.lastQuery}`);
  }, 5000);

  // Monkey patch the query method to keep track of the last query executed
  client.query = (...args: any[]) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };

  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release.apply(client);
  };

  return client;
};

/**
 * Test the database connection with a simple query
 * @returns {Promise<boolean>} - True if connection successful
 */
const testConnection = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT NOW()');
    console.log('Database connection test successful at:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

export {
  pool,
  query,
  getClient,
  testConnection
};