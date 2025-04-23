/**
 * Main Server Application
 * 
 * This file configures and starts the Express server.
 * It implements the MVC pattern and incorporates middleware,
 * routes, and error handling.
 */

// Environment variables and core imports
require('dotenv').config();
const express = require('express');
const path = require('path');
const compression = require('express-compression');
const helmet = require('helmet');
const cors = require('cors');

// Import middleware
const requestLogger = require('./middlewares/requestLogger');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

// Import route handlers
const apiRoutes = require('./routes/index');

// Import configuration
const logger = require('./config/logger');
const db = require('./config/database');

// Import Vite if not in production
const isProduction = process.env.NODE_ENV === 'production';
let vite;
if (!isProduction) {
  vite = require('./server/vite');
}

// Create Express application
const app = express();

// Configure application port
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';  // Listen on all interfaces

// Initialize database tables
db.initDatabase()
  .then(() => {
    logger.info('Database initialized successfully');
  })
  .catch((error) => {
    logger.error('Database initialization failed', {
      error: error.message,
      stack: error.stack
    });
    
    // Continue starting the server even if database init fails
    // Individual routes requiring the database will fail gracefully
  });

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false  // Disabled to allow Vite in development
}));
app.use(cors());

// Request handling middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Request logging
app.use(requestLogger);

// Mount API routes
app.use('/api', apiRoutes);

// For development, use Vite middleware
if (!isProduction && vite) {
  app.use(vite);
} else {
  // For production, serve static files from client/dist
  app.use(express.static(path.join(__dirname, 'client/dist')));
  
  // Serve index.html for all non-API routes (client-side routing)
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, 'client/dist/index.html'));
    }
  });
}

// Error handling middleware - must be after all routes
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Start the server
 */
function startServer() {
  // Start the server
  const server = app.listen(PORT, HOST, () => {
    logger.info(`Server running at http://${HOST}:${PORT}`);
  });
  
  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`Port ${PORT} is already in use. Please choose a different port.`);
    } else {
      logger.error('Server error', {
        error: error.message,
        stack: error.stack
      });
    }
    process.exit(1);
  });
  
  // Graceful shutdown
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  
  function gracefulShutdown() {
    logger.info('Received shutdown signal, closing server...');
    
    // Close the HTTP server
    server.close(() => {
      logger.info('HTTP server closed');
      
      // Close database connections
      db.end()
        .then(() => {
          logger.info('Database connections closed');
          process.exit(0);
        })
        .catch((err) => {
          logger.error('Error closing database connections', {
            error: err.message,
            stack: err.stack
          });
          process.exit(1);
        });
    });
    
    // Force close if graceful shutdown takes too long
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  }
  
  return server;
}

// If this file is run directly, start the server
if (require.main === module) {
  startServer();
}

// Export for testing
module.exports = {
  app,
  startServer
};