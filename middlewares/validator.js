/**
 * Request Validation Middleware
 * 
 * This middleware provides request validation using Zod schemas.
 */

const { z } = require('zod');
const logger = require('../config/logger');
const { createError } = require('./errorHandler');

/**
 * Format Zod validation errors into a user-friendly structure
 * @param {Object} errors - Zod error object
 * @returns {Object} - Formatted error object
 */
function formatZodErrors(errors) {
  return errors.errors.reduce((acc, error) => {
    const path = error.path.join('.');
    acc[path] = error.message;
    return acc;
  }, {});
}

/**
 * Create a validation middleware using a Zod schema
 * @param {Object} schema - Zod schema for validation
 * @returns {Function} - Express middleware function
 */
function createValidator(schema) {
  return (req, res, next) => {
    try {
      // Validate request body against schema
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        // Format and log validation errors
        const formattedErrors = formatZodErrors(result.error);
        logger.warn('Request validation failed', {
          path: req.path,
          errors: formattedErrors
        });
        
        // Return validation error
        return next(createError(
          'Request validation failed',
          400,
          'VALIDATION_ERROR',
          { fields: formattedErrors }
        ));
      }
      
      // Replace req.body with validated data
      req.body = result.data;
      next();
    } catch (error) {
      // Handle unexpected validation errors
      logger.error('Unexpected validation error', {
        error: error.message,
        stack: error.stack
      });
      next(createError('Validation system error', 500, 'VALIDATION_SYSTEM_ERROR'));
    }
  };
}

// OpenAI completion request schema
const completionRequestSchema = z.object({
  prompt: z.string()
    .min(1, 'Prompt is required')
    .max(4000, 'Prompt exceeds maximum length of 4000 characters'),
  model: z.string().default('gpt-4o'),
  maxTokens: z.number().int().positive().max(4096).default(1024),
  temperature: z.number().min(0).max(2).default(0.7)
});

// OpenAI chat request schema
const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string().min(1)
  })).min(1, 'At least one message is required'),
  model: z.string().default('gpt-4o'),
  maxTokens: z.number().int().positive().max(4096).default(1024),
  temperature: z.number().min(0).max(2).default(0.7),
  responseFormat: z.string().nullable().default(null)
});

// OpenAI image generation request schema
const imageRequestSchema = z.object({
  prompt: z.string()
    .min(1, 'Prompt is required')
    .max(1000, 'Prompt exceeds maximum length of 1000 characters'),
  n: z.number().int().min(1).max(10).default(1),
  size: z.enum(['256x256', '512x512', '1024x1024']).default('1024x1024'),
  quality: z.enum(['standard', 'hd']).default('standard'),
  responseFormat: z.enum(['url', 'b64_json']).default('url')
});

// Contact form schema
const contactRequestSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(2, 'Subject is too short').max(200, 'Subject is too long'),
  message: z.string().min(10, 'Message is too short').max(5000, 'Message is too long'),
  company: z.string().optional()
});

// Create middleware functions for each schema
const validateCompletionRequest = createValidator(completionRequestSchema);
const validateChatRequest = createValidator(chatRequestSchema);
const validateImageRequest = createValidator(imageRequestSchema);
const validateContactRequest = createValidator(contactRequestSchema);

module.exports = {
  validateCompletionRequest,
  validateChatRequest,
  validateImageRequest,
  validateContactRequest
};