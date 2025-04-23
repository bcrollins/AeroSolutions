/**
 * Main Server Entry Point
 * 
 * This file configures and starts the Express server with all middleware and routes.
 * It also handles graceful shutdown and error handling.
 */

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('express-compression');
const db = require('./config/database');
const logger = require('./config/logger');
const setupRoutes = require('./routes');

// Create Express application
const app = express();
const port = process.env.PORT || 8080;
const host = process.env.HOST || '0.0.0.0';

/**
 * Start the server
 */
function startServer() {
  try {
    // Apply security headers
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
          imgSrc: ["'self'", 'data:', 'blob:'],
          fontSrc: ["'self'", 'fonts.gstatic.com'],
          connectSrc: ["'self'", 'api.openai.com'],
        }
      }
    }));
    
    // Enable CORS
    app.use(cors());
    
    // Enable compression for responses
    app.use(compression());
    
    // Set up routes and middleware
    setupRoutes(app);
    
    // Start server
    const server = app.listen(port, host, () => {
      logger.info(`Server started on ${host}:${port}`, {
        port,
        host,
        environment: process.env.NODE_ENV || 'development'
      });
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Promise Rejection', {
        reason: reason.toString(),
        stack: reason.stack
      });
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack
      });
      
      // Exit with error
      process.exit(1);
    });
    
    // Graceful shutdown
    function gracefulShutdown() {
      logger.info('Received shutdown signal, closing server...');
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          // Close database connections
          await db.end();
          logger.info('Database connections closed');
          
          // Exit process
          logger.info('Shutdown complete');
          process.exit(0);
        } catch (err) {
          logger.error('Error during graceful shutdown', {
            error: err.message,
            stack: err.stack
          });
          process.exit(1);
        }
      });
    }
    
    // Listen for termination signals
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (err) {
    logger.error('Failed to start server', {
      error: err.message,
      stack: err.stack
    });
    process.exit(1);
  }
}

// Initialize database and start server
if (process.env.INIT_DB === 'true') {
  db.initDatabase()
    .then(() => startServer())
    .catch(err => {
      logger.error('Failed to initialize database', {
        error: err.message,
        stack: err.stack
      });
      process.exit(1);
    });
} else {
  // Just start the server without initializing database
  startServer();
}

// Export app for testing
module.exports = app;