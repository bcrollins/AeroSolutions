/**
 * Request Logging Middleware
 * 
 * This middleware logs information about incoming API requests
 * for monitoring and debugging purposes.
 */

const logger = require('../config/logger');

/**
 * Log API request details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function requestLogger(req, res, next) {
  // Get request start time
  const start = Date.now();
  
  // Log request details
  const requestInfo = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    body: sanitizeRequestBody(req.body),
    query: req.query,
    params: req.params
  };
  
  logger.debug(`API Request: ${req.method} ${req.originalUrl}`, requestInfo);
  
  // Add response interceptor to log response details
  const originalSend = res.send;
  res.send = function(body) {
    // Calculate request duration
    const duration = Date.now() - start;
    
    // Log response details
    const responseInfo = {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: body ? body.length : 0,
      url: req.originalUrl,
      method: req.method
    };
    
    // Log at appropriate level based on status code
    if (res.statusCode >= 500) {
      logger.error(`API Response: ${res.statusCode} ${req.method} ${req.originalUrl} (${duration}ms)`, responseInfo);
    } else if (res.statusCode >= 400) {
      logger.warn(`API Response: ${res.statusCode} ${req.method} ${req.originalUrl} (${duration}ms)`, responseInfo);
    } else {
      logger.info(`API Response: ${res.statusCode} ${req.method} ${req.originalUrl} (${duration}ms)`, responseInfo);
    }
    
    // Continue with the original send
    originalSend.call(this, body);
  };
  
  next();
}

/**
 * Sanitize request body to remove sensitive information
 * @param {Object} body - Request body
 * @returns {Object} - Sanitized body
 */
function sanitizeRequestBody(body) {
  // Don't log if no body or not an object
  if (!body || typeof body !== 'object') {
    return body;
  }
  
  // Clone the body to avoid modifying the original
  const sanitized = { ...body };
  
  // Sensitive fields to mask
  const sensitiveFields = [
    'password', 'token', 'secret', 'apiKey', 'api_key', 'key',
    'accessToken', 'access_token', 'refreshToken', 'refresh_token',
    'authToken', 'auth_token', 'credentials', 'credit_card', 'creditCard',
    'cvv', 'cvc', 'pin', 'ssn', 'social_security'
  ];
  
  // Mask sensitive fields
  Object.keys(sanitized).forEach(key => {
    const lowerKey = key.toLowerCase();
    
    // Check if the key contains any sensitive field name
    const isSensitive = sensitiveFields.some(field => 
      lowerKey.includes(field.toLowerCase())
    );
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeRequestBody(sanitized[key]);
    }
  });
  
  return sanitized;
}

module.exports = requestLogger;