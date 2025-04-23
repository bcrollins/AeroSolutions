/**
 * Request Logger Middleware
 * 
 * This middleware logs information about incoming HTTP requests
 * and their responses to help with debugging and monitoring.
 */

const logger = require('../config/logger');

/**
 * Log details about the HTTP request and response
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 10);
  
  // Store requestId on request object for later use
  req.requestId = requestId;
  
  // Destructure and mask sensitive information  
  const { method, originalUrl, ip: rawIp, headers } = req;
  const ip = logger.anonymize(rawIp || req.connection.remoteAddress);
  const userAgent = headers['user-agent'];
  const referer = headers['referer'] || headers['referrer'];
  
  // Log request start with minimal details
  logger.info(`${method} ${originalUrl} - Request started`, {
    requestId,
    method,
    path: originalUrl,
    ip,
    userAgent: userAgent?.substring(0, 100),
    referer: referer?.substring(0, 100)
  });
  
  // Override end method to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Call original end method
    originalEnd.apply(res, arguments);
    
    // Get response status code
    const statusCode = res.statusCode;
    const logLevel = statusCode >= 400 ? (statusCode >= 500 ? 'error' : 'warn') : 'info';
    
    // Log response
    logger[logLevel](`${method} ${originalUrl} - ${statusCode}`, {
      requestId,
      method,
      path: originalUrl,
      ip,
      statusCode,
      responseTime,
      contentType: res.getHeader('content-type'),
      contentLength: res.getHeader('content-length')
    });
  };
  
  next();
}

module.exports = requestLogger;