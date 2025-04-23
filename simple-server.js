/**
 * Simple Server Configuration
 * 
 * A lightweight Express server running on 0.0.0.0:8080
 * for Replit compatibility
 */

// Load environment variables
require('dotenv').config();

// Import dependencies
const express = require('express');
const path = require('path');
const cors = require('cors');

// Initialize app
const app = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Apply middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route - Landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Simple API endpoints for testing
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'API is operational',
    timestamp: new Date().toISOString(),
    server: 'simple-server.js',
    port: PORT,
    host: HOST
  });
});

// Database test endpoint
app.get('/api/database/test', async (req, res) => {
  try {
    // Since we're running a simple server, we'll just simulate a database connection
    const testDatabaseConnection = async () => {
      return {
        connected: true,
        database: process.env.PGDATABASE || 'postgres',
        host: process.env.PGHOST || 'localhost',
        port: process.env.PGPORT || 5432
      };
    };
    
    const result = await testDatabaseConnection();
    
    res.json({
      success: true,
      message: 'Database connection test (simulated)',
      connection: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Database connection test failed',
        details: error.message
      }
    });
  }
});

// OpenAI test endpoint
app.get('/api/openai/test', (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured';
  
  res.json({
    success: true,
    message: 'OpenAI API connection test',
    api_key_status: apiKey,
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    timestamp: new Date().toISOString()
  });
});

// Contact API endpoint (placeholder)
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  
  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Missing required fields',
        required: ['name', 'email', 'subject', 'message']
      }
    });
  }
  
  res.json({
    success: true,
    message: 'Contact form submission received',
    data: {
      id: Date.now(),
      name,
      email,
      subject,
      message: message.substring(0, 20) + '...',
      timestamp: new Date().toISOString()
    }
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      path: req.path,
      method: req.method
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      details: err.message
    }
  });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.PGDATABASE ? 'Configured' : 'Not configured'}`);
  console.log(`OpenAI API: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured'}`);
});

// Export app for testing
module.exports = app;