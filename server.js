/**
 * Main Express Server Application
 * 
 * This is the main entry point for the API Platform
 */
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('express-compression');
const { errorHandler } = require('./middlewares/errorHandler');
const requestLogger = require('./middlewares/requestLogger');
const { apiLimiter, openaiLimiter } = require('./middlewares/rateLimiter');
const logger = require('./config/logger');

// Import routes
const openaiRoutes = require('./routes/openaiRoutes');
const databaseRoutes = require('./routes/databaseRoutes');

// Initialize express app
const app = express();

// Get port from environment or default to 8080
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Apply global middlewares
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for all routes
app.use(compression()); // Compress responses
app.use(express.json({ limit: '10mb' })); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded request bodies

// Request logging
app.use(requestLogger);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Register API routes with appropriate rate limiters
app.use('/api/openai', openaiLimiter, openaiRoutes);
app.use('/api/database', databaseRoutes);

// Base route serves the landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API information route
app.get('/api', (req, res) => {
  res.json({
    name: 'AI Platform API',
    version: '1.0.0',
    description: 'RESTful API with OpenAI integration',
    documentation: '/api/docs',
    status: 'online',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Catch-all for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.originalUrl}`,
    },
  });
});

// Global error handler
app.use(errorHandler);

// Start the server
function startServer() {
  try {
    const server = app.listen(PORT, HOST, () => {
      logger.info(`Server running at http://${HOST}:${PORT}`);
      logger.info(`API available at http://${HOST}:${PORT}/api`);
    });

    // Handle shutdown gracefully
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    // Unhandled rejection handler
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', {
        promise: promise,
        reason: reason,
      });
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', { error: error.message });
    process.exit(1);
  }
}

// If this file is run directly, start the server
if (require.main === module) {
  startServer();
}

// Export for testing
module.exports = { app, startServer };