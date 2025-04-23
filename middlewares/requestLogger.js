/**
 * Request Logger Middleware
 * 
 * HTTP request logging middleware
 */

const logger = require('../config/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Calculate request processing time
 * @param {Array} hrtime - High resolution time
 * @returns {number} - Time in milliseconds
 */
function calculateResponseTime(hrtime) {
  const [seconds, nanoseconds] = hrtime;
  return (seconds * 1000) + (nanoseconds / 1000000);
}

/**
 * Safely stringify request body for logging
 * @param {Object} body - Request body
 * @returns {string} - Sanitized JSON string
 */
function sanitizeBody(body) {
  // Ensure we don't log sensitive data
  const sensitiveFields = ['password', 'token', 'api_key', 'apiKey', 'secret', 'credit_card'];
  
  if (!body || typeof body !== 'object') {
    return undefined;
  }
  
  // Clone the body to avoid modifying the original
  const sanitized = { ...body };
  
  // Sanitize sensitive fields
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '********';
    }
  }
  
  try {
    return JSON.stringify(sanitized);
  } catch (error) {
    return '[Body cannot be serialized]';
  }
}

/**
 * Request logger middleware
 * @returns {Function} - Express middleware
 */
function requestLogger() {
  return (req, res, next) => {
    // Generate a unique ID for this request
    req.id = uuidv4();
    
    // Capture request start time
    req.startTime = process.hrtime();
    
    // Capture original response methods
    const originalEnd = res.end;
    const originalJson = res.json;
    const originalSend = res.send;
    
    // Add request ID to response headers
    res.setHeader('X-Request-ID', req.id);
    
    // Log request data
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`, {
      id: req.id,
      method: req.method,
      url: req.originalUrl,
      query: req.query,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
        'accept': req.headers['accept'],
        'referer': req.headers['referer'],
        'origin': req.headers['origin']
      },
      body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
      ip: req.headers['x-forwarded-for'] || req.ip || 'unknown'
    });
    
    // Monkey patch response methods to track response
    res.json = function (data) {
      logResponse(req, res, data);
      return originalJson.apply(res, arguments);
    };
    
    res.send = function (data) {
      logResponse(req, res, data);
      return originalSend.apply(res, arguments);
    };
    
    res.end = function (data) {
      logResponse(req, res, data);
      return originalEnd.apply(res, arguments);
    };
    
    next();
  };
}

/**
 * Log response details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 */
function logResponse(req, res, data) {
  // Skip if already logged
  if (res.responseTimed) {
    return;
  }
  
  // Mark as logged
  res.responseTimed = true;
  
  // Calculate processing time
  const ms = calculateResponseTime(process.hrtime(req.startTime));
  
  // Determine log level based on status code
  const isError = res.statusCode >= 400;
  const logFn = isError ? logger.error : logger.info;
  
  // Prepare response data for logging
  let responseData;
  if (data) {
    if (Buffer.isBuffer(data)) {
      responseData = `[Buffer of ${data.length} bytes]`;
    } else if (typeof data === 'object') {
      try {
        // Sanitize sensitive fields
        const sanitized = { ...data };
        if (sanitized.token) sanitized.token = '********';
        if (sanitized.password) sanitized.password = '********';
        responseData = JSON.stringify(sanitized);
      } catch (e) {
        responseData = '[Object cannot be serialized]';
      }
    } else if (typeof data === 'string') {
      responseData = data.length > 100 ? `${data.substring(0, 100)}... [truncated]` : data;
    }
  }
  
  // Log response data
  logFn(`Response: ${res.statusCode} ${req.method} ${req.originalUrl} (${ms.toFixed(2)}ms)`, {
    id: req.id,
    statusCode: res.statusCode,
    responseTime: ms.toFixed(2),
    responseHeaders: {
      'content-type': res.getHeader('content-type'),
      'content-length': res.getHeader('content-length')
    },
    responseData: isError ? responseData : undefined
  });
}

module.exports = requestLogger;