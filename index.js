/**
 * Application Entry Point
 * 
 * Initializes and starts the Express server with all routes and middleware
 */

// Load environment variables
require('dotenv').config();

// Import dependencies
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('express-compression');

// Import custom middlewares
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');
const limiter = require('./middlewares/rateLimiter');

// Import routes
const openaiRoutes = require('./routes/openaiRoutes');
const databaseRoutes = require('./routes/databaseRoutes');
const contactRoutes = require('./routes/contactRoutes');

// Initialize app
const app = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Apply global middlewares
app.use(helmet()); // Security headers
app.use(cors()); // CORS support
app.use(compression()); // Response compression
app.use(express.json({ limit: '10mb' })); // JSON parsing with larger limit for images
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL-encoded parsing
app.use(requestLogger); // Log all requests
app.use(limiter.default); // Apply rate limiting

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route - Landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Apply API routes
app.use('/api/openai', openaiRoutes);
app.use('/api/database', databaseRoutes);
app.use('/api/contact', contactRoutes);

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found'
    }
  });
});

// Apply error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});

// Export app for testing
module.exports = app;