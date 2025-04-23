/**
 * Request Validator Middleware
 * 
 * This middleware validates incoming requests against predefined schemas
 * to ensure data integrity and prevent malformed requests.
 */

const { z } = require('zod');
const logger = require('../config/logger');
const { createError } = require('./errorHandler');

/**
 * Validate OpenAI completion request
 */
const completionSchema = z.object({
  prompt: z.string().min(1).max(4000),
  model: z.string().optional(),
  maxTokens: z.number().int().positive().max(8192).optional(),
  temperature: z.number().min(0).max(2).optional()
});

/**
 * Validate OpenAI chat request
 */
const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string().min(1).max(32768)
    })
  ).min(1),
  model: z.string().optional(),
  maxTokens: z.number().int().positive().max(8192).optional(),
  temperature: z.number().min(0).max(2).optional(),
  responseFormat: z.enum(['text', 'json_object']).optional()
});

/**
 * Validate OpenAI image request
 */
const imageSchema = z.object({
  prompt: z.string().min(1).max(4000),
  n: z.number().int().min(1).max(10).optional(),
  size: z.enum(['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792']).optional(),
  quality: z.enum(['standard', 'hd']).optional(),
  responseFormat: z.enum(['url', 'b64_json']).optional()
});

/**
 * Validate contact form request
 */
const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(5000),
  company: z.string().max(255).optional()
});

/**
 * Generic request validation middleware factory
 * @param {Object} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
function validateRequest(schema) {
  return (req, res, next) => {
    try {
      const validationResult = schema.safeParse(req.body);
      
      if (!validationResult.success) {
        // Log validation errors
        logger.warn('Request validation failed', {
          path: req.path,
          errors: validationResult.error.errors,
          body: JSON.stringify(req.body).substring(0, 100) // Log first 100 chars of body
        });
        
        // Format error response with details
        const errorDetails = validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return next(createError('Validation error', 400, 'VALIDATION_ERROR', errorDetails));
      }
      
      // Replace request body with validated and transformed data
      req.body = validationResult.data;
      next();
    } catch (error) {
      logger.error('Validation middleware error', {
        error: error.message,
        stack: error.stack
      });
      next(createError('Validation internal error', 500, 'VALIDATION_SYSTEM_ERROR'));
    }
  };
}

// Create middleware functions using the factory
const validateCompletionRequest = validateRequest(completionSchema);
const validateChatRequest = validateRequest(chatSchema);
const validateImageRequest = validateRequest(imageSchema);
const validateContactRequest = validateRequest(contactSchema);

module.exports = {
  validateCompletionRequest,
  validateChatRequest,
  validateImageRequest,
  validateContactRequest
};