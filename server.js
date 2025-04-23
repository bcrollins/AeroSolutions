/**
 * Main Express Server Application
 * 
 * This is the main entry point for the API Platform.
 * It configures the Express server with middleware, routes,
 * and error handling for a robust API service.
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('express-compression');
const path = require('path');
const logger = require('./config/logger');
const db = require('./config/database');
const { errorHandler } = require('./middlewares/errorHandler');
const apiRoutes = require('./routes');

// Create Express application
const app = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

/**
 * Configure middleware
 */

// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false // Enable in production
}));

// Cross-Origin Resource Sharing
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
app.use(morgan('combined', { stream: logger.stream }));

// Parse JSON requests
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded requests
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compress responses
app.use(compression());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Register routes
 */

// API routes
app.use('/api', apiRoutes);

// Root route - serve the landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch-all route for SPA support
app.get('*', (req, res) => {
  // API routes should have been handled already
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: {
        message: `API endpoint not found: ${req.originalUrl}`,
        code: 'NOT_FOUND'
      }
    });
  }
  
  // For all other routes, serve the SPA index.html
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * Error handling middleware
 * This must be registered after all routes
 */
app.use(errorHandler);

/**
 * Start the server
 */
function startServer() {
  app.listen(PORT, HOST, () => {
    logger.info(`Server running on http://${HOST}:${PORT}`);
    
    // Test database connection
    db.testConnection()
      .then(connected => {
        if (connected) {
          logger.info('Database connection successful');
        } else {
          logger.warn('Database connection failed - some features may not work');
        }
      })
      .catch(err => {
        logger.error('Error testing database connection', {
          error: err.message,
          stack: err.stack
        });
      });
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason.toString(),
    stack: reason.stack || 'No stack trace available'
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  
  // Exit with failure in case of uncaught exception
  process.exit(1);
});

// Handle SIGTERM signal (e.g., when Replit stops the container)
process.on('SIGTERM', () => {
  logger.info('SIGTERM received - shutting down gracefully');
  
  // Close database connections
  db.end()
    .then(() => {
      logger.info('Database connections closed');
      process.exit(0);
    })
    .catch(err => {
      logger.error('Error closing database connections', {
        error: err.message,
        stack: err.stack
      });
      process.exit(1);
    });
});

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

// Export for testing
module.exports = { app, startServer };