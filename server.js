/**
 * Main Server Application
 * 
 * This is the entry point for the Express server application.
 * It sets up the server, middleware, routes, and error handling.
 */

// Import dependencies
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('express-compression');
const dotenv = require('dotenv');
const path = require('path');

// Import custom modules
const setupRoutes = require('./routes');
const db = require('./config/database');
const logger = require('./config/logger');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production'
}));

// Enable CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression());

// Set up all routes and middleware
setupRoutes(app);

/**
 * Start the server
 */
function startServer() {
  // Check database connection before starting
  db.checkConnection()
    .then(connected => {
      if (!connected) {
        logger.warn('Unable to connect to database, starting server anyway');
      } else {
        logger.info('Successfully connected to database');
      }
      
      // Start HTTP server
      const server = app.listen(PORT, HOST, () => {
        logger.info(`Server running at http://${HOST}:${PORT}/`);
      });
      
      // Handle graceful shutdown
      function gracefulShutdown() {
        logger.info('Received shutdown signal, closing server...');
        
        server.close(async () => {
          logger.info('Server closed, closing database connections...');
          
          try {
            await db.end();
            logger.info('Database connections closed');
            process.exit(0);
          } catch (err) {
            logger.error('Error closing database connections', {
              error: err.message,
              stack: err.stack
            });
            process.exit(1);
          }
        });
        
        // Force close if graceful shutdown takes too long
        setTimeout(() => {
          logger.error('Forced shutdown after timeout');
          process.exit(1);
        }, 10000);
      }
      
      // Listen for termination signals
      process.on('SIGTERM', gracefulShutdown);
      process.on('SIGINT', gracefulShutdown);
      
      // Handle uncaught exceptions
      process.on('uncaughtException', (err) => {
        logger.error('Uncaught exception', {
          error: err.message,
          stack: err.stack
        });
        
        // Exit with error for container orchestration systems
        process.exit(1);
      });
      
      // Handle unhandled promise rejections
      process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled promise rejection', {
          reason: reason?.message || reason,
          stack: reason?.stack
        });
      });
    })
    .catch(err => {
      logger.error('Failed to check database connection', {
        error: err.message,
        stack: err.stack
      });
      
      // Start server even if database check fails
      app.listen(PORT, HOST, () => {
        logger.info(`Server running (without database) at http://${HOST}:${PORT}/`);
      });
    });
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

// Export for testing
module.exports = {
  app,
  startServer
};