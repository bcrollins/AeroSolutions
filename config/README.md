# Configuration

This directory contains configuration files for the application.

## Purpose

Configuration files centralize important settings and parameters used throughout the application, making it easier to manage and modify application behavior without changing code.

## Configuration Types

### Environment Variables

The application uses environment variables for sensitive or environment-specific configuration:

- `DATABASE_URL`: PostgreSQL database connection string
- `OPENAI_API_KEY`: API key for OpenAI services
- `STRIPE_SECRET_KEY`: Secret key for Stripe payment processing
- `STRIPE_PUBLISHABLE_KEY`: Publishable key for Stripe payment forms
- `JWT_SECRET`: Secret key for JWT token generation
- `SESSION_SECRET`: Secret key for session encryption

### Server Configuration

Server-specific settings can be found in `server/index.ts`:

- Security headers (Helmet configuration)
- Rate limiting settings
- Caching policies
- CORS settings
- Compression options

### Database Configuration

Database connection settings are defined in `server/db.ts` and use the Drizzle ORM:

```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```

### Frontend Configuration

Frontend-specific settings include:

- Theme configuration in `theme.json`
- Tailwind CSS configuration in `tailwind.config.ts`
- Vite bundler configuration in `vite.config.ts`

## Future Configuration Organization

To improve organization, consider moving the following configuration files to this directory:

- Database configuration
- Security settings
- Logging configuration
- Rate limiting rules
- Caching policies
- External service integration settings (OpenAI, Stripe, etc.)

## Example Configuration Structure

```
config/
├── database.ts       # Database connection settings
├── security.ts       # Security settings (CORS, Helmet, etc.)
├── rate-limiting.ts  # Rate limiting rules for different endpoints
├── openai.ts         # OpenAI API configuration
├── stripe.ts         # Stripe integration settings
├── logging.ts        # Logging configuration
└── caching.ts        # Caching policies
```