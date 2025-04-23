/**
 * OpenAI Controller
 * 
 * This controller handles interactions with the OpenAI API.
 * It provides methods for text completion, chat functionality,
 * and other OpenAI-powered features.
 */

const OpenAI = require('openai');
const logger = require('../config/logger');
const { createError } = require('../middlewares/errorHandler');

// Initialize OpenAI client
// Note: The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Get text completion from OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getCompletion(req, res, next) {
  try {
    // Extract validated data from request body
    const { prompt, model = 'gpt-4o', maxTokens = 1024, temperature = 0.7 } = req.body;
    
    // Log the request (excluding sensitive data)
    logger.info('OpenAI completion request', {
      model,
      maxTokens,
      temperature,
      promptLength: prompt.length
    });
    
    // Make request to OpenAI API
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature
    });
    
    // Return the completion
    res.json({
      success: true,
      data: {
        text: response.choices[0].message.content,
        model: response.model,
        usage: response.usage
      }
    });
  } catch (error) {
    // Handle OpenAI API errors
    logger.error('OpenAI completion error', {
      error: error.message,
      stack: error.stack
    });
    
    // Determine appropriate error response
    if (error.status === 401) {
      return next(createError('OpenAI API key is invalid', 401, 'OPENAI_UNAUTHORIZED'));
    } else if (error.status === 429) {
      return next(createError('OpenAI rate limit exceeded', 429, 'OPENAI_RATE_LIMIT'));
    } else if (error.status === 400) {
      return next(createError(`OpenAI API error: ${error.message}`, 400, 'OPENAI_BAD_REQUEST'));
    }
    
    // Generic error
    next(createError(`OpenAI API error: ${error.message}`, 500, 'OPENAI_ERROR'));
  }
}

/**
 * Get chat completion from OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getChatCompletion(req, res, next) {
  try {
    // Extract validated data from request body
    const { 
      messages, 
      model = 'gpt-4o', 
      maxTokens = 1024, 
      temperature = 0.7,
      responseFormat = null
    } = req.body;
    
    // Log the request (excluding sensitive data)
    logger.info('OpenAI chat completion request', {
      model,
      maxTokens,
      temperature,
      messagesCount: messages.length,
      responseFormat
    });
    
    // Prepare response format option if needed
    const options = {
      model,
      messages,
      max_tokens: maxTokens,
      temperature
    };
    
    // Add response format if specified
    if (responseFormat) {
      options.response_format = { type: responseFormat };
    }
    
    // Make request to OpenAI API
    const response = await openai.chat.completions.create(options);
    
    // Return the chat completion
    res.json({
      success: true,
      data: {
        message: response.choices[0].message,
        model: response.model,
        usage: response.usage
      }
    });
  } catch (error) {
    // Handle OpenAI API errors
    logger.error('OpenAI chat completion error', {
      error: error.message,
      stack: error.stack
    });
    
    // Determine appropriate error response
    if (error.status === 401) {
      return next(createError('OpenAI API key is invalid', 401, 'OPENAI_UNAUTHORIZED'));
    } else if (error.status === 429) {
      return next(createError('OpenAI rate limit exceeded', 429, 'OPENAI_RATE_LIMIT'));
    } else if (error.status === 400) {
      return next(createError(`OpenAI API error: ${error.message}`, 400, 'OPENAI_BAD_REQUEST'));
    }
    
    // Generic error
    next(createError(`OpenAI API error: ${error.message}`, 500, 'OPENAI_ERROR'));
  }
}

/**
 * Generate image from OpenAI DALL-E
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function generateImage(req, res, next) {
  try {
    // Extract validated data from request body
    const { 
      prompt, 
      n = 1, 
      size = '1024x1024', 
      quality = 'standard',
      responseFormat = 'url'
    } = req.body;
    
    // Log the request (excluding sensitive data)
    logger.info('OpenAI image generation request', {
      promptLength: prompt.length,
      n,
      size,
      quality,
      responseFormat
    });
    
    // Make request to OpenAI API
    const response = await openai.images.generate({
      prompt,
      n,
      size,
      quality,
      response_format: responseFormat
    });
    
    // Return the generated image(s)
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    // Handle OpenAI API errors
    logger.error('OpenAI image generation error', {
      error: error.message,
      stack: error.stack
    });
    
    // Determine appropriate error response
    if (error.status === 401) {
      return next(createError('OpenAI API key is invalid', 401, 'OPENAI_UNAUTHORIZED'));
    } else if (error.status === 429) {
      return next(createError('OpenAI rate limit exceeded', 429, 'OPENAI_RATE_LIMIT'));
    } else if (error.status === 400) {
      return next(createError(`OpenAI API error: ${error.message}`, 400, 'OPENAI_BAD_REQUEST'));
    }
    
    // Generic error
    next(createError(`OpenAI API error: ${error.message}`, 500, 'OPENAI_ERROR'));
  }
}

/**
 * Check OpenAI API status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function checkStatus(req, res, next) {
  try {
    // Make a simple request to check API status
    await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5
    });
    
    // API is working
    res.json({
      success: true,
      message: 'OpenAI API is operational',
      data: {
        status: 'available',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    // Determine if this is an authentication error or service error
    if (error.status === 401) {
      logger.warn('OpenAI API key is invalid or missing');
      return res.json({
        success: false,
        message: 'OpenAI API key is invalid or missing',
        data: {
          status: 'authentication_error',
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Service might be down or unreachable
    logger.error('OpenAI API status check failed', {
      error: error.message,
      stack: error.stack
    });
    
    res.json({
      success: false,
      message: 'OpenAI API status check failed',
      data: {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
}

module.exports = {
  getCompletion,
  getChatCompletion,
  generateImage,
  checkStatus
};