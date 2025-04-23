/**
 * Logger Middleware
 * 
 * Handles request logging and response time tracking
 */

/**
 * Middleware to log HTTP requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requestLogger = (req, res, next) => {
  // Get request timestamp
  const startTime = Date.now();
  
  // Store original end method
  const originalEnd = res.end;
  
  // Log URL, method, and IP address
  const logData = {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
  };
  
  // Override end method to capture response status and timing
  res.end = function(chunk, encoding) {
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
    
    // Add response data to log
    logData.statusCode = res.statusCode;
    logData.responseTime = responseTime;
    
    // Log warning for slow responses (over 1 second)
    if (responseTime > 1000) {
      console.warn(`Slow response (${responseTime}ms): ${logData.method} ${logData.url}`);
    }
    
    // Mask sensitive routes from logging content
    const isSensitiveRoute = 
      logData.url.includes('/auth') || 
      logData.url.includes('/user') || 
      logData.url.includes('/login') || 
      logData.url.includes('/register');
    
    // Format and output log
    const logEntry = `${logData.timestamp} [${logData.method}] ${logData.url} ${logData.statusCode} in ${logData.responseTime}ms`;
    
    // Use different log levels based on status code
    if (logData.statusCode >= 500) {
      console.error(logEntry);
    } else if (logData.statusCode >= 400) {
      console.warn(logEntry);
    } else {
      console.log(logEntry);
    }
    
    // Save logs to database if needed (implementation left for separate module)
  };
  
  next();
};

/**
 * Middleware to log errors
 * @param {Object} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorLogger = (err, req, res, next) => {
  // Log error details
  console.error(`Error: ${err.message}`, {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress,
    timestamp: new Date().toISOString(),
    stack: err.stack
  });
  
  // Pass error to next middleware
  next(err);
};

module.exports = {
  requestLogger,
  errorLogger
};