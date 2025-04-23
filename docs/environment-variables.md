# Environment Variables Reference

This document provides a comprehensive list of environment variables used throughout the application, their purpose, and their default values where applicable.

## Database Configuration

| Variable | Description | Default Value | Required |
|----------|-------------|---------------|----------|
| `DATABASE_URL` | PostgreSQL connection string in the format `postgresql://<username>:<password>@<host>:<port>/<dbname>` | None | Yes |
| `PGHOST` | PostgreSQL hostname | localhost | Yes |
| `PGUSER` | PostgreSQL username | postgres | Yes |
| `PGPASSWORD` | PostgreSQL password | None | Yes |
| `PGDATABASE` | PostgreSQL database name | None | Yes |
| `PGPORT` | PostgreSQL port | 5432 | Yes |

## Application Configuration

| Variable | Description | Default Value | Required |
|----------|-------------|---------------|----------|
| `PORT` | Port on which the server listens | 8080 | No |
| `NODE_ENV` | Environment (development, production, test) | development | No |
| `HOST` | Host address to bind the server | 0.0.0.0 | No |
| `LOG_LEVEL` | Logging level (error, warn, info, debug) | info | No |
| `CORS_ORIGIN` | CORS allowed origins | * | No |

## Authentication & Security

| Variable | Description | Default Value | Required |
|----------|-------------|---------------|----------|
| `JWT_SECRET` | Secret for signing JWT tokens | None | Yes |
| `JWT_EXPIRY` | JWT token expiry time | 1d | No |
| `COOKIE_SECRET` | Secret for signing cookies | None | Yes |
| `SESSION_SECRET` | Secret for Express sessions | None | Yes |
| `SESSION_MAX_AGE` | Session maximum age in milliseconds | 86400000 (1 day) | No |

## External Service API Keys

| Variable | Description | Default Value | Required |
|----------|-------------|---------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI-powered features | None | Yes |
| `STRIPE_SECRET_KEY` | Stripe API key for payment processing | None | No* |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | None | No* |
| `SENDGRID_API_KEY` | SendGrid API key for email sending | None | No* |

\* Required if the corresponding feature is enabled

## Feature Flags

| Variable | Description | Default Value | Required |
|----------|-------------|---------------|----------|
| `ENABLE_STRIPE` | Enable/disable Stripe integration | false | No |
| `ENABLE_EMAIL` | Enable/disable email sending | false | No |
| `ENABLE_OPENAI` | Enable/disable OpenAI API features | true | No |
| `ENABLE_ANALYTICS` | Enable/disable analytics tracking | true | No |

## Using Environment Variables

Environment variables can be set in multiple ways:

1. In a `.env` file in the project root (for development)
2. In Replit's Secrets tab (for deployment)
3. Directly in the system environment (for production)

Example `.env` file:

```
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/mydatabase
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=mydatabase
PGPORT=5432

# App
PORT=8080
NODE_ENV=development

# Security
JWT_SECRET=my_super_secure_jwt_secret
COOKIE_SECRET=my_super_secure_cookie_secret

# APIs
OPENAI_API_KEY=sk-...
```

## Accessing Environment Variables

In JavaScript/TypeScript files, access environment variables using `process.env`:

```javascript
const port = process.env.PORT || 8080;
```

In frontend code (React), access environment variables using `import.meta.env`:

```javascript
// Note: Only variables prefixed with VITE_ are available in the frontend
const apiUrl = import.meta.env.VITE_API_URL;
```

## Security Considerations

- Never commit `.env` files to version control
- Use Replit's Secrets tab to store sensitive values
- Rotate API keys and secrets regularly
- Use different credentials for development and production environments