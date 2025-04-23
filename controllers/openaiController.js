/**
 * OpenAI Controller
 * 
 * This controller handles API interactions with OpenAI models.
 * It provides methods for text completions, chat completions, and image generation.
 */

const { createError } = require('../middlewares/errorHandler');
const openai = require('../models/openai');
const logger = require('../config/logger');

/**
 * Handle text completion requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function handleCompletion(req, res, next) {
  try {
    // Extract validated body from the request
    const { prompt, model, maxTokens, temperature, responseFormat } = req.validatedBody;
    
    // Client IP for tracking/rate limiting
    const ip = req.ip || req.connection.remoteAddress;
    
    // Call OpenAI API
    const response = await openai.createCompletion(prompt, {
      model,
      maxTokens,
      temperature,
      responseFormat,
      ip
    });
    
    // Extract completion text from response
    const completionText = response.choices && response.choices[0] ? 
      response.choices[0].message?.content : '';
    
    // Return response
    return res.json({
      success: true,
      data: {
        completion: completionText,
        model: model,
        usage: response.usage || {}
      }
    });
  } catch (err) {
    logger.error('OpenAI completion handler error', {
      error: err.message,
      stack: err.stack
    });
    
    return next(createError(
      'Failed to generate completion: ' + err.message,
      500,
      'OPENAI_API_ERROR'
    ));
  }
}

/**
 * Handle chat completion requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function handleChatCompletion(req, res, next) {
  try {
    // Extract validated body from the request
    const { messages, model, maxTokens, temperature, responseFormat } = req.validatedBody;
    
    // Client IP for tracking/rate limiting
    const ip = req.ip || req.connection.remoteAddress;
    
    // Call OpenAI API
    const response = await openai.createChatCompletion(messages, {
      model,
      maxTokens,
      temperature,
      responseFormat,
      ip
    });
    
    // Extract completion text from response
    const completionMessage = response.choices && response.choices[0] ? 
      response.choices[0].message : null;
    
    // Return response
    return res.json({
      success: true,
      data: {
        message: completionMessage,
        model: model,
        usage: response.usage || {}
      }
    });
  } catch (err) {
    logger.error('OpenAI chat completion handler error', {
      error: err.message,
      stack: err.stack
    });
    
    return next(createError(
      'Failed to generate chat completion: ' + err.message,
      500,
      'OPENAI_API_ERROR'
    ));
  }
}

/**
 * Handle image generation requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function handleImageGeneration(req, res, next) {
  try {
    // Extract validated body from the request
    const { prompt, n, size, quality, responseFormat } = req.validatedBody;
    
    // Client IP for tracking/rate limiting
    const ip = req.ip || req.connection.remoteAddress;
    
    // Call OpenAI API
    const response = await openai.generateImage(prompt, {
      n,
      size,
      quality,
      responseFormat,
      ip
    });
    
    // Return response
    return res.json({
      success: true,
      data: {
        images: response.data,
        created: response.created
      }
    });
  } catch (err) {
    logger.error('OpenAI image generation handler error', {
      error: err.message,
      stack: err.stack
    });
    
    return next(createError(
      'Failed to generate image: ' + err.message,
      500,
      'OPENAI_API_ERROR'
    ));
  }
}

module.exports = {
  handleCompletion,
  handleChatCompletion,
  handleImageGeneration
};