/**
 * Routes Index
 * 
 * This module sets up all API routes and middleware for the application.
 */

const express = require('express');
const path = require('path');
const openaiRoutes = require('./openaiRoutes');
const xaiRoutes = require('./xaiRoutes');
const databaseRoutes = require('./databaseRoutes');
const requestLogger = require('../middlewares/requestLogger');
const { errorHandlerMiddleware, notFoundMiddleware } = require('../middlewares/errorHandler');

/**
 * Configure all application routes and middleware
 * @param {Object} app - Express application instance
 */
function setupRoutes(app) {
  // Parse JSON request body
  app.use(express.json());
  
  // Parse URL-encoded request body (for forms)
  app.use(express.urlencoded({ extended: true }));
  
  // Log all incoming requests
  app.use(requestLogger);
  
  // Serve static files from the public directory
  app.use(express.static(path.join(__dirname, '../public')));
  
  // API Routes
  app.use('/api/openai', openaiRoutes); // Maintaining for backwards compatibility
  app.use('/api/xai', xaiRoutes);       // Primary AI API endpoint using XAI
  app.use('/api/ai', xaiRoutes);        // Alias for easier reference
  app.use('/api/database', databaseRoutes);
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Root route (landing page)
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
  
  // API documentation route
  app.get('/api/docs', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/api-docs.html'));
  });
  
  // Handle 404 errors
  app.use(notFoundMiddleware);
  
  // Handle all other errors
  app.use(errorHandlerMiddleware);
}

module.exports = setupRoutes;