import express from 'express';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES Module compatibility for __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check for OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY environment variable is not set. OpenAI API calls will fail.');
}

// Create Express application
const app = express();
app.use(express.json());
app.use(express.static('public'));

// Database connection check
async function testDatabaseConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('Database connection successful:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

// Create a basic landing page if it doesn't exist
const publicDir = path.join(__dirname, 'public');
const indexPath = path.join(publicDir, 'index.html');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

if (!fs.existsSync(indexPath)) {
  const landingPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenAI API Service - Simple Server</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      text-align: center;
      color: #2a2a72;
    }
    .card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin: 20px 0;
    }
    .status {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 20px;
      font-weight: bold;
      margin-left: 10px;
    }
    .active {
      background: #d4edda;
      color: #155724;
    }
    .inactive {
      background: #f8d7da;
      color: #721c24;
    }
    code {
      background: #f1f1f1;
      padding: 2px 5px;
      border-radius: 3px;
      font-family: 'Courier New', Courier, monospace;
    }
  </style>
</head>
<body>
  <h1>OpenAI API Service</h1>
  
  <div class="card">
    <h2>Server Status <span class="status active">Running</span></h2>
    <p>The simple server is currently running on port 8080.</p>
  </div>

  <div class="card">
    <h2>API Status</h2>
    <p>OpenAI API Key: <code>${process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured'}</code></p>
    <p>Database: <span id="db-status">Checking...</span></p>
  </div>

  <div class="card">
    <h2>Available Endpoints</h2>
    <ul>
      <li><code>GET /api/status</code> - Check API status</li>
      <li><code>POST /api/test</code> - Test endpoint that returns the request body</li>
    </ul>
  </div>

  <script>
    // Check database status via API
    fetch('/api/status')
      .then(response => response.json())
      .then(data => {
        document.getElementById('db-status').textContent = data.database ? 'Connected' : 'Not connected';
        document.getElementById('db-status').className = data.database ? 'status active' : 'status inactive';
      })
      .catch(error => {
        document.getElementById('db-status').textContent = 'Error checking status';
        document.getElementById('db-status').className = 'status inactive';
      });
  </script>
</body>
</html>`;

  fs.writeFileSync(indexPath, landingPage);
  console.log('Created landing page at', indexPath);
}

// API routes
app.get('/api/status', async (req, res) => {
  const dbConnected = await testDatabaseConnection();
  
  res.json({
    success: true,
    server: 'running',
    database: dbConnected,
    openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
    timestamp: new Date()
  });
});

app.post('/api/test', (req, res) => {
  res.json({
    success: true,
    received: req.body,
    timestamp: new Date()
  });
});

// Root route
app.get('/', (req, res) => {
  res.sendFile(indexPath);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

// Start server on port 8080 and listen on all interfaces
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple server running at http://0.0.0.0:${PORT}`);
  console.log('API status available at /api/status');
});