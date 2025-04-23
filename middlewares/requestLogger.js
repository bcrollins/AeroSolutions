/**
 * Request Logging Middleware
 * 
 * Logs HTTP requests for monitoring and debugging
 */

const morgan = require('morgan');
const logger = require('../config/logger');

// Define a custom token for response time
morgan.token('response-time-ms', (req, res) => {
  if (!req._startAt || !res._startAt) {
    return '';
  }
  
  const ms = (res._startAt[0] - req._startAt[0]) * 1000 +
             (res._startAt[1] - req._startAt[1]) * 1e-6;
  
  return ms.toFixed(2);
});

// Define a custom token for user ID
morgan.token('user-id', (req) => {
  return req.user ? req.user.id : 'anonymous';
});

// Define a custom token for truncated request body
morgan.token('request-body', (req) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return '';
  }
  
  // Clone request body to avoid modification
  const body = { ...req.body };
  
  // Mask sensitive fields
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'creditCard'];
  
  sensitiveFields.forEach(field => {
    if (body[field]) {
      body[field] = '********';
    }
  });
  
  // Truncate long values
  Object.keys(body).forEach(key => {
    if (typeof body[key] === 'string' && body[key].length > 100) {
      body[key] = body[key].substring(0, 97) + '...';
    }
  });
  
  // Return JSON string of sanitized body
  try {
    return JSON.stringify(body);
  } catch (error) {
    return '[Error serializing request body]';
  }
});

// Create request logger middleware
const requestLogger = morgan(
  ':method :url :status :response-time-ms ms - :res[content-length] - :user-id :request-body',
  {
    stream: logger.stream,
    skip: (req) => {
      // Skip logging for static assets or health check endpoints
      return req.url.startsWith('/public/') || 
             req.url.startsWith('/assets/') || 
             req.url === '/health' || 
             req.url === '/favicon.ico';
    }
  }
);

module.exports = requestLogger;