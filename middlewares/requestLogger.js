/**
 * Request Logger Middleware
 * 
 * This middleware logs all incoming HTTP requests with details such as
 * method, path, status code, and response time.
 */

const logger = require('../config/logger');

/**
 * Middleware to log HTTP requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function requestLogger(req, res, next) {
  // Get timestamp when request started
  const startTime = Date.now();
  
  // Store original end function
  const originalEnd = res.end;
  
  // Override end function
  res.end = function(chunk, encoding) {
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Log the request with anonymized IP
    const logData = {
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: logger.anonymize(req.ip),
      userAgent: req.get('user-agent') || 'unknown'
    };
    
    // Use appropriate log level based on status code
    if (res.statusCode >= 500) {
      logger.error('Request completed with server error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request completed with client error', logData);
    } else {
      logger.info('Request completed successfully', logData);
    }
    
    // Call original end function
    originalEnd.call(res, chunk, encoding);
  };
  
  // Debug level log for incoming requests
  logger.debug('Incoming request', {
    method: req.method,
    path: req.originalUrl || req.url,
    ip: logger.anonymize(req.ip)
  });
  
  next();
}

module.exports = requestLogger;