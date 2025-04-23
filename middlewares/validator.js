/**
 * Request Validation Middleware
 * 
 * Input validation middleware using express-validator
 */

const { validationResult, matchedData } = require('express-validator');
const { createError } = require('./errorHandler');
const logger = require('../config/logger');

/**
 * Validation middleware that checks the result of validation rules
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));
    
    logger.warn('Validation error', {
      errors: validationErrors,
      path: req.originalUrl,
      method: req.method
    });
    
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        status: 400,
        errors: validationErrors
      }
    });
  }
  
  // If validation passes, add validated data to request
  req.validatedData = matchedData(req);
  next();
}

/**
 * Custom validation middleware for OpenAI text generation requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function validateOpenAITextRequest(req, res, next) {
  const { prompt, model, max_tokens, temperature } = req.body;
  const errors = [];
  
  // Validate prompt
  if (!prompt) {
    errors.push({
      field: 'prompt',
      message: 'Prompt is required',
      value: prompt
    });
  } else if (typeof prompt !== 'string') {
    errors.push({
      field: 'prompt',
      message: 'Prompt must be a string',
      value: prompt
    });
  } else if (prompt.length < 3) {
    errors.push({
      field: 'prompt',
      message: 'Prompt must be at least 3 characters long',
      value: prompt
    });
  } else if (prompt.length > 10000) {
    errors.push({
      field: 'prompt',
      message: 'Prompt is too long, maximum is 10,000 characters',
      value: `${prompt.substring(0, 20)}... (${prompt.length} chars)`
    });
  }
  
  // Validate model if provided
  if (model !== undefined) {
    if (typeof model !== 'string') {
      errors.push({
        field: 'model',
        message: 'Model must be a string',
        value: model
      });
    } else {
      const validModels = ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'];
      if (!validModels.includes(model)) {
        errors.push({
          field: 'model',
          message: `Model must be one of: ${validModels.join(', ')}`,
          value: model
        });
      }
    }
  }
  
  // Validate max_tokens if provided
  if (max_tokens !== undefined) {
    if (typeof max_tokens !== 'number') {
      errors.push({
        field: 'max_tokens',
        message: 'max_tokens must be a number',
        value: max_tokens
      });
    } else if (max_tokens < 1 || max_tokens > 4096) {
      errors.push({
        field: 'max_tokens',
        message: 'max_tokens must be between 1 and 4096',
        value: max_tokens
      });
    }
  }
  
  // Validate temperature if provided
  if (temperature !== undefined) {
    if (typeof temperature !== 'number') {
      errors.push({
        field: 'temperature',
        message: 'temperature must be a number',
        value: temperature
      });
    } else if (temperature < 0 || temperature > 1) {
      errors.push({
        field: 'temperature',
        message: 'temperature must be between 0 and 1',
        value: temperature
      });
    }
  }
  
  // Return validation errors if any
  if (errors.length > 0) {
    logger.warn('OpenAI request validation error', {
      errors,
      path: req.originalUrl,
      method: req.method
    });
    
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        status: 400,
        errors
      }
    });
  }
  
  // If validation passes, continue
  next();
}

/**
 * Custom validation middleware for OpenAI image analysis requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function validateOpenAIImageRequest(req, res, next) {
  const { imageUrl, prompt, model } = req.body;
  const errors = [];
  
  // Validate imageUrl
  if (!imageUrl) {
    errors.push({
      field: 'imageUrl',
      message: 'Image URL is required',
      value: imageUrl
    });
  } else if (typeof imageUrl !== 'string') {
    errors.push({
      field: 'imageUrl',
      message: 'Image URL must be a string',
      value: imageUrl
    });
  } else if (!imageUrl.match(/^(https?:\/\/|\/)|(data:image\/[a-z]+;base64,)/i)) {
    errors.push({
      field: 'imageUrl',
      message: 'Image URL must be a valid HTTP URL, path, or base64 data URL',
      value: imageUrl.substring(0, 20) + '...'
    });
  }
  
  // Validate prompt if provided
  if (prompt !== undefined && typeof prompt !== 'string') {
    errors.push({
      field: 'prompt',
      message: 'Prompt must be a string',
      value: prompt
    });
  }
  
  // Validate model if provided
  if (model !== undefined) {
    if (typeof model !== 'string') {
      errors.push({
        field: 'model',
        message: 'Model must be a string',
        value: model
      });
    } else {
      const validModels = ['gpt-4o', 'gpt-4-vision-preview'];
      if (!validModels.includes(model)) {
        errors.push({
          field: 'model',
          message: `Model must be one of: ${validModels.join(', ')}`,
          value: model
        });
      }
    }
  }
  
  // Return validation errors if any
  if (errors.length > 0) {
    logger.warn('OpenAI image request validation error', {
      errors,
      path: req.originalUrl,
      method: req.method
    });
    
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        status: 400,
        errors
      }
    });
  }
  
  // If validation passes, continue
  next();
}

/**
 * Custom validation middleware for contact form requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function validateContactRequest(req, res, next) {
  const { name, email, subject, message } = req.body;
  const errors = [];
  
  // Validate name
  if (!name) {
    errors.push({
      field: 'name',
      message: 'Name is required',
      value: name
    });
  } else if (typeof name !== 'string') {
    errors.push({
      field: 'name',
      message: 'Name must be a string',
      value: name
    });
  } else if (name.length < 2) {
    errors.push({
      field: 'name',
      message: 'Name must be at least 2 characters long',
      value: name
    });
  } else if (name.length > 100) {
    errors.push({
      field: 'name',
      message: 'Name is too long, maximum is 100 characters',
      value: name
    });
  }
  
  // Validate email
  if (!email) {
    errors.push({
      field: 'email',
      message: 'Email is required',
      value: email
    });
  } else if (typeof email !== 'string') {
    errors.push({
      field: 'email',
      message: 'Email must be a string',
      value: email
    });
  } else if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push({
      field: 'email',
      message: 'Email must be a valid email address',
      value: email
    });
  }
  
  // Validate subject
  if (!subject) {
    errors.push({
      field: 'subject',
      message: 'Subject is required',
      value: subject
    });
  } else if (typeof subject !== 'string') {
    errors.push({
      field: 'subject',
      message: 'Subject must be a string',
      value: subject
    });
  } else if (subject.length < 3) {
    errors.push({
      field: 'subject',
      message: 'Subject must be at least 3 characters long',
      value: subject
    });
  } else if (subject.length > 200) {
    errors.push({
      field: 'subject',
      message: 'Subject is too long, maximum is 200 characters',
      value: subject
    });
  }
  
  // Validate message
  if (!message) {
    errors.push({
      field: 'message',
      message: 'Message is required',
      value: message
    });
  } else if (typeof message !== 'string') {
    errors.push({
      field: 'message',
      message: 'Message must be a string',
      value: message
    });
  } else if (message.length < 10) {
    errors.push({
      field: 'message',
      message: 'Message must be at least 10 characters long',
      value: message
    });
  } else if (message.length > 5000) {
    errors.push({
      field: 'message',
      message: 'Message is too long, maximum is 5000 characters',
      value: `${message.substring(0, 20)}... (${message.length} chars)`
    });
  }
  
  // Return validation errors if any
  if (errors.length > 0) {
    logger.warn('Contact form validation error', {
      errors,
      path: req.originalUrl,
      method: req.method
    });
    
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        status: 400,
        errors
      }
    });
  }
  
  // If validation passes, continue
  next();
}

module.exports = {
  validate,
  validateOpenAITextRequest,
  validateOpenAIImageRequest,
  validateContactRequest
};