/**
 * Request Logger Middleware
 * 
 * This middleware logs information about incoming HTTP requests.
 * It logs request method, path, IP address (anonymized), and timing.
 */

const logger = require('../config/logger');

/**
 * Request logger middleware function
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function requestLogger(req, res, next) {
  // Start time for request timing
  const startTime = Date.now();
  
  // Capture the original IP address and anonymize it
  const ip = logger.anonymize(req.ip);
  
  // Extract basic request information
  const method = req.method;
  const url = req.originalUrl || req.url;
  const userAgent = req.get('user-agent') || 'unknown';
  
  // Log incoming request
  logger.info('Request received', {
    method,
    url,
    ip,
    userAgent: userAgent.substring(0, 100) // Truncate long user agent strings
  });
  
  // Capture the response
  const originalSend = res.send;
  res.send = function(data) {
    // Calculate request duration
    const duration = Date.now() - startTime;
    
    // Log response information
    logger.info('Response sent', {
      method,
      url,
      statusCode: res.statusCode,
      duration: duration + 'ms',
      contentLength: data ? data.length : 0
    });
    
    // Log errors with more detail
    if (res.statusCode >= 400) {
      logger.warn('Error response', {
        method,
        url,
        statusCode: res.statusCode,
        ip,
        duration: duration + 'ms'
      });
    }
    
    // Call the original send function
    return originalSend.call(this, data);
  };
  
  next();
}

module.exports = requestLogger;