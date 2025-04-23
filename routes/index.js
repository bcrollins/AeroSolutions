/**
 * Main Routes Index
 * 
 * This file aggregates all the route modules and manages their
 * organization and mounting. It provides a central configuration
 * point for all API endpoints.
 */

const express = require('express');
const router = express.Router();

// Import route modules
const openaiRoutes = require('./openaiRoutes');
const databaseRoutes = require('./databaseRoutes');
const contactRoutes = require('./contactRoutes');

/**
 * Mount route modules at their respective base paths
 * 
 * Organization:
 * - /api/openai/... : OpenAI API related endpoints
 * - /api/database/... : Database management endpoints
 * - /api/contact/... : Contact form and management endpoints
 */

// Mount the OpenAI routes
router.use('/openai', openaiRoutes);

// Mount the database management routes
router.use('/database', databaseRoutes);

// Mount the contact form routes
router.use('/contact', contactRoutes);

/**
 * Root API endpoint
 * 
 * Returns API information, version, and documentation links
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'API Platform',
    version: '1.0.0',
    description: 'RESTful API with OpenAI integration and database management',
    documentation: '/api/docs',
    endpoints: {
      openai: '/api/openai',
      database: '/api/database',
      contact: '/api/contact'
    }
  });
});

module.exports = router;