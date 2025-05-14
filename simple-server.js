/**
 * Simple Backup Server
 * 
 * This is a minimal server that runs when the main application
 * encounters critical errors. It provides basic routes and error
 * messages to help diagnose issues.
 */

// Core modules
const express = require('express');
const path = require('path');
const fs = require('fs');

// Create Express application
const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Basic request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Parse JSON bodies
app.use(express.json());

// Basic error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      details: process.env.NODE_ENV !== 'production' ? err.message : undefined
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backup server is running',
    timestamp: new Date().toISOString()
  });
});

// API status endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Backup API server is running',
    data: {
      mode: 'backup',
      timestamp: new Date().toISOString()
    }
  });
});

// Root landing page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Status</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          line-height: 1.6;
        }
        h1 {
          color: #333;
          border-bottom: 1px solid #eee;
          padding-bottom: 0.5rem;
        }
        .card {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 1.5rem;
          margin: 1rem 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .status {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-weight: bold;
          margin-right: 0.5rem;
        }
        .warning {
          background: #FFF3CD;
          color: #856404;
        }
        code {
          background: #eee;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-size: 0.9rem;
        }
        .button {
          display: inline-block;
          background: #007bff;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          text-decoration: none;
          margin-top: 1rem;
        }
        .button:hover {
          background: #0069d9;
        }
      </style>
    </head>
    <body>
      <h1>Application Status</h1>
      
      <div class="card">
        <h2>
          <span class="status warning">BACKUP MODE</span>
          The application is running in backup mode
        </h2>
        <p>
          The main application server encountered an error and the backup server has been activated.
          This is a simplified version with limited functionality.
        </p>
        <p>
          Time: ${new Date().toLocaleString()}
        </p>
        <p>
          <strong>What to do next:</strong>
        </p>
        <ul>
          <li>Check application logs for error details</li>
          <li>Verify that all required environment variables are set</li>
          <li>Check database connection settings</li>
          <li>Restart the application once issues are resolved</li>
        </ul>
        <a href="/api/health" class="button">Check API Status</a>
      </div>
    </body>
    </html>
  `);
});

// Catch-all for other routes
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'API endpoint not found in backup server',
        path: req.path
      }
    });
  }
  
  // For non-API routes, redirect to the root
  res.redirect('/');
});

/**
 * Start the backup server
 */
function startBackupServer() {
  // Start the server
  return app.listen(PORT, HOST, () => {
    console.log(`[BACKUP SERVER] Running at http://${HOST}:${PORT}`);
    console.log('[BACKUP SERVER] This is a limited functionality mode');
  });
}

// If this file is run directly, start the server
if (require.main === module) {
  startBackupServer();
}

// Export for use in other files
module.exports = {
  app,
  startBackupServer
};