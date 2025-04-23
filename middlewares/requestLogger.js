/**
 * Request Logger Middleware
 * 
 * This middleware logs incoming HTTP requests and their responses.
 * It provides visibility into API usage and performance.
 */

const logger = require('../config/logger');

/**
 * Express middleware to log HTTP requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function requestLoggerMiddleware(req, res, next) {
  // Skip logging for static assets if configured
  if (process.env.SKIP_STATIC_LOGS === 'true' && (
    req.path.startsWith('/static/') || 
    req.path.startsWith('/assets/') || 
    req.path.endsWith('.js') || 
    req.path.endsWith('.css') || 
    req.path.endsWith('.png') || 
    req.path.endsWith('.jpg') || 
    req.path.endsWith('.svg')
  )) {
    return next();
  }
  
  // Capture request start time
  const startTime = Date.now();
  
  // Log request details
  const requestLog = {
    method: req.method,
    path: req.originalUrl || req.url,
    ip: logger.anonymize(req.ip),
    userAgent: req.get('user-agent'),
    contentType: req.get('content-type'),
    timestamp: new Date().toISOString()
  };
  
  // For sensitive routes, don't log the full body
  const sensitiveRoutes = ['/api/auth', '/api/users'];
  const isSensitiveRoute = sensitiveRoutes.some(route => req.path.startsWith(route));
  
  // Include request body for non-GET requests if not sensitive
  if (req.method !== 'GET' && !isSensitiveRoute && req.body) {
    if (req.body.password) {
      // Clone body and remove password fields
      const sanitizedBody = { ...req.body };
      delete sanitizedBody.password;
      delete sanitizedBody.passwordConfirm;
      requestLog.body = sanitizedBody;
    } else {
      requestLog.body = req.body;
    }
  }
  
  logger.info(`Request: ${req.method} ${req.originalUrl || req.url}`, requestLog);
  
  // Capture response data after request is processed
  const originalSend = res.send;
  res.send = function(body) {
    res.body = body;
    return originalSend.apply(res, arguments);
  };
  
  // Log response when finished
  res.on('finish', () => {
    const responseLog = {
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      duration: Date.now() - startTime + 'ms',
      contentLength: res.get('content-length') || 0,
      timestamp: new Date().toISOString()
    };
    
    // Don't log response bodies for successful requests to avoid cluttering logs
    // Log only errors or specific endpoints if configured
    if (res.statusCode >= 400 && res.body) {
      try {
        // Attempt to parse JSON response body
        const parsedBody = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;
        
        // Only include relevant error information
        if (parsedBody.error) {
          responseLog.error = {
            message: parsedBody.error.message,
            code: parsedBody.error.code
          };
        }
      } catch (err) {
        // If we can't parse the body, just include a snippet
        if (typeof res.body === 'string') {
          responseLog.responseSummary = res.body.substring(0, 200) + 
            (res.body.length > 200 ? '...' : '');
        }
      }
    }
    
    // Log at appropriate level based on status code
    if (res.statusCode >= 500) {
      logger.error(`Response ${res.statusCode}: ${req.method} ${req.originalUrl || req.url}`, responseLog);
    } else if (res.statusCode >= 400) {
      logger.warn(`Response ${res.statusCode}: ${req.method} ${req.originalUrl || req.url}`, responseLog);
    } else {
      logger.info(`Response ${res.statusCode}: ${req.method} ${req.originalUrl || req.url}`, responseLog);
    }
  });
  
  next();
}

module.exports = requestLoggerMiddleware;