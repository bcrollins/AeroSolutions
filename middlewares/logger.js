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
  // Get request start time
  const startTime = Date.now();
  
  // Store original end method
  const originalEnd = res.end;
  
  // Override end method to log response info
  res.end = function() {
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Log request info
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} ${responseTime}ms`);
    
    // Call original end method
    return originalEnd.apply(this, arguments);
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
  console.error(`[${new Date().toISOString()}] ERROR: ${err.message}`);
  console.error(err.stack);
  
  // Pass to next error handler or return 500 if none exists
  if (next) {
    next(err);
  } else {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  requestLogger,
  errorLogger
};