# PostgreSQL Database Configuration

This document outlines the PostgreSQL database configuration for the application, including setup, schemas, and usage patterns.

## Environment Variables

The application uses the following environment variables for database configuration:

- `DATABASE_URL`: Connection string in the format `postgresql://<username>:<password>@<host>:<port>/<dbname>`
- `PGHOST`: Database hostname (default: localhost)
- `PGUSER`: Database username (default: postgres)
- `PGPASSWORD`: Database password
- `PGDATABASE`: Database name
- `PGPORT`: Database port (default: 5432)

These variables are loaded from the environment or from a `.env` file using `dotenv`.

## Connection Setup

The application uses a connection pool to manage database connections for improved performance. The configuration is defined in:

- `config/database.js` (CommonJS version)
- `config/database.ts` (TypeScript version)

The connection pool is configured with the following options:

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

## Database Schema

The database schema is defined in `models/schema.sql` and includes tables for:

- Users
- Contact submissions
- Client previews
- Subscription plans
- User subscriptions
- Marketplace items
- Marketplace orders
- Advertisements
- User sessions
- Content view metrics
- Feedback
- Posts
- Mockup requests
- Generated mockups
- Price recommendations
- Subscription price history
- Logs
- Bug reports
- Platform compatibility issues
- A/B Tests
- A/B Test Results

Each table includes appropriate indexes for optimized query performance.

## Data Access Patterns

The application uses a repository pattern for database access, with the following components:

1. **Storage Interface (`IStorage`)**: Defines the contract for data access operations
2. **Database Implementation (`DatabaseStorage`)**: Implements the storage interface using PostgreSQL

The storage implementation uses parameterized queries to prevent SQL injection:

```typescript
async getUser(id: number): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}
```

## Database Initialization

The database is initialized using the `scripts/init-database.js` script, which:

1. Connects to the PostgreSQL database
2. Executes the schema SQL file to create tables
3. Sets up initial data if needed

## ORM Usage

The application uses Drizzle ORM for database operations, which provides:

- Type safety with TypeScript
- Query building
- Schema validation

The schema is defined in `shared/schema.ts` and is used by both the frontend and backend.

## Testing Database Connection

You can test the database connection using the `/api/test-db` endpoint, which:

1. Executes a simple query to verify connectivity
2. Returns the current timestamp from the database

## Migration Strategy

When schema changes are needed:

1. Update the schema definition in `shared/schema.ts`
2. Update the SQL schema in `models/schema.sql`
3. Run the migration script to apply changes

## Security Considerations

The database configuration includes several security measures:

- Connection strings and credentials are stored in environment variables
- Parameterized queries to prevent SQL injection
- SSL connection for production environments
- Connection pool timeouts to prevent resource exhaustion