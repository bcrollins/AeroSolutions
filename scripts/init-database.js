/**
 * Database Initialization Script
 * 
 * This script initializes the PostgreSQL database by:
 * 1. Executing the schema.sql file to create tables
 * 2. Setting up initial data if needed
 * 
 * Usage: node scripts/init-database.js
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

// Load environment variables
dotenv.config();

// Check if DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Create a new pool connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Path to the schema file
const schemaPath = path.join(__dirname, '..', 'models', 'schema.sql');

// Function to initialize the database
async function initializeDatabase() {
  console.log('Starting database initialization...');
  
  let client;
  try {
    // Connect to the database
    client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    
    // Read the schema SQL file
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Read schema.sql file');
    
    // Execute the schema SQL
    console.log('Creating database tables...');
    await client.query(schemaSql);
    console.log('Database tables created successfully');
    
    // Test the connection with a simple query
    const result = await client.query('SELECT NOW() as now');
    console.log('Database connection test successful at:', result.rows[0].now);
    
    console.log('Database initialization completed successfully');
    
    return true;
  } catch (error) {
    console.error('Error initializing database:', error.message);
    return false;
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release();
    }
    
    // Close the pool
    await pool.end();
  }
}

// Run the initialization
initializeDatabase()
  .then(success => {
    if (success) {
      console.log('Successfully initialized the database');
      process.exit(0);
    } else {
      console.error('Failed to initialize the database');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });