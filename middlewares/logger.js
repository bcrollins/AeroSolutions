/**
 * Logger Middleware
 * 
 * Middleware for logging HTTP requests and errors
 */

const pool = require('../config/database');

/**
 * Create a logger middleware
 * @returns {Function} Express middleware
 */
const loggerMiddleware = () => {
  return (req, res, next) => {
    const start = Date.now();
    
    // Log original URL and method
    const { method, originalUrl, ip } = req;
    
    // Log when the response is finished
    res.on('finish', () => {
      const responseTime = Date.now() - start;
      const { statusCode } = res;
      
      // Format log message
      const logMessage = `${method} ${originalUrl} ${statusCode} - ${responseTime}ms`;
      
      // Log to console
      if (statusCode >= 500) {
        console.error(logMessage);
      } else if (statusCode >= 400) {
        console.warn(logMessage);
      } else {
        console.log(logMessage);
      }
      
      // Log to database if status code is not successful
      if (statusCode >= 400) {
        try {
          const level = statusCode >= 500 ? 'error' : 'warn';
          
          pool.query(
            `INSERT INTO logs (
              level, message, context, source, created_at
            ) VALUES ($1, $2, $3, $4, NOW())`,
            [
              level,
              logMessage,
              JSON.stringify({
                method,
                originalUrl,
                statusCode,
                responseTime,
                ip
              }),
              'http-logger'
            ]
          );
        } catch (dbError) {
          console.error('Error logging to database:', dbError);
        }
      }
    });
    
    next();
  };
};

/**
 * Register global error handlers
 */
const registerGlobalErrorHandlers = () => {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    
    try {
      pool.query(
        `INSERT INTO logs (
          level, message, context, source, created_at
        ) VALUES ($1, $2, $3, $4, NOW())`,
        [
          'error',
          'Uncaught Exception',
          JSON.stringify({
            name: error.name,
            message: error.message,
            stack: error.stack
          }),
          'global-error-handler'
        ]
      );
    } catch (dbError) {
      console.error('Error logging to database:', dbError);
    }
    
    // Don't exit the process in development, but should in production
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Promise Rejection:', reason);
    
    try {
      pool.query(
        `INSERT INTO logs (
          level, message, context, source, created_at
        ) VALUES ($1, $2, $3, $4, NOW())`,
        [
          'error',
          'Unhandled Promise Rejection',
          JSON.stringify({
            reason: reason instanceof Error ? reason.stack : reason,
            promise: String(promise)
          }),
          'global-error-handler'
        ]
      );
    } catch (dbError) {
      console.error('Error logging to database:', dbError);
    }
  });
};

module.exports = {
  loggerMiddleware,
  registerGlobalErrorHandlers
};