/**
 * Validation Middleware
 * 
 * Provides validation helpers using express-validator
 */

const { validationResult } = require('express-validator');
const logger = require('../config/logger');

/**
 * Handle validation errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Log validation errors
    logger.warn({
      type: 'validation_error',
      method: req.method,
      url: req.url,
      errors: errors.array()
    });
    
    // Return validation errors to client
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  next();
};

// Export validation middlewares
module.exports = {
  handleValidationErrors
};