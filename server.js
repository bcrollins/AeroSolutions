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
    timestamp: new Date().toISOString()
  });
});

app.get('/api/database/test', (req, res) => {
  // Just a placeholder in the simple server
  res.json({
    success: true,
    message: 'Database connection test (simulated)',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/openai/test', (req, res) => {
  // Just a placeholder in the simple server
  res.json({
    success: true,
    message: 'OpenAI API connection test (simulated)',
    timestamp: new Date().toISOString()
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found'
    }
  });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});

// Export app for testing
module.exports = app;