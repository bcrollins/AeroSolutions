# Project Context: AI-Powered Web Platform

## App Purpose

This is an AI-powered web platform that provides various services for digital solution creation, design generation, and content optimization. The platform leverages OpenAI's GPT-4o model for text generation and other AI capabilities to assist users in creating and optimizing digital content and websites.

## Main Features

- **Text Generation**: Generate creative content using OpenAI's GPT-4o model
- **Landing Page Optimization**: AI-driven suggestions for improving landing pages
- **User Authentication**: Secure login/signup system with JWT authentication
- **Subscription Management**: Integration with Stripe for subscription plans
- **Marketplace**: A platform for users to buy and sell digital assets and services
- **SEO Optimization**: Tools for optimizing content for search engines
- **Content Analytics**: Track engagement metrics for published content
- **Mockup Generation**: Create visual mockups for website designs
- **Internationalization**: Multi-language support
- **A/B Testing**: Tools for running and analyzing A/B tests
- **Price Optimization**: AI-driven price recommendations for subscriptions
- **Social Media Integration**: Generate and publish content to social platforms

## Tech Stack

### Backend
- **Node.js**: JavaScript runtime environment
- **Express**: Web framework for Node.js
- **TypeScript**: Type-safe JavaScript
- **PostgreSQL**: Database for storing application data
- **Drizzle ORM**: Database ORM with TypeScript support
- **Drizzle Kit**: Migration and schema management tool
- **Express Session**: Session management
- **Passport**: Authentication middleware
- **JWT**: JSON Web Tokens for authentication
- **OpenAI API**: For AI-powered content generation
- **Stripe API**: For payment processing
- **Zod**: Runtime type validation

### Frontend
- **React**: JavaScript library for building user interfaces
- **TypeScript**: Type-safe JavaScript
- **Vite**: Frontend tooling and development server
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: UI component library built on Radix UI
- **React Hook Form**: Form validation and submission
- **React Query**: Data fetching and caching
- **wouter**: Routing library
- **i18next**: Internationalization framework
- **Framer Motion**: Animation library
- **Recharts**: Chart library for data visualization

### DevOps
- **Replit**: Hosting and development environment
- **Git**: Version control
- **TypeScript**: Static type checking

## File Structure

The project follows a structured approach with clear separation of concerns:

### Root Directories
- `/client`: Contains the React frontend application
- `/server`: Contains the Node.js/Express backend application
- `/shared`: Contains shared code between frontend and backend (e.g., TypeScript types)
- `/public`: Static assets served by the server
- `/docs`: Project documentation
- `/tests`: Test files
- `/config`: Configuration files
- `/models`: Data models and database schema
- `/controllers`: Logic for handling routes
- `/views`: View templates (if using server-rendered views)

### Frontend Structure (`/client/src`)
- `/components`: React components
- `/hooks`: Custom React hooks
- `/contexts`: React context providers
- `/pages`: Page components for routing
- `/utils`: Utility functions
- `/styles`: CSS styles
- `/assets`: Static assets for the frontend
- `/i18n`: Internationalization files

### Backend Structure (`/server`)
- `/routes`: API route definitions
- `/utils`: Utility functions
- `/middleware`: Express middleware
- `/background`: Background tasks and scheduling
- `/scripts`: One-off scripts
- `/types`: TypeScript type definitions

## Key Files
- `server/index.ts`: Main server entry point
- `server/db.ts`: Database configuration
- `server/routes.ts`: API route registration
- `server/storage.ts`: Storage interface definitions
- `shared/schema.ts`: Database schema definitions
- `simple-server.js`: Simplified server running on port 8080
- `client/src/App.tsx`: Main React application component

## Backend Services
- **Authentication**: User signup, login, and session management
- **Content Generation**: AI-powered text and content creation
- **Stripe Integration**: Subscription and payment processing
- **OpenAI API**: Natural language processing and content generation
- **Database**: PostgreSQL for data persistence
- **Rate Limiting**: Prevent API abuse
- **Caching**: Improve performance
- **File Storage**: User-generated content storage

## Deployment
- The application is deployed on Replit
- The server is configured to run on port 8080 (simple-server.js) or port 5000 (default Express)
- The application can be accessed via the Replit domain or a custom domain if configured