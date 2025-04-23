import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '../shared/schema';

// Configure Neon to use WebSockets
neonConfig.webSocketConstructor = ws;

// Check for DATABASE_URL environment variable
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required. Did you forget to provision a database?');
}

// Create connection pool
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// Create Drizzle ORM client
export const db = drizzle(pool, { schema });

// Test database connection
export async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Get database version information
export async function getDatabaseInfo() {
  try {
    const result = await pool.query('SELECT version()');
    return result.rows[0];
  } catch (error) {
    console.error('Error getting database info:', error);
    throw error;
  }
}

// Clean up connections on process exit
process.on('exit', () => {
  console.log('Closing database pool connections...');
  pool.end();
});