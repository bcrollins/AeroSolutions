/**
 * Validation Middleware
 * 
 * This middleware provides request validation using Zod schemas.
 * It validates request data and returns standardized error responses.
 */

const { z } = require('zod');
const { createError } = require('./errorHandler');
const logger = require('../config/logger');

// Validation schemas for various endpoints

// Schema for OpenAI completion requests
const completionSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty').max(4000, 'Prompt is too long'),
  model: z.string().default('gpt-4o').optional(),
  maxTokens: z.number().int().min(1).max(4000).default(500).optional(),
  temperature: z.number().min(0).max(2).default(0.7).optional(),
});

// Schema for OpenAI chat requests
const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string().min(1, 'Message content cannot be empty')
    })
  ).min(1, 'At least one message is required'),
  model: z.string().default('gpt-4o').optional(),
  maxTokens: z.number().int().min(1).max(4000).default(1000).optional(),
  temperature: z.number().min(0).max(2).default(0.7).optional(),
  responseFormat: z.enum(['text', 'json_object']).default('text').optional(),
});

// Schema for OpenAI image generation requests
const imageSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty').max(1000, 'Prompt is too long'),
  n: z.number().int().min(1).max(10).default(1).optional(),
  size: z.enum(['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792']).default('1024x1024').optional(),
  quality: z.enum(['standard', 'hd']).default('standard').optional(),
  responseFormat: z.enum(['url', 'b64_json']).default('url').optional(),
});

// Schema for contact form submissions
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
  company: z.string().optional(),
});

/**
 * Generic validation middleware factory
 * 
 * @param {Object} schema - Zod schema for validation
 * @returns {Function} Express middleware function
 */
function createValidator(schema) {
  return (req, res, next) => {
    try {
      // Validate request body against schema
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        // Extract validation errors
        const errorMessage = result.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        ).join('; ');
        
        // Log validation error
        logger.warn('Validation error', {
          path: req.originalUrl || req.url,
          errors: result.error.errors,
          body: JSON.stringify(req.body).substring(0, 200) // Log only the beginning
        });
        
        // Create standardized error response
        return next(createError(
          `Validation error: ${errorMessage}`, 
          400, 
          'VALIDATION_ERROR',
          { errors: result.error.errors }
        ));
      }
      
      // Replace request body with validated data
      req.body = result.data;
      next();
    } catch (err) {
      // Handle unexpected errors
      logger.error('Validator middleware error', {
        error: err.message,
        stack: err.stack
      });
      next(createError('Invalid request data', 400, 'INVALID_REQUEST_DATA'));
    }
  };
}

// Create validation middleware for different endpoints
const validateCompletionRequest = createValidator(completionSchema);
const validateChatRequest = createValidator(chatSchema);
const validateImageRequest = createValidator(imageSchema);
const validateContactRequest = createValidator(contactSchema);

module.exports = {
  validateCompletionRequest,
  validateChatRequest,
  validateImageRequest,
  validateContactRequest
};