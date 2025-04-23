# PostgreSQL Database Setup Guide

This guide provides instructions for setting up and configuring the PostgreSQL database for the application.

## 1. Prerequisites

- PostgreSQL installed or access to a PostgreSQL database
- Node.js and npm installed
- Access to the application codebase

## 2. Environment Configuration

1. Create a `.env` file in the project root or use Replit's Secrets tab to set the following environment variables:

   ```
   DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<dbname>
   PGHOST=<host>
   PGUSER=<username>
   PGPASSWORD=<password>
   PGDATABASE=<dbname>
   PGPORT=<port>
   ```

   For Replit's built-in PostgreSQL database, these values are automatically set in the environment:
   - `DATABASE_URL` is provided in the format required for connection
   - Individual values like `PGHOST`, `PGUSER`, etc. are also available

## 3. Database Schema Setup

The application's database schema is defined in `models/schema.sql`. This file contains all the table definitions, indexes, and functions needed for the application.

To initialize the database with this schema:

1. Run the initialization script:

   ```bash
   node scripts/init-database.js
   ```

   This will:
   - Connect to the PostgreSQL database using the environment variables
   - Execute the schema SQL file to create all tables and indexes
   - Set up any required functions or triggers

2. Verify the database initialization was successful by checking the script output or testing the connection:

   ```bash
   curl http://localhost:8080/api/test-db
   ```

   You should see a JSON response with status "success" and the current timestamp.

## 4. Database Structure

The database schema includes the following key tables:

- `users`: User accounts and profiles
- `contact_submissions`: Contact form submissions
- `client_previews`: Preview links for client projects
- `subscription_plans`: Available subscription plans
- `user_subscriptions`: User subscription records
- `marketplace_items`: Items available in the marketplace
- `marketplace_orders`: Orders for marketplace items
- `advertisements`: Advertisement records
- `user_sessions`: User session data
- `content_view_metrics`: Metrics for content views
- `feedback`: User feedback records
- `posts`: Blog posts and articles
- `mockup_requests`: Requests for mockup generation
- `generated_mockups`: Generated mockup images
- `price_recommendations`: Price optimization recommendations
- `subscription_price_history`: History of subscription price changes
- `logs`: Application logs
- `bug_reports`: Bug reports from users
- `platform_compatibility_issues`: Platform compatibility issues
- `ab_tests`: A/B test configurations
- `ab_test_results`: A/B test results

## 5. Using the Database

### In the Application

The application uses a repository pattern for database access:

1. The interface (`IStorage`) in `server/storage.ts` defines the contract for data access
2. The implementation (`DatabaseStorage`) provides the actual database operations
3. Query results are typed using the schema defined in `shared/schema.ts`

Example:

```typescript
// Get a user by ID
const user = await storage.getUser(userId);

// Create a new user
const newUser = await storage.createUser({
  username: 'johndoe',
  email: 'john@example.com',
  password: hashedPassword,
  role: 'user'
});
```

### Direct Database Access

For maintenance or debugging, you can access the database directly:

1. Using the provided connection functions in `config/database.js`:

```javascript
const db = require('./config/database');

async function testQuery() {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [1]);
  console.log(result.rows);
}

testQuery();
```

2. Using an external PostgreSQL client:

   Connect using the connection details from your environment variables.

## 6. Database Migrations

When schema changes are needed:

1. Update the schema definition in `shared/schema.ts` to reflect the changes
2. Update the SQL schema in `models/schema.sql` with the new definitions
3. Create a migration script to:
   - Add new tables
   - Alter existing tables
   - Migrate data as needed
4. Run the migration script to apply the changes

## 7. Troubleshooting

If you encounter database connection issues:

1. Verify the connection environment variables are correct
2. Check that the database server is running and accessible
3. Ensure the database user has the necessary permissions
4. Run the test endpoint: `curl http://localhost:8080/api/test-db`
5. Check the application logs for database-related errors

For schema-related issues:

1. Verify that all tables exist by running: `\dt` in the PostgreSQL console
2. Check that table columns match the expected schema
3. Ensure indexes are created for performance-critical queries

## 8. Backup and Restore

For data backup and recovery:

1. Create a database backup:

   ```bash
   pg_dump -U <username> -d <dbname> > backup.sql
   ```

2. Restore a database from backup:

   ```bash
   psql -U <username> -d <dbname> < backup.sql
   ```

## 9. Security Considerations

- Use strong, unique passwords for database users
- Restrict database user permissions to only what's necessary
- Use parameterized queries to prevent SQL injection
- Enable SSL for database connections in production
- Regularly backup the database
- Keep PostgreSQL updated with security patches