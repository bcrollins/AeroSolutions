/**
 * PostgreSQL Database Configuration (TypeScript)
 * 
 * This module provides a connection pool for PostgreSQL database connections.
 * It uses environment variables for configuration to keep sensitive information secure.
 */

import { Pool, PoolClient, QueryResult } from 'pg';

// Environment-based configuration
interface DbConfig {
  connectionString: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

// Create database configuration
const dbConfig: DbConfig = {
  connectionString: process.env.DATABASE_URL || '',
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false // For Replit compatibility
  } : false,
  max: parseInt(process.env.DB_POOL_SIZE || '10'), // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000 // How long to wait for a connection to become available
};

// Create a connection pool
export const pool = new Pool(dbConfig);

// Log connection events for debugging
pool.on('connect', () => {
  console.log('Database connection established');
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

/**
 * Execute a query with parameters
 * @param text - The SQL query text
 * @param params - The query parameters
 * @returns Query result
 */
export const query = async <T = any>(text: string, params?: any[]): Promise<QueryResult<T>> => {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries (over 200ms)
    if (duration > 200) {
      console.warn('Slow query:', { text, duration, rows: result.rowCount });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', (error as Error).message);
    console.error('Query:', text);
    console.error('Parameters:', params);
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 * @returns Database client
 */
export const getClient = async (): Promise<PoolClient> => {
  const client = await pool.connect();
  const originalRelease = client.release;
  
  // Override release method to log when client is returned to the pool
  client.release = () => {
    originalRelease.apply(client);
  };
  
  return client;
};

/**
 * Test the database connection with a simple query
 * @returns True if connection successful
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    await query('SELECT NOW()');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', (error as Error).message);
    return false;
  }
};

export default {
  pool,
  query,
  getClient,
  testConnection
};