/**
 * Simple Backup Express Server
 * 
 * This is a minimal backup server that runs if the main server fails
 */
const express = require('express');
const path = require('path');
const cors = require('cors');

// Create Express application
const app = express();

// Set server port and host
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Apply basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route serving the landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Simple health check
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    mode: 'BACKUP',
    message: 'Running in backup mode with limited functionality'
  });
});

// Simple API info
app.get('/api', (req, res) => {
  res.json({
    message: 'API Platform - Backup Mode',
    status: 'Limited functionality available',
    error: 'Main server is down, running in backup mode'
  });
});

// OpenAI fallback endpoint
app.post('/api/openai/text', (req, res) => {
  res.status(503).json({
    success: false,
    error: {
      message: 'Service temporarily unavailable',
      details: 'OpenAI services are not available in backup mode'
    }
  });
});

// Simple catch-all for other API routes
app.use('/api/*', (req, res) => {
  res.status(503).json({
    success: false,
    error: {
      message: 'Service temporarily unavailable',
      details: 'Full API functionality is not available in backup mode'
    }
  });
});

// Catch-all route handler
app.use('*', (req, res) => {
  if (req.originalUrl.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
    return res.status(404).send('Not found');
  }
  
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, HOST, () => {
  console.log(`Backup server running on http://${HOST}:${PORT}`);
  console.log('WARNING: Running in backup mode with limited functionality');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

module.exports = app;