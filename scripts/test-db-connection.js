/**
 * Database Connection Test Script
 * 
 * This script tests the connection to the PostgreSQL database.
 * It verifies the environment variables and performs a simple test query.
 * 
 * Usage: node scripts/test-db-connection.js
 */

const dotenv = require('dotenv');
const { Pool } = require('pg');

// Load environment variables
dotenv.config();

// Check required environment variables
const requiredVars = ['DATABASE_URL', 'PGHOST', 'PGUSER', 'PGPASSWORD', 'PGDATABASE', 'PGPORT'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Error: Missing required environment variables:');
  missingVars.forEach(varName => console.error(`- ${varName}`));
  process.exit(1);
}

// Print configuration (without sensitive data)
console.log('Database Configuration:');
console.log(`- Host: ${process.env.PGHOST}`);
console.log(`- Port: ${process.env.PGPORT}`);
console.log(`- Database: ${process.env.PGDATABASE}`);
console.log(`- User: ${process.env.PGUSER}`);
console.log(`- Password: ${'*'.repeat(8)}`);

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test the connection
async function testConnection() {
  let client;
  try {
    console.log('Attempting to connect to the database...');
    client = await pool.connect();
    console.log('Successfully connected to the database');
    
    console.log('Executing test query...');
    const result = await client.query('SELECT NOW() as now');
    console.log(`Test query successful. Server time: ${result.rows[0].now}`);
    
    console.log('Checking if all required tables exist...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length === 0) {
      console.warn('No tables found in the database. You may need to run the schema initialization script.');
    } else {
      console.log(`Found ${tablesResult.rows.length} tables:`);
      tablesResult.rows.forEach(row => console.log(`- ${row.table_name}`));
    }
    
    console.log('\nDatabase connection test completed successfully');
    return true;
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error(`Could not connect to PostgreSQL server at ${process.env.PGHOST}:${process.env.PGPORT}`);
      console.error('Make sure the PostgreSQL server is running and accessible');
    } else if (error.code === '28P01') {
      console.error('Authentication failed: Incorrect username or password');
    } else if (error.code === '3D000') {
      console.error(`Database "${process.env.PGDATABASE}" does not exist`);
    }
    return false;
  } finally {
    if (client) {
      client.release();
      console.log('Database client released');
    }
    await pool.end();
    console.log('Connection pool closed');
  }
}

// Run the test
testConnection()
  .then(success => {
    if (success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });