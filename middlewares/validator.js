/**
 * Request Validation Middleware
 * 
 * This middleware provides validation for API requests.
 * It ensures that incoming request data meets specified requirements.
 */

const { createError } = require('./errorHandler');

/**
 * Validate contact form request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function validateContactRequest(req, res, next) {
  const { name, email, subject, message } = req.body;
  const errors = [];
  
  // Check required fields
  if (!name || name.trim() === '') {
    errors.push('Name is required');
  }
  
  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Email is invalid');
  }
  
  if (!subject || subject.trim() === '') {
    errors.push('Subject is required');
  }
  
  if (!message || message.trim() === '') {
    errors.push('Message is required');
  }
  
  // If there are validation errors, return them
  if (errors.length > 0) {
    return next(createError(
      'Validation Error: ' + errors.join(', '),
      400,
      'VALIDATION_ERROR',
      { errors }
    ));
  }
  
  // If all validations pass, continue
  next();
}

/**
 * Validate OpenAI completion request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function validateCompletionRequest(req, res, next) {
  const { prompt, model, maxTokens, temperature } = req.body;
  const errors = [];
  
  // Check required fields
  if (!prompt || prompt.trim() === '') {
    errors.push('Prompt is required');
  }
  
  // Check optional fields
  if (model && typeof model !== 'string') {
    errors.push('Model must be a string');
  }
  
  if (maxTokens !== undefined) {
    if (typeof maxTokens !== 'number' || maxTokens <= 0) {
      errors.push('Max tokens must be a positive number');
    }
  }
  
  if (temperature !== undefined) {
    if (typeof temperature !== 'number' || temperature < 0 || temperature > 1) {
      errors.push('Temperature must be a number between 0 and 1');
    }
  }
  
  // If there are validation errors, return them
  if (errors.length > 0) {
    return next(createError(
      'Validation Error: ' + errors.join(', '),
      400,
      'VALIDATION_ERROR',
      { errors }
    ));
  }
  
  // If all validations pass, continue
  next();
}

/**
 * Validate OpenAI chat completion request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function validateChatRequest(req, res, next) {
  const { messages, model, maxTokens, temperature } = req.body;
  const errors = [];
  
  // Check required fields
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    errors.push('Messages array is required and must not be empty');
  } else {
    // Validate message format
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg.role || !msg.content) {
        errors.push(`Message at index ${i} must have role and content properties`);
      } else if (!['system', 'user', 'assistant'].includes(msg.role)) {
        errors.push(`Message at index ${i} has invalid role '${msg.role}'. Must be 'system', 'user', or 'assistant'`);
      }
    }
  }
  
  // Check optional fields
  if (model && typeof model !== 'string') {
    errors.push('Model must be a string');
  }
  
  if (maxTokens !== undefined) {
    if (typeof maxTokens !== 'number' || maxTokens <= 0) {
      errors.push('Max tokens must be a positive number');
    }
  }
  
  if (temperature !== undefined) {
    if (typeof temperature !== 'number' || temperature < 0 || temperature > 1) {
      errors.push('Temperature must be a number between 0 and 1');
    }
  }
  
  // If there are validation errors, return them
  if (errors.length > 0) {
    return next(createError(
      'Validation Error: ' + errors.join(', '),
      400,
      'VALIDATION_ERROR',
      { errors }
    ));
  }
  
  // If all validations pass, continue
  next();
}

/**
 * Validate OpenAI image generation request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function validateImageRequest(req, res, next) {
  const { prompt, n, size, quality, responseFormat } = req.body;
  const errors = [];
  
  // Check required fields
  if (!prompt || prompt.trim() === '') {
    errors.push('Prompt is required');
  }
  
  // Check optional fields
  if (n !== undefined) {
    if (typeof n !== 'number' || n < 1 || n > 10 || !Number.isInteger(n)) {
      errors.push('n must be an integer between 1 and 10');
    }
  }
  
  if (size !== undefined) {
    const validSizes = ['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792'];
    if (!validSizes.includes(size)) {
      errors.push(`Size must be one of: ${validSizes.join(', ')}`);
    }
  }
  
  if (quality !== undefined) {
    const validQualities = ['standard', 'hd'];
    if (!validQualities.includes(quality)) {
      errors.push(`Quality must be one of: ${validQualities.join(', ')}`);
    }
  }
  
  if (responseFormat !== undefined) {
    const validFormats = ['url', 'b64_json'];
    if (!validFormats.includes(responseFormat)) {
      errors.push(`Response format must be one of: ${validFormats.join(', ')}`);
    }
  }
  
  // If there are validation errors, return them
  if (errors.length > 0) {
    return next(createError(
      'Validation Error: ' + errors.join(', '),
      400,
      'VALIDATION_ERROR',
      { errors }
    ));
  }
  
  // If all validations pass, continue
  next();
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether the email is valid
 */
function isValidEmail(email) {
  // Simple email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = {
  validateContactRequest,
  validateCompletionRequest,
  validateChatRequest,
  validateImageRequest
};