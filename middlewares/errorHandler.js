/**
 * Error Handler Middleware
 * 
 * Global error handling middleware for Express
 */

/**
 * Handle errors and send appropriate response
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  // Determine status code
  const statusCode = err.statusCode || 500;
  
  // Send response
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Something went wrong!',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;