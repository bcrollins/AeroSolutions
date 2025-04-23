/**
 * Validator Middleware
 * 
 * Input validation middleware using express-validator
 */

const { body, query, param, validationResult } = require('express-validator');
const logger = require('../config/logger');

/**
 * Validation middleware
 * @param {Array} validations - Array of validation middleware
 * @returns {Function} - Express middleware
 */
function validate(validations) {
  return async (req, res, next) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Check for validation errors
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      // Log validation errors
      logger.warn('Validation error', {
        errors: errors.array(),
        path: req.originalUrl,
        method: req.method,
        body: req.method !== 'GET' ? req.body : undefined
      });
      
      // Format validation errors for response
      const formattedErrors = errors.array().map(error => ({
        param: error.param,
        msg: error.msg,
        location: error.location,
        value: error.value
      }));
      
      // Send validation error response
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          errors: formattedErrors
        }
      });
    }
    
    // Continue if validation passes
    next();
  };
}

/**
 * OpenAI text generation validation rules
 */
const openaiTextValidation = [
  body('prompt')
    .notEmpty()
    .withMessage('Prompt is required')
    .isString()
    .withMessage('Prompt must be a string')
    .isLength({ min: 3, max: 4000 })
    .withMessage('Prompt must be between 3 and 4000 characters'),
  
  body('model')
    .optional()
    .isString()
    .withMessage('Model must be a string'),
  
  body('max_tokens')
    .optional()
    .isInt({ min: 10, max: 4000 })
    .withMessage('Max tokens must be an integer between 10 and 4000'),
  
  body('temperature')
    .optional()
    .isFloat({ min: 0, max: 2 })
    .withMessage('Temperature must be a number between 0 and 2')
];

/**
 * OpenAI image analysis validation rules
 */
const openaiImageValidation = [
  body('imageUrl')
    .notEmpty()
    .withMessage('Image URL is required')
    .isURL()
    .withMessage('Valid image URL is required'),
  
  body('prompt')
    .optional()
    .isString()
    .withMessage('Prompt must be a string')
    .isLength({ max: 4000 })
    .withMessage('Prompt must be less than 4000 characters'),
  
  body('model')
    .optional()
    .isString()
    .withMessage('Model must be a string'),
  
  body('max_tokens')
    .optional()
    .isInt({ min: 10, max: 4000 })
    .withMessage('Max tokens must be an integer between 10 and 4000')
];

/**
 * Contact form validation rules
 */
const contactFormValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim(),
  
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isString()
    .withMessage('Subject must be a string')
    .isLength({ min: 2, max: 200 })
    .withMessage('Subject must be between 2 and 200 characters')
    .trim(),
  
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isString()
    .withMessage('Message must be a string')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Message must be between 10 and 5000 characters')
    .trim()
];

/**
 * Contact status update validation rules
 */
const contactStatusValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid contact ID is required'),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['new', 'in_progress', 'completed', 'archived'])
    .withMessage('Status must be one of: new, in_progress, completed, archived'),
  
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
    .trim()
];

/**
 * ID parameter validation rule
 */
const idParamValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid ID is required')
];

/**
 * Table name parameter validation rule
 */
const tableNameValidation = [
  param('tableName')
    .notEmpty()
    .withMessage('Table name is required')
    .isString()
    .withMessage('Table name must be a string')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Table name can only contain letters, numbers, and underscores')
];

module.exports = {
  validate,
  rules: {
    openaiText: openaiTextValidation,
    openaiImage: openaiImageValidation,
    contactForm: contactFormValidation,
    contactStatus: contactStatusValidation,
    idParam: idParamValidation,
    tableName: tableNameValidation
  }
};