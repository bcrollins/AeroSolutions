/**
 * Simple Backup Express Server
 * 
 * This is a minimal backup server that runs if the main server fails
 */
const express = require('express');
const path = require('path');
const fs = require('fs');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: 'backup-server',
    timestamp: new Date().toISOString()
  });
});

// API status route
app.get('/api', (req, res) => {
  res.json({
    status: 'limited',
    mode: 'backup-server',
    message: 'Running in backup mode. Limited functionality available.',
    timestamp: new Date().toISOString()
  });
});

// OpenAI status route
app.get('/api/openai/test', (req, res) => {
  res.json({
    success: false,
    error: {
      message: 'OpenAI service unavailable in backup mode',
      status: 'service_unavailable'
    }
  });
});

// Database status route
app.get('/api/database/test', (req, res) => {
  res.json({
    success: false,
    error: {
      message: 'Database service unavailable in backup mode',
      status: 'service_unavailable'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error in backup mode',
      status: 'internal_error'
    }
  });
});

// Catch all unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found in backup mode`,
      status: 'not_found'
    }
  });
});

// Start server
function startBackupServer() {
  return app.listen(PORT, HOST, () => {
    console.log(`🔄 Backup server running at http://${HOST}:${PORT}`);
    console.log('⚠️ Running in limited functionality mode');
    
    // Log to file as well
    const logDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }
    
    fs.appendFileSync(
      path.join(logDir, 'backup-server.log'),
      `[${new Date().toISOString()}] Backup server started on port ${PORT}\n`
    );
  });
}

// If this file is run directly, start the server
if (require.main === module) {
  startBackupServer();
}

module.exports = { app, startBackupServer };