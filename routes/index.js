/**
 * Routes Index
 * 
 * This module serves as a central location to register all API routes.
 * It exports a function that sets up all routes on the Express application.
 */

const express = require('express');
const path = require('path');
const openaiRoutes = require('./openaiRoutes');
const databaseRoutes = require('./databaseRoutes');
const { errorHandlerMiddleware, notFoundMiddleware } = require('../middlewares/errorHandler');
const requestLogger = require('../middlewares/requestLogger');
const { standardLimiter } = require('../middlewares/rateLimiter');

/**
 * Configure routes on the Express application
 * @param {Object} app - Express application instance
 */
function setupRoutes(app) {
  // Apply global middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);
  
  // Serve static files from public directory
  app.use(express.static(path.join(process.cwd(), 'public')));
  
  // Apply rate limiting to all API routes
  app.use('/api', standardLimiter);
  
  // Mount API routes
  app.use('/api/openai', openaiRoutes);
  app.use('/api/database', databaseRoutes);
  
  // Root route - landing page
  app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
  });

  // API status route
  app.get('/api/status', (req, res) => {
    res.json({
      success: true,
      data: {
        status: 'operational',
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    });
  });
  
  // Documentation route
  app.get('/docs', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'docs.html'));
  });
  
  // Handle 404 errors for undefined routes
  app.use(notFoundMiddleware);
  
  // Global error handler
  app.use(errorHandlerMiddleware);
}

module.exports = setupRoutes;