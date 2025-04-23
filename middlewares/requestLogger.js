/**
 * Request Logger Middleware
 * 
 * Logs information about incoming HTTP requests
 */

const logger = require('../config/logger');

/**
 * Log request details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requestLogger = (req, res, next) => {
  // Log basic request info
  logger.info({
    type: 'request',
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Track response time and log response info
  const start = Date.now();
  
  // After response function
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel]({
      type: 'response',
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
};

module.exports = requestLogger;