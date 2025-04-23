/**
 * Application Entry Point
 * 
 * Initializes and starts the Express server with all routes and middleware
 */

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { loggerMiddleware, registerGlobalErrorHandlers } = require('./middlewares/logger');
const rateLimiter = require('./middlewares/rateLimiter');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Configure view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(loggerMiddleware());

// Apply rate limiting to all API routes
app.use('/api', rateLimiter.general);

// Register global error handlers
registerGlobalErrorHandlers();

// Import routes
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes');
const openaiRoutes = require('./routes/openaiRoutes');
const databaseRoutes = require('./routes/databaseRoutes');

// Register routes
app.use('/api/users', userRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/openai', openaiRoutes);
app.use('/api/database', databaseRoutes);

// Basic routes for HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: err.message
  });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log('Available routes:');
  console.log('  - / (Landing page)');
  console.log('  - /test (Test page)');
  console.log('  - /login (Login page)');
  console.log('  - /api/users (User routes)');
  console.log('  - /api/contacts (Contact routes)');
  console.log('  - /api/openai (OpenAI routes)');
  console.log('  - /api/database (Database routes)');
});