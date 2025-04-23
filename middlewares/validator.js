/**
 * Request Validation Middleware
 * 
 * This middleware validates request bodies against schemas
 * to ensure data integrity and security.
 */

const { z } = require('zod');
const logger = require('../config/logger');
const { createError } = require('./errorHandler');

// Format Zod errors for readable response
const formatZodError = (error) => {
  return error.errors.map(err => ({
    path: err.path.join('.'),
    message: err.message
  }));
};

// Generic validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const formattedErrors = formatZodError(result.error);
        
        logger.warn('Request validation failed', {
          path: req.path,
          method: req.method,
          errors: formattedErrors
        });
        
        return next(createError(
          'Validation failed',
          400,
          'VALIDATION_ERROR',
          { validationErrors: formattedErrors }
        ));
      }
      
      // Replace request body with validated and transformed data
      req.body = result.data;
      next();
    } catch (error) {
      logger.error('Unexpected validation error', {
        error: error.message,
        stack: error.stack
      });
      
      next(createError(
        'Request validation error',
        500,
        'VALIDATION_SYSTEM_ERROR'
      ));
    }
  };
};

// Schema for OpenAI completion request
const completionSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  model: z.string().default('gpt-4o'),
  maxTokens: z.number().int().min(1).max(4096).default(1024),
  temperature: z.number().min(0).max(2).default(0.7)
});

// Schema for OpenAI chat request
const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string().min(1, 'Message content is required')
    })
  ).min(1, 'At least one message is required'),
  model: z.string().default('gpt-4o'),
  maxTokens: z.number().int().min(1).max(4096).default(1024),
  temperature: z.number().min(0).max(2).default(0.7),
  responseFormat: z.enum(['text', 'json_object']).nullable().default(null)
});

// Schema for OpenAI image generation request
const imageSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(1000),
  n: z.number().int().min(1).max(10).default(1),
  size: z.enum(['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792']).default('1024x1024'),
  quality: z.enum(['standard', 'hd']).default('standard'),
  responseFormat: z.enum(['url', 'b64_json']).default('url')
});

// Schema for contact form submission
const contactSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(2, 'Subject is required').max(200),
  message: z.string().min(10, 'Message is too short').max(2000),
  companyName: z.string().optional()
});

// Validator middleware instances
const validateCompletionRequest = validate(completionSchema);
const validateChatRequest = validate(chatSchema);
const validateImageRequest = validate(imageSchema);
const validateContactRequest = validate(contactSchema);

module.exports = {
  validateCompletionRequest,
  validateChatRequest,
  validateImageRequest,
  validateContactRequest,
  validate
};