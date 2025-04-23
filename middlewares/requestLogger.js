/**
 * Request Logger Middleware
 * 
 * This middleware logs incoming requests to the API.
 */

const logger = require('../config/logger');

/**
 * Request logging middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function requestLogger(req, res, next) {
  // Get the start time for calculating request duration
  req.startTime = Date.now();
  
  // Get IP address (anonymize it for logging)
  const ip = logger.anonymize(req.ip);
  
  // Log the request
  logger.info(`${req.method} ${req.originalUrl || req.url}`, {
    method: req.method,
    path: req.originalUrl || req.url,
    ip,
    userAgent: req.get('user-agent'),
    referrer: req.get('referer') || req.get('referrer')
  });
  
  // Log response when it completes
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    // Calculate request duration
    const duration = Date.now() - req.startTime;
    
    // Restore original end function and call it
    res.end = originalEnd;
    res.end(chunk, encoding);
    
    // Log the response
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    logger[logLevel](`${res.statusCode} ${req.method} ${req.originalUrl || req.url}`, {
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      duration,
      ip
    });
  };
  
  next();
}

module.exports = requestLogger;