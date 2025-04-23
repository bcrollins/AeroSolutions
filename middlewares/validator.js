/**
 * Request Validation Middleware
 * 
 * This middleware provides validation for API request bodies using Zod.
 * It ensures that inputs meet the required schema before processing.
 */

const { z } = require('zod');
const { createError } = require('./errorHandler');

// Create a validation middleware factory
function validateRequest(schema) {
  return (req, res, next) => {
    try {
      // Validate the request body against the schema
      const result = schema.safeParse(req.body);
      
      // If validation fails, create a formatted error response
      if (!result.success) {
        // Format Zod errors into a more readable structure
        const formattedErrors = result.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        // Return validation error response
        return next(createError(
          'Validation failed', 
          400, 
          'VALIDATION_ERROR', 
          { errors: formattedErrors }
        ));
      }
      
      // If validation passes, attach the validated data to the request
      req.validatedBody = result.data;
      next();
    } catch (err) {
      // Handle unexpected validation errors
      next(createError('Validation error', 500, 'VALIDATION_SYSTEM_ERROR'));
    }
  };
}

/* 
 * OpenAI Request Validators
 */

// Schema for OpenAI text completion
const completionSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  model: z.string().default('gpt-4o'),
  maxTokens: z.number().int().positive().max(4000).default(500),
  temperature: z.number().min(0).max(1).default(0.7)
});

// Schema for OpenAI chat completion
const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string().min(1)
    })
  ).min(1, 'At least one message is required'),
  model: z.string().default('gpt-4o'),
  maxTokens: z.number().int().positive().max(4000).default(1000),
  temperature: z.number().min(0).max(1).default(0.7),
  responseFormat: z.enum(['text', 'json_object']).default('text')
});

// Schema for DALL-E image generation
const imageSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(4000),
  n: z.number().int().min(1).max(10).default(1),
  size: z.enum(['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792']).default('1024x1024'),
  quality: z.enum(['standard', 'hd']).default('standard'),
  responseFormat: z.enum(['url', 'b64_json']).default('url')
});

/* 
 * Contact Form Validator
 */

// Schema for contact form submissions
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional(),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
  company: z.string().max(100).optional()
});

// Export validators
module.exports = {
  // Request validation factory
  validateRequest,
  
  // OpenAI validators
  validateCompletionRequest: validateRequest(completionSchema),
  validateChatRequest: validateRequest(chatSchema),
  validateImageRequest: validateRequest(imageSchema),
  
  // Contact form validator
  validateContactRequest: validateRequest(contactSchema),
  
  // Export schemas for reuse
  schemas: {
    completion: completionSchema,
    chat: chatSchema,
    image: imageSchema,
    contact: contactSchema
  }
};