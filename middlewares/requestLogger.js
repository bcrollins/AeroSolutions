/**
 * Request Logger Middleware
 * 
 * This middleware logs HTTP requests to the application.
 */

const logger = require('../config/logger');

/**
 * Request logging middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function requestLogger(req, res, next) {
  // Get request data
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  
  // Anonymize the IP address for privacy
  const anonymizedIp = logger.anonymize(ip);
  
  // Process headers
  const userAgent = req.get('user-agent') || 'unknown';
  const referer = req.get('referer') || 'none';
  
  // Log request as it comes in
  logger.http(`Request: ${method} ${originalUrl}`, {
    method,
    url: originalUrl,
    ip: anonymizedIp,
    userAgent,
    referer
  });
  
  // Capture response data when the response is finished
  res.on('finish', () => {
    // Calculate duration
    const duration = Date.now() - start;
    
    // Get response status
    const { statusCode } = res;
    
    // Set the log level based on status code
    const logLevel = statusCode >= 500 
      ? 'error' 
      : statusCode >= 400 
        ? 'warn' 
        : 'http';
    
    // Log the response
    logger[logLevel](`Response: ${statusCode} ${method} ${originalUrl} (${duration}ms)`, {
      method,
      url: originalUrl,
      statusCode,
      duration,
      ip: anonymizedIp
    });
  });
  
  // Continue to the next middleware or route handler
  next();
}

module.exports = requestLogger;