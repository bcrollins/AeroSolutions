/**
 * OpenAI API Controller
 * 
 * This controller handles interactions with the OpenAI API.
 * It provides methods for completion, chat, and image generation.
 */

const OpenAI = require('openai');
const db = require('../config/database');
const logger = require('../config/logger');
const { createError } = require('../middlewares/errorHandler');

// Initialize OpenAI client - secret key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
    // Get user ID if authenticated (would be set by auth middleware)
    const userId = req.user ? req.user.id : null;
    
    // Get anonymized IP address
    const ipAddress = logger.anonymize(req.ip);
    
    // Insert usage log into database
    await db.query(
      `INSERT INTO api_usage_logs
       (endpoint, ip_address, user_id, tokens_used, request_time, success, error_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [endpoint, ipAddress, userId, tokensUsed, requestTime, success, errorType]
    );
  } catch (err) {
    // Just log the error, don't let it affect the response
    logger.error('Failed to log API usage', {
      error: err.message,
      endpoint,
      tokensUsed
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
    // Body is already validated by validator middleware
    const { prompt, model = 'gpt-4o', maxTokens = 500, temperature = 0.7 } = req.body;
    
    // Log the request
    logger.info('OpenAI completion request', {
      model,
      promptLength: prompt.length,
      maxTokens
    });
    
    // Call OpenAI API
    const completion = await openai.completions.create({
      model, // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      prompt,
      max_tokens: maxTokens,
      temperature
    });
    
    // Log usage
    const tokensUsed = completion.usage ? completion.usage.total_tokens : 0;
    const requestTime = Date.now() - startTime;
    
    await logApiUsage('/api/openai/completion', req, tokensUsed, requestTime);
    
    // Send response
    res.json({
      success: true,
      data: {
        text: completion.choices[0].text,
        usage: completion.usage,
        model
      }
    });
  } catch (err) {
    // Log error
    logger.error('OpenAI completion error', {
      error: err.message,
      stack: err.stack
    });
    
    // Log failed API usage
    const requestTime = Date.now() - startTime;
    await logApiUsage('/api/openai/completion', req, 0, requestTime, false, err.message);
    
    // Check for specific OpenAI errors
    if (err.response) {
      return next(createError(
        'OpenAI API error: ' + err.response.data.error.message, 
        err.response.status,
        'OPENAI_API_ERROR',
        err.response.data.error
      ));
    }
    
    // Generic error
    next(createError('Failed to generate completion', 500, 'COMPLETION_ERROR'));
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
    // Body is already validated by validator middleware
    const { 
      messages, 
      model = 'gpt-4o', 
      maxTokens = 1000, 
      temperature = 0.7,
      responseFormat = 'text'
    } = req.body;
    
    // Log the request
    logger.info('OpenAI chat request', {
      model,
      messageCount: messages.length,
      maxTokens
    });
    
    // Format options for response format
    const formattedResponseFormat = responseFormat === 'json_object' ? 
      { type: 'json_object' } : undefined;
    
    // Call OpenAI API
    const chatCompletion = await openai.chat.completions.create({
      model, // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages,
      max_tokens: maxTokens,
      temperature,
      response_format: formattedResponseFormat
    });
    
    // Log usage
    const tokensUsed = chatCompletion.usage ? chatCompletion.usage.total_tokens : 0;
    const requestTime = Date.now() - startTime;
    
    await logApiUsage('/api/openai/chat', req, tokensUsed, requestTime);
    
    // Send response
    res.json({
      success: true,
      data: {
        message: chatCompletion.choices[0].message,
        usage: chatCompletion.usage,
        model
      }
    });
  } catch (err) {
    // Log error
    logger.error('OpenAI chat completion error', {
      error: err.message,
      stack: err.stack
    });
    
    // Log failed API usage
    const requestTime = Date.now() - startTime;
    await logApiUsage('/api/openai/chat', req, 0, requestTime, false, err.message);
    
    // Check for specific OpenAI errors
    if (err.response) {
      return next(createError(
        'OpenAI API error: ' + err.response.data.error.message, 
        err.response.status,
        'OPENAI_API_ERROR',
        err.response.data.error
      ));
    }
    
    // Generic error
    next(createError('Failed to generate chat completion', 500, 'CHAT_COMPLETION_ERROR'));
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
    // Body is already validated by validator middleware
    const { 
      prompt, 
      n = 1, 
      size = '1024x1024', 
      quality = 'standard',
      responseFormat = 'url'
    } = req.body;
    
    // Log the request
    logger.info('OpenAI image generation request', {
      promptLength: prompt.length,
      n,
      size,
      quality
    });
    
    // Call OpenAI API
    const image = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n,
      size,
      quality,
      response_format: responseFormat
    });
    
    // Log usage - DALL-E doesn't return token usage
    const requestTime = Date.now() - startTime;
    await logApiUsage('/api/openai/image', req, 0, requestTime);
    
    // Send response
    res.json({
      success: true,
      data: {
        images: image.data,
        created: image.created
      }
    });
  } catch (err) {
    // Log error
    logger.error('OpenAI image generation error', {
      error: err.message,
      stack: err.stack
    });
    
    // Log failed API usage
    const requestTime = Date.now() - startTime;
    await logApiUsage('/api/openai/image', req, 0, requestTime, false, err.message);
    
    // Check for specific OpenAI errors
    if (err.response) {
      return next(createError(
        'OpenAI API error: ' + err.response.data.error.message, 
        err.response.status,
        'OPENAI_API_ERROR',
        err.response.data.error
      ));
    }
    
    // Generic error
    next(createError('Failed to generate image', 500, 'IMAGE_GENERATION_ERROR'));
  }
}

module.exports = {
  generateCompletion,
  generateChatCompletion,
  generateImage
};