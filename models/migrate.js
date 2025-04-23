/**
 * Database Migration Script
 * 
 * This script executes the SQL schema file to create the database tables.
 * It can be used to initialize the database or update its schema.
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

// Path to the schema file
const schemaFilePath = path.join(__dirname, 'schema.sql');

/**
 * Execute the schema SQL file
 */
async function migrateDatabase() {
  console.log('Starting database migration...');
  
  try {
    // Read the schema SQL file
    const schemaSql = fs.readFileSync(schemaFilePath, 'utf8');
    
    // Execute the SQL
    await pool.query(schemaSql);
    
    console.log('Database migration completed successfully.');
    return true;
  } catch (error) {
    console.error('Error during database migration:', error);
    return false;
  } finally {
    // No need to end the pool here since it might be used elsewhere in the application
  }
}

/**
 * If this script is run directly (not imported), execute the migration
 */
if (require.main === module) {
  migrateDatabase()
    .then(success => {
      if (success) {
        console.log('Migration executed successfully.');
        process.exit(0);
      } else {
        console.error('Migration failed.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unexpected error during migration:', error);
      process.exit(1);
    });
} else {
  // Export the function for use in other modules
  module.exports = { migrateDatabase };
}