# Project File Structure

This document outlines the organization of the codebase, helping developers understand the overall architecture.

## Root Directory

```
.
├── .replit                 # Replit configuration
├── .gitignore              # Git ignore patterns
├── README.md               # Project documentation
├── package.json            # Node.js dependencies
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── vite.config.ts          # Vite bundler configuration
├── drizzle.config.ts       # Database ORM configuration
├── theme.json              # UI theme configuration
├── simple-server.js        # Simplified Express server (port 8080)
├── server.js               # Main server entry point (entry for production)
├── models/                 # Data models
├── controllers/            # Route controllers
├── views/                  # View templates
├── config/                 # Configuration files
├── docs/                   # Project documentation
│   ├── project-context.md  # Overview of the project
│   └── file-structure.md   # This file
├── client/                 # Frontend React application
├── server/                 # Backend Node.js/Express application
├── shared/                 # Shared code between frontend and backend
├── public/                 # Static assets
└── tests/                  # Test files
```

## Client Directory (Frontend)

```
client/
├── public/                 # Public assets for the frontend
└── src/                    # Source code
    ├── App.tsx             # Main application component
    ├── assets/             # Static assets
    ├── components/         # React components
    │   ├── admin/          # Admin-specific components
    │   ├── platform/       # Platform-specific components
    │   ├── popups/         # Popup/modal components
    │   └── ui/             # UI components (shadcn/ui)
    ├── contexts/           # React context providers
    ├── data/               # Mock/sample data
    ├── hooks/              # Custom React hooks
    ├── i18n/               # Internationalization
    │   └── locales/        # Translation files
    ├── layouts/            # Layout components
    ├── lib/                # Library code
    ├── pages/              # Page components
    ├── styles/             # CSS styles
    ├── types/              # TypeScript type definitions
    └── utils/              # Utility functions
```

## Server Directory (Backend)

```
server/
├── index.ts                # Main server entry point
├── routes.ts               # API route registration
├── db.ts                   # Database connection
├── storage.ts              # Storage interface
├── vite.ts                 # Vite server configuration
├── grok.ts                 # OpenAI API wrapper (previously XAI)
├── background/             # Background tasks
├── middleware/             # Express middleware
├── middlewares/            # Additional middleware
├── routes/                 # API routes
│   ├── elevatebot/         # Chatbot-related routes
│   ├── api.ts              # API-related routes
│   ├── auth.ts             # Authentication routes
│   ├── abTesting.ts        # A/B testing routes
│   ├── analytics.ts        # Analytics routes
│   ├── marketplace.ts      # Marketplace routes
│   └── ...                 # Other route modules
├── scripts/                # Utility scripts
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
    ├── auth.ts             # Authentication utilities
    ├── caching.ts          # Caching utilities
    ├── grok.ts             # OpenAI integration
    ├── xaiClient.ts        # OpenAI client (previously XAI)
    ├── rate-limiting.ts    # Rate limiting utilities
    ├── openai.ts           # OpenAI API wrapper
    └── ...                 # Other utility modules
```

## Shared Directory

```
shared/
└── schema.ts               # Database schema definitions
```

## Public Directory

```
public/
├── index.html              # Main landing page
├── test.html               # Test page
├── login.html              # Login page
└── images/                 # Static images
```

## Key Files

- **server/index.ts**: Main server entry point, sets up Express, middleware, and routes
- **simple-server.js**: Simplified server that runs on port 8080
- **server/db.ts**: Database connection configuration using PostgreSQL and Drizzle ORM
- **server/routes.ts**: API route registration and handler definitions
- **server/utils/xaiClient.ts**: OpenAI API client (previously XAI)
- **shared/schema.ts**: Database schema definitions using Drizzle ORM
- **client/src/App.tsx**: Main React application component

## Database Schema

The main data models include:

- Users
- Contact Submissions
- Client Previews
- Subscription Plans
- User Subscriptions
- Marketplace Items
- Marketplace Orders
- Advertisements
- User Sessions
- Content View Metrics
- Feedback
- Logs
- Bug Reports
- Platform Compatibility Issues

The schema is defined in `shared/schema.ts` using Drizzle ORM.