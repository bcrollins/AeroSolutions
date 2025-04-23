/**
 * Simple Backup Express Server
 * 
 * This is a minimal backup server that runs if the main server fails.
 * It provides basic functionality and diagnostics without all the features
 * of the main server.
 */

// Load environment variables
require('dotenv').config();

// Core dependencies
const express = require('express');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Basic logging
const log = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  
  // Also append to a log file
  try {
    const logDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    fs.appendFileSync(
      path.join(logDir, 'backup-server.log'),
      `[${timestamp}] ${message}\n`
    );
  } catch (error) {
    console.error(`Failed to write to log file: ${error.message}`);
  }
};

// Basic request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    log(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

// Parse JSON
app.use(express.json({ limit: '1mb' }));

// Basic error handler
const errorHandler = (err, req, res, next) => {
  log(`Error: ${err.message}`);
  
  res.status(500).json({
    success: false,
    error: {
      message: 'An error occurred',
      code: 'SERVER_ERROR'
    }
  });
};

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Basic API health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backup server is operational',
    data: {
      mode: 'backup',
      timestamp: new Date().toISOString()
    }
  });
});

// OpenAI status check
app.get('/api/openai/status', (req, res) => {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  
  res.json({
    success: true,
    data: {
      apiStatus: hasOpenAI ? 'available' : 'unconfigured',
      hasApiKey: hasOpenAI,
      mode: 'backup'
    }
  });
});

// Landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Default 404 handler
app.use((req, res) => {
  log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      code: 'ROUTE_NOT_FOUND'
    }
  });
});

// Error handler
app.use(errorHandler);

/**
 * Start the backup server
 */
function startBackupServer() {
  app.listen(PORT, HOST, () => {
    log(`Backup server started on ${HOST}:${PORT}`);
    log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Start the server if this file is executed directly
if (require.main === module) {
  startBackupServer();
}

module.exports = {
  app,
  startBackupServer
};