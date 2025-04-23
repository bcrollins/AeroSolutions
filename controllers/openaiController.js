/**
 * OpenAI API Controller
 * 
 * This controller handles interactions with the OpenAI API.
 * It provides methods for completion, chat, and image generation.
 */

const OpenAI = require('openai');
const logger = require('../config/logger');
const db = require('../config/database');
const { createError } = require('../middlewares/errorHandler');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Log API usage for tracking and billing
 * @param {string} endpoint - API endpoint used
 * @param {Object} req - Express request object
 * @param {number} tokensUsed - Number of tokens used
 * @param {number} requestTime - Request time in milliseconds
 * @param {boolean} success - Whether the request was successful
 * @param {string} errorType - Error type if the request failed
 */
async function logApiUsage(endpoint, req, tokensUsed, requestTime, success = true, errorType = null) {
  try {
    // Get user ID if authenticated
    const userId = req.user ? req.user.id : null;
    
    // Log to database
    await db.query(
      `INSERT INTO api_usage_logs 
      (endpoint, ip_address, user_id, tokens_used, request_time, success, error_type) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [endpoint, req.ip, userId, tokensUsed, requestTime, success, errorType]
    );
  } catch (err) {
    // Just log the error but don't fail the request
    logger.error('Failed to log API usage', {
      error: err.message,
      stack: err.stack
    });
  }
}

/**
 * Generate text completion with OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function generateCompletion(req, res, next) {
  const startTime = Date.now();
  
  try {
    // Use validated body from middleware
    const { prompt, model, maxTokens, temperature } = req.validatedBody;
    
    // Create completion
    const response = await openai.chat.completions.create({
      model: model, // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: temperature
    });
    
    // Extract content from response
    const completion = response.choices[0].message.content;
    
    // Log API usage
    await logApiUsage(
      '/api/openai/completion',
      req,
      response.usage?.total_tokens || 0,
      Date.now() - startTime
    );
    
    // Return successful response
    return res.json({
      success: true,
      data: {
        completion,
        model: response.model,
        usage: response.usage
      }
    });
  } catch (err) {
    // Log error
    await logApiUsage(
      '/api/openai/completion',
      req,
      0,
      Date.now() - startTime,
      false,
      err.message
    );
    
    // Handle API errors
    if (err.response) {
      return next(createError(
        'OpenAI API error: ' + err.message,
        err.status || 500,
        'OPENAI_API_ERROR',
        err.response.data
      ));
    }
    
    // Handle other errors
    return next(createError(
      'Failed to generate completion: ' + err.message,
      500,
      'COMPLETION_GENERATION_ERROR'
    ));
  }
}

/**
 * Generate chat completion with OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function generateChatCompletion(req, res, next) {
  const startTime = Date.now();
  
  try {
    // Use validated body from middleware
    const {
      messages,
      model,
      maxTokens,
      temperature,
      responseFormat
    } = req.validatedBody;
    
    // Create chat completion with response format option if needed
    let options = {
      model: model, // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages,
      max_tokens: maxTokens,
      temperature
    };
    
    // Add response format if json is requested
    if (responseFormat === 'json_object') {
      options.response_format = { type: 'json_object' };
    }
    
    const response = await openai.chat.completions.create(options);
    
    // Log API usage
    await logApiUsage(
      '/api/openai/chat',
      req,
      response.usage?.total_tokens || 0,
      Date.now() - startTime
    );
    
    // Return successful response
    return res.json({
      success: true,
      data: {
        message: response.choices[0].message,
        model: response.model,
        usage: response.usage
      }
    });
  } catch (err) {
    // Log error
    await logApiUsage(
      '/api/openai/chat',
      req,
      0,
      Date.now() - startTime,
      false,
      err.message
    );
    
    // Handle API errors
    if (err.response) {
      return next(createError(
        'OpenAI API error: ' + err.message,
        err.status || 500,
        'OPENAI_API_ERROR',
        err.response.data
      ));
    }
    
    // Handle other errors
    return next(createError(
      'Failed to generate chat completion: ' + err.message,
      500,
      'CHAT_GENERATION_ERROR'
    ));
  }
}

/**
 * Generate image with OpenAI DALL-E
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function generateImage(req, res, next) {
  const startTime = Date.now();
  
  try {
    // Use validated body from middleware
    const {
      prompt,
      n,
      size,
      quality,
      responseFormat
    } = req.validatedBody;
    
    // Create image
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n,
      size,
      quality,
      response_format: responseFormat
    });
    
    // Log API usage (DALL-E doesn't return token counts)
    await logApiUsage(
      '/api/openai/image',
      req,
      0, // No token count for images
      Date.now() - startTime
    );
    
    // Return successful response
    return res.json({
      success: true,
      data: {
        images: response.data,
        created: response.created
      }
    });
  } catch (err) {
    // Log error
    await logApiUsage(
      '/api/openai/image',
      req,
      0,
      Date.now() - startTime,
      false,
      err.message
    );
    
    // Handle API errors
    if (err.response) {
      return next(createError(
        'OpenAI API error: ' + err.message,
        err.status || 500,
        'OPENAI_API_ERROR',
        err.response.data
      ));
    }
    
    // Handle other errors
    return next(createError(
      'Failed to generate image: ' + err.message,
      500,
      'IMAGE_GENERATION_ERROR'
    ));
  }
}

/**
 * Check API key validity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function checkApiKey(req, res, next) {
  try {
    // Try a simple models list call to check if API key is valid
    await openai.models.list();
    
    return res.json({
      success: true,
      data: {
        status: 'valid',
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    return next(createError(
      'Invalid API key or OpenAI connection issue: ' + err.message,
      401,
      'INVALID_API_KEY'
    ));
  }
}

module.exports = {
  generateCompletion,
  generateChatCompletion,
  generateImage,
  checkApiKey
};