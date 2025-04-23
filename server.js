/**
 * Main Express Server Application
 * 
 * This is the main entry point for the API Platform
 */
const express = require('express');
const helmet = require('helmet');
const compression = require('express-compression');
const path = require('path');
const cors = require('cors');
const logger = require('./config/logger');

// Middleware imports
const errorHandler = require('./middlewares/errorHandler');
const requestLogger = require('./middlewares/requestLogger');
const { apiLimiter } = require('./middlewares/rateLimiter');

// Route imports
const openaiRoutes = require('./routes/openaiRoutes');
const databaseRoutes = require('./routes/databaseRoutes');

// Create Express application
const app = express();

// Set server port and host
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Apply global middleware
app.use(helmet({ contentSecurityPolicy: false })); // Security headers
app.use(compression()); // Compress responses
app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies (with increased limit for image processing)
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies
app.use(requestLogger); // Log all requests

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Mount API routes
app.use('/api/openai', openaiRoutes);
app.use('/api/database', databaseRoutes);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route serving the landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API documentation route
app.get('/api', (req, res) => {
  res.json({
    message: 'API Platform - API Documentation',
    version: '1.0.0',
    endpoints: {
      '/api/openai': 'OpenAI API endpoints',
      '/api/openai/text': 'Generate text using OpenAI',
      '/api/openai/json': 'Generate JSON using OpenAI',
      '/api/openai/analyze-image': 'Analyze images using OpenAI',
      '/api/openai/test': 'Test OpenAI connection',
      '/api/database': 'Database management endpoints',
      '/api/database/status': 'Get database status',
      '/api/database/tables': 'List database tables',
      '/api/database/tables/:tableName/columns': 'Get columns for a table'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Catch-all route for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Resource not found',
      details: `The requested URL ${req.originalUrl} was not found on this server.`
    }
  });
});

// Apply global error handler
app.use(errorHandler);

// Start the server
app.listen(PORT, HOST, () => {
  logger.info(`Server running on http://${HOST}:${PORT}`);
  logger.info(`OpenAI API configured: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
  logger.info(`Database URL configured: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', { reason, stack: reason.stack });
  // Don't exit the process in production, just log it
  if (process.env.NODE_ENV !== 'production') {
    console.error('Unhandled Promise Rejection:', reason);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  // Exit with error in production to allow process manager to restart
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  } else {
    console.error('Uncaught Exception:', error);
  }
});

module.exports = app;