# AI-Powered Web Platform

A cutting-edge AI-powered web platform that transforms digital solution concepts into tangible prototypes through intelligent design generation and comprehensive service visualization.

## Features

- Text generation with OpenAI GPT-4o
- User authentication and management
- Subscription plans with Stripe integration
- Content optimization and analytics
- SEO enhancement tools
- Landing page optimization
- Marketplace for digital assets and services
- A/B testing capabilities
- Internationalization support
- Mobile-responsive design

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI API (GPT-4o) integration
- **Payments**: Stripe integration
- **Authentication**: JWT, Passport.js
- **Validation**: Zod, Express-validator
- **Data Fetching**: React Query, Axios
- **Routing**: wouter
- **Internationalization**: i18next

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- OpenAI API key
- Stripe API key (for payment features)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
```

### Installation

1. Clone the repository
2. Install dependencies

```bash
npm install
```

3. Push the database schema

```bash
npm run db:push
```

4. Start the development server

```bash
npm run dev
```

### Alternative: Simple Server

For a simplified version that runs on port 8080, use:

```bash
node simple-server.js
```

## Project Structure

- `/client`: React frontend application
- `/server`: Node.js/Express backend application
- `/shared`: Shared code (TypeScript types, schemas)
- `/public`: Static assets
- `/docs`: Project documentation
- `/models`: Data models and schema definitions
- `/controllers`: Route controllers
- `/config`: Configuration files
- `/tests`: Test files

## API Endpoints

- `/api/generate`: Generate text using OpenAI
- `/api/test-xai`: Test OpenAI API connection
- `/api/test-db`: Test database connection
- `/api/auth/*`: Authentication endpoints
- `/api/user/*`: User management endpoints
- `/api/marketplace/*`: Marketplace endpoints
- `/api/subscription/*`: Subscription management endpoints

## Development

### Running in Development Mode

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Running in Production Mode

```bash
npm start
```

## Documentation

For more detailed documentation, see the [Project Context](docs/project-context.md) document.