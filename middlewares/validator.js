/**
 * Request Validation Middleware
 * 
 * This module provides middleware functions for validating API requests.
 * It uses Zod for schema validation.
 */

const { z } = require('zod');
const { createError } = require('./errorHandler');

/**
 * Generate validation middleware for a specific schema
 * @param {Object} schema - Zod schema for validation
 * @returns {Function} - Express middleware function
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        // Format Zod validation errors
        const errors = result.error.format();
        
        return next(createError(
          'Invalid request data',
          400,
          'VALIDATION_ERROR',
          { errors }
        ));
      }
      
      // Store validated data on request object
      req.validatedBody = result.data;
      next();
    } catch (err) {
      return next(createError(
        'Validation error: ' + err.message,
        400,
        'VALIDATION_ERROR'
      ));
    }
  };
}

// Schema for completion requests
const completionSchema = z.object({
  prompt: z.string().min(1).max(4000),
  model: z.string().default('gpt-4o'),
  maxTokens: z.number().int().min(1).max(8192).default(1000),
  temperature: z.number().min(0).max(2).default(0.7)
});

// Schema for chat completion requests
const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant', 'function']),
      content: z.string().min(1).max(8000)
    })
  ).min(1),
  model: z.string().default('gpt-4o'),
  maxTokens: z.number().int().min(1).max(8192).default(1000),
  temperature: z.number().min(0).max(2).default(0.7),
  responseFormat: z.enum(['text', 'json_object']).optional()
});

// Schema for image generation requests
const imageSchema = z.object({
  prompt: z.string().min(1).max(1000),
  n: z.number().int().min(1).max(10).default(1),
  size: z.enum(['1024x1024', '512x512', '256x256']).default('1024x1024'),
  quality: z.enum(['standard', 'hd']).default('standard'),
  responseFormat: z.enum(['url', 'b64_json']).default('url')
});

// Create validator middleware for each schema
const validateCompletionRequest = validate(completionSchema);
const validateChatRequest = validate(chatSchema);
const validateImageRequest = validate(imageSchema);

module.exports = {
  validate,
  validateCompletionRequest,
  validateChatRequest,
  validateImageRequest
};