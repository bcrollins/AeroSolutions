/**
 * Request Logging Middleware
 * 
 * This middleware logs HTTP requests with timing information.
 * It provides insights into request/response cycles for debugging and monitoring.
 */

const logger = require('../config/logger');

/**
 * Express middleware to log HTTP requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function requestLogger(req, res, next) {
  // Skip logging for specific paths (like static assets)
  if (
    req.path.startsWith('/favicon.ico') ||
    req.path.startsWith('/static/') ||
    req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)
  ) {
    return next();
  }
  
  // Capture request start time
  const start = Date.now();
  
  // Log basic request info
  logger.info(`Request started: ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: anonymizeIp(req.ip),
    userAgent: req.headers['user-agent']
  });
  
  // Create a function to log the response
  const logResponse = () => {
    // Calculate request duration
    const duration = Date.now() - start;
    
    // Use the httpRequest logger method
    logger.httpRequest(req, res, duration);
  };
  
  // Log when response is finished
  res.on('finish', logResponse);
  
  // Continue to the next middleware
  next();
}

/**
 * Anonymize IP address for privacy (replace last octet with 'x')
 * @param {string} ip - IP address to anonymize
 * @returns {string} - Anonymized IP address
 */
function anonymizeIp(ip) {
  if (!ip) return 'unknown';
  
  // Handle IPv4 addresses
  if (ip.includes('.')) {
    return ip.replace(/\d+$/, 'x');
  }
  
  // Handle IPv6 addresses
  if (ip.includes(':')) {
    return ip.replace(/:[^:]+$/, ':xxxx');
  }
  
  return ip;
}

module.exports = requestLogger;