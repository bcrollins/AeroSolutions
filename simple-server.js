import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

// Load environment variables
dotenv.config();

// Database configuration
import pg from 'pg';
const { Pool } = pg;

// Create a pool instance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as now');
    client.release();
    console.log('Database connection test successful at:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Basic routes for HTML pages
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    // Test the database connection
    const success = await testDatabaseConnection();
    
    if (success) {
      const result = await pool.query('SELECT NOW() as now');
      return res.status(200).json({
        status: 'success',
        time: { now: result.rows[0].now },
        message: 'Database connection successful'
      });
    } else {
      return res.status(500).json({
        status: 'error',
        message: 'Database connection test failed'
      });
    }
  } catch (error) {
    console.error('Error testing database connection:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Database connection error',
      error: error.message
    });
  }
});

// API endpoint to generate text using OpenAI
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not found in environment variables, using mock response');
      return res.json({
        success: true,
        result: `This is a demonstration response for: "${prompt}"`,
        model: "gpt-4o",
        usage: { prompt_tokens: prompt.length, completion_tokens: 20, total_tokens: prompt.length + 20 }
      });
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { 
          "role": "system", 
          "content": "You are a helpful assistant that provides concise, accurate answers." 
        },
        { 
          "role": "user", 
          "content": prompt 
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    // Log the request to the database
    try {
      await pool.query(
        'INSERT INTO logs (level, message, context, source) VALUES ($1, $2, $3, $4)',
        ['info', 'OpenAI API request', JSON.stringify({ prompt }), '/api/generate']
      );
    } catch (dbError) {
      console.error('Error logging to database:', dbError);
      // Continue processing even if logging fails
    }

    // Return the OpenAI response
    res.json({
      success: true,
      result: completion.choices[0].message.content,
      model: completion.model,
      usage: completion.usage
    });
  } catch (error) {
    console.error('Error in /api/generate endpoint:', error);
    
    // Log the error to the database
    try {
      await pool.query(
        'INSERT INTO logs (level, message, context, source) VALUES ($1, $2, $3, $4)',
        ['error', 'Error generating content', JSON.stringify({ error: error.message }), '/api/generate']
      );
    } catch (dbError) {
      console.error('Error logging to database:', dbError);
      // Continue processing even if logging fails
    }
    
    res.status(500).json({
      success: false,
      message: 'Error generating content',
      error: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log('Available routes:');
  console.log('  - / (Landing page)');
  console.log('  - /test (OpenAI API testing page)');
  console.log('  - /login (Login page)');
  console.log('  - /api/generate (Generate text with OpenAI API)');
});