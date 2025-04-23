/**
 * Input Validation Middleware
 * 
 * Validates request inputs using Joi schema validation
 */

const Joi = require('joi');
const { createError } = require('./errorHandler');

// Helper function to validate request against a schema
function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { abortEarly: false });
    
    if (error) {
      // Extract and format validation errors
      const errorDetails = error.details.map(detail => ({
        message: detail.message,
        path: detail.path,
        type: detail.type
      }));
      
      // Create API error with validation details
      return next(
        createError(
          'Input validation failed',
          400,
          'VALIDATION_ERROR',
          errorDetails
        )
      );
    }
    
    // Update request with validated and sanitized values
    req[property] = value;
    next();
  };
}

// Request body schemas

// OpenAI Text Generation Schema
const openaiTextSchema = Joi.object({
  prompt: Joi.string().required().trim().min(1).max(4000)
    .messages({
      'string.empty': 'Prompt cannot be empty',
      'string.min': 'Prompt must be at least 1 character long',
      'string.max': 'Prompt cannot exceed 4000 characters',
      'any.required': 'Prompt is required'
    }),
  model: Joi.string().trim().default('gpt-4o')
    .valid('gpt-4o', 'gpt-3.5-turbo')
    .messages({
      'any.only': 'Model must be one of: gpt-4o, gpt-3.5-turbo'
    }),
  max_tokens: Joi.number().integer().min(1).max(4000).default(1000)
    .messages({
      'number.base': 'Max tokens must be a number',
      'number.integer': 'Max tokens must be an integer',
      'number.min': 'Max tokens must be at least 1',
      'number.max': 'Max tokens cannot exceed 4000'
    }),
  temperature: Joi.number().min(0).max(2).default(0.7)
    .messages({
      'number.base': 'Temperature must be a number',
      'number.min': 'Temperature must be at least 0',
      'number.max': 'Temperature cannot exceed 2'
    })
});

// OpenAI Image Analysis Schema
const openaiImageSchema = Joi.object({
  imageUrl: Joi.string().required().uri()
    .messages({
      'string.empty': 'Image URL cannot be empty',
      'string.uri': 'Image URL must be a valid URI',
      'any.required': 'Image URL is required'
    }),
  prompt: Joi.string().trim().min(1).max(1000)
    .default('Analyze this image in detail')
    .messages({
      'string.empty': 'Prompt cannot be empty',
      'string.min': 'Prompt must be at least 1 character long',
      'string.max': 'Prompt cannot exceed 1000 characters'
    }),
  model: Joi.string().trim().default('gpt-4o')
    .valid('gpt-4o')
    .messages({
      'any.only': 'Model must be gpt-4o for image analysis'
    })
});

// Contact Form Schema
const contactSchema = Joi.object({
  name: Joi.string().required().trim().min(2).max(100)
    .messages({
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
  email: Joi.string().required().trim().email()
    .messages({
      'string.empty': 'Email cannot be empty',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required'
    }),
  phone: Joi.string().trim().min(5).max(20).allow('', null)
    .messages({
      'string.min': 'Phone must be at least 5 characters long',
      'string.max': 'Phone cannot exceed 20 characters'
    }),
  subject: Joi.string().required().trim().min(2).max(200)
    .messages({
      'string.empty': 'Subject cannot be empty',
      'string.min': 'Subject must be at least 2 characters long',
      'string.max': 'Subject cannot exceed 200 characters',
      'any.required': 'Subject is required'
    }),
  message: Joi.string().required().trim().min(10).max(5000)
    .messages({
      'string.empty': 'Message cannot be empty',
      'string.min': 'Message must be at least 10 characters long',
      'string.max': 'Message cannot exceed 5000 characters',
      'any.required': 'Message is required'
    }),
  companyName: Joi.string().trim().max(100).allow('', null)
    .messages({
      'string.max': 'Company name cannot exceed 100 characters'
    })
});

// Authentication Schema
const loginSchema = Joi.object({
  username: Joi.string().required().trim().min(3).max(50)
    .messages({
      'string.empty': 'Username cannot be empty',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 50 characters',
      'any.required': 'Username is required'
    }),
  password: Joi.string().required().min(8).max(100)
    .messages({
      'string.empty': 'Password cannot be empty',
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 100 characters',
      'any.required': 'Password is required'
    })
});

// Registration Schema
const registrationSchema = Joi.object({
  username: Joi.string().required().trim().min(3).max(50)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .messages({
      'string.empty': 'Username cannot be empty',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 50 characters',
      'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
      'any.required': 'Username is required'
    }),
  email: Joi.string().required().trim().email()
    .messages({
      'string.empty': 'Email cannot be empty',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string().required().min(8).max(100)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .messages({
      'string.empty': 'Password cannot be empty',
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 100 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),
  confirmPassword: Joi.string().required().valid(Joi.ref('password'))
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    }),
  fullName: Joi.string().trim().min(2).max(100)
    .messages({
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name cannot exceed 100 characters'
    })
});

// Export validation middlewares
module.exports = {
  validateOpenAITextRequest: validate(openaiTextSchema),
  validateOpenAIImageRequest: validate(openaiImageSchema),
  validateContactRequest: validate(contactSchema),
  validateLoginRequest: validate(loginSchema),
  validateRegistrationRequest: validate(registrationSchema),
  validate // Export the base validation function for custom schemas
};