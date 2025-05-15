/**
 * Validation Middleware
 * 
 * This module provides middleware for validating request data
 * using the Zod validation library.
 */

const { z } = require('zod');
const { createError } = require('./errorHandler');

/**
 * Create a validation middleware for request body
 * @param {Object} schema - Zod schema to validate against
 * @returns {Function} - Express middleware function
 */
function validateBody(schema) {
  return (req, res, next) => {
    try {
      // Validate request body against schema
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        // If validation fails, format the errors
        const formattedErrors = formatZodErrors(result.error);
        
        // Return validation error
        return next(createError(
          'Validation error: ' + formattedErrors.message,
          400,
          'VALIDATION_ERROR',
          { errors: formattedErrors.errors }
        ));
      }
      
      // Attach validated body to request for downstream middleware/routes
      req.validatedBody = result.data;
      next();
    } catch (err) {
      // Handle unexpected errors
      next(createError(
        'Validation error: ' + err.message,
        400,
        'VALIDATION_ERROR'
      ));
    }
  };
}

/**
 * Format Zod validation errors for client consumption
 * @param {Object} error - Zod error object
 * @returns {Object} - Formatted error object
 */
function formatZodErrors(error) {
  const errors = {};
  
  // Extract field-specific errors
  error.errors.forEach(err => {
    const field = err.path.join('.');
    errors[field] = errors[field] || [];
    errors[field].push(err.message);
  });
  
  // Create summary message
  const message = Object.entries(errors)
    .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
    .join('; ');
  
  return {
    message: message || 'Validation failed',
    errors
  };
}

// Define schemas for AI API validation

// Schema for text completion requests
const completionSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(4000, 'Prompt is too long'),
  model: z.string().optional().default('grok-2-1212'),
  maxTokens: z.number().int().positive().max(4000).optional().default(1000),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  responseFormat: z.string().optional()
});

// Schema for chat completion requests
const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string().min(1).max(4000)
    })
  ).min(1, 'At least one message is required'),
  model: z.string().optional().default('grok-2-1212'),
  maxTokens: z.number().int().positive().max(4000).optional().default(1000),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  responseFormat: z.string().optional()
});

// Schema for image generation requests
const imageSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(1000, 'Prompt is too long'),
  n: z.number().int().min(1).max(10).optional().default(1),
  size: z.enum(['256x256', '512x512', '1024x1024']).optional().default('1024x1024'),
  quality: z.enum(['standard', 'hd']).optional().default('standard'),
  responseFormat: z.enum(['url', 'b64_json']).optional().default('url')
});

// Schema for vision/image analysis requests
const visionSchema = z.object({
  image: z.string().min(1, 'Image data is required'),
  prompt: z.string().max(1000, 'Prompt is too long').optional(),
  model: z.string().optional().default('grok-2-vision-1212'),
  maxTokens: z.number().int().positive().max(4000).optional().default(1000),
  temperature: z.number().min(0).max(2).optional().default(0.7)
});

// Export validation middleware for different requests
module.exports = {
  validateBody,
  validateCompletionRequest: validateBody(completionSchema),
  validateChatRequest: validateBody(chatSchema),
  validateImageRequest: validateBody(imageSchema),
  validateVisionRequest: validateBody(visionSchema)
};