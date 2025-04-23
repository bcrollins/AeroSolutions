/**
 * PostgreSQL Database Configuration (TypeScript)
 * 
 * This module provides a connection pool for PostgreSQL database connections.
 * It uses environment variables for configuration to keep sensitive information secure.
 */

import { Pool, PoolClient, QueryResult } from 'pg';

// Create a connection pool using environment variables
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT || '5432'),
  // Enable SSL for production environments (e.g., Heroku)
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Log connection errors
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Log successful connection
pool.on('connect', () => {
  console.log(`Connected to PostgreSQL database (${process.env.PGDATABASE}) at ${process.env.PGHOST}:${process.env.PGPORT}`);
});

/**
 * Execute a query with parameters
 * @param text - The SQL query text
 * @param params - The query parameters
 * @returns Query result
 */
const query = async <T = any>(text: string, params?: any[]): Promise<QueryResult<T>> => {
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  
  // Log slow queries (over 100ms) for debugging
  if (duration > 100) {
    console.log(`Slow query (${duration}ms): ${text}`);
  }
  
  return result;
};

/**
 * Get a client from the pool for transactions
 * @returns Database client
 */
const getClient = async (): Promise<PoolClient> => {
  const client = await pool.connect();
  const originalQuery = client.query;
  const originalRelease = client.release;
  
  // Add query execution time monitoring
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client.query = async (...args: any[]) => {
    const start = Date.now();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await originalQuery.apply(client, args as any);
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
 * @returns True if connection successful
 */
const testConnection = async (): Promise<boolean> => {
  try {
    await pool.query('SELECT NOW()');
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