// Use ES Modules since package.json has "type": "module"
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Database connection - dynamically import since these are ES modules
let pool;
let callOpenAI;

// Import dependencies asynchronously
const initDependencies = async () => {
  const { pool: dbPool } = await import('./server/db.js');
  const { callOpenAI: xaiClient } = await import('./server/utils/xaiClient.js');
  
  pool = dbPool;
  callOpenAI = xaiClient;
  
  console.log('Dependencies loaded successfully');
};

// Basic routes for HTML pages
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// API endpoint to test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'success', 
      time: result.rows[0],
      message: 'Database connection successful'
    });
  } catch (err) {
    console.error('Database connection test failed:', err);
    res.status(500).json({ 
      status: 'error', 
      message: err.message,
      error: 'Database connection failed'
    });
  }
});

// API endpoint to test OpenAI connection
app.get('/api/test-xai', async (req, res) => {
  try {
    console.log("Testing OpenAI API connection...");
    const response = await callOpenAI('/chat/completions', {
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Say hello in one word.' }],
      max_tokens: 10,
      temperature: 0.2
    });
    console.log("OpenAI API call successful!");
    res.json({
      success: true,
      message: 'OpenAI API test successful',
      data: response.choices?.[0]?.message?.content || 'No content returned'
    });
  } catch (error) {
    console.error("OpenAI API test failed:", error);
    res.status(500).json({ 
      success: false,
      message: 'OpenAI API test failed', 
      error: error.message 
    });
  }
});

// API endpoint to generate text using OpenAI
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, model = 'gpt-4o', max_tokens = 500, temperature = 0.7 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    console.log(`Generating text with prompt: "${prompt.substring(0, 50)}..."`);
    
    const response = await callOpenAI('/chat/completions', {
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens,
      temperature
    });
    
    // Extract and return the generated text
    const result = response.choices?.[0]?.message?.content || '';
    
    // Return the response
    res.json({
      success: true,
      result,
      model,
      usage: response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
    });
  } catch (error) {
    console.error('Error in /api/generate endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating content',
      error: error.message
    });
  }
});

// Initialize dependencies and start server
const startServer = async () => {
  try {
    // Load dependencies
    await initDependencies();
    
    // Set port and start listening
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
      console.log('Available routes:');
      console.log('  - / (Landing page)');
      console.log('  - /test (OpenAI API testing page)');
      console.log('  - /login (Login page)');
      console.log('  - /api/test-db (Test database connection)');
      console.log('  - /api/test-xai (Test OpenAI API connection)');
      console.log('  - /api/generate (Generate text with OpenAI API)');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();