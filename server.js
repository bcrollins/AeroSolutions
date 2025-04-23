/**
 * Main Express Server Application
 * 
 * This is the main entry point for the API Platform.
 * It configures the Express server with middleware, routes,
 * and error handling for a robust API service.
 */

// Load environment variables
require('dotenv').config();

// Core dependencies
const express = require('express');
const helmet = require('helmet');
const compression = require('express-compression');
const cors = require('cors');
const path = require('path');

// Internal modules
const logger = require('./config/logger');
const db = require('./config/database');
const apiRoutes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const requestLogger = require('./middlewares/requestLogger');

// Create Express app
const app = express();

// Set server port
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Basic security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.openai.com']
    }
  }
}));

// Enable CORS
app.use(cors());

// Parse JSON and URL-encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enable compression
app.use(compression());

// Request logging
app.use(requestLogger);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', apiRoutes);

// Landing page route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch-all for unhandled routes
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

/**
 * Start the server
 */
function startServer() {
  // Test database connection
  db.query('SELECT NOW()')
    .then(() => {
      logger.info('Database connection successful');
      
      // Start the server
      app.listen(PORT, HOST, () => {
        logger.info(`Server started on ${HOST}:${PORT}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    })
    .catch(err => {
      logger.error('Failed to connect to database', { 
        error: err.message,
        stack: err.stack
      });
      // Start server even if DB connection fails
      app.listen(PORT, HOST, () => {
        logger.warn(`Server started on ${HOST}:${PORT} without database connection`);
      });
    });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received, shutting down gracefully');
  db.end()
    .then(() => {
      logger.info('Database connection closed');
      process.exit(0);
    })
    .catch(err => {
      logger.error('Error closing database connection', { 
        error: err.message,
        stack: err.stack
      });
      process.exit(1);
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason.toString(),
    stack: reason.stack
  });
});

// Start the server if this file is executed directly
if (require.main === module) {
  startServer();
}

module.exports = app;