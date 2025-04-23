import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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

// Simple API endpoint to test OpenAI API
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    // Since we can't connect to OpenAI directly in this simple server,
    // we'll return a mock response for demonstration
    res.json({
      success: true,
      result: `This is a demonstration response for: "${prompt}"`,
      model: "gpt-4o",
      usage: { prompt_tokens: prompt.length, completion_tokens: 20, total_tokens: prompt.length + 20 }
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