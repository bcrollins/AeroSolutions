/**
 * XAI Controller
 * 
 * This controller handles API interactions with XAI (SAI) models.
 * It provides methods for text completions, chat completions, and image generation.
 */

const { createError } = require('../middlewares/errorHandler');
const xai = require('../models/xai');
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
    
    // Call XAI API
    const response = await xai.createCompletion(prompt, {
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
    logger.error('XAI completion handler error', {
      error: err.message,
      stack: err.stack
    });
    
    return next(createError(
      'Failed to generate completion: ' + err.message,
      500,
      'XAI_API_ERROR'
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
    
    // Call XAI API
    const response = await xai.createChatCompletion(messages, {
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
    logger.error('XAI chat completion handler error', {
      error: err.message,
      stack: err.stack
    });
    
    return next(createError(
      'Failed to generate chat completion: ' + err.message,
      500,
      'XAI_API_ERROR'
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
    
    // Call XAI API
    const response = await xai.generateImage(prompt, {
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
    logger.error('XAI image generation handler error', {
      error: err.message,
      stack: err.stack
    });
    
    return next(createError(
      'Failed to generate image: ' + err.message,
      500,
      'XAI_API_ERROR'
    ));
  }
}

/**
 * Handle image analysis requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function handleImageAnalysis(req, res, next) {
  try {
    // Extract validated body from the request
    const { image, prompt, maxTokens, temperature } = req.validatedBody;
    
    // Client IP for tracking/rate limiting
    const ip = req.ip || req.connection.remoteAddress;
    
    // Extract base64 image data (remove data URL prefix if present)
    let imageBase64 = image;
    if (image.includes(';base64,')) {
      imageBase64 = image.split(';base64,')[1];
    }
    
    // Call XAI API
    const response = await xai.analyzeImage(imageBase64, prompt, {
      maxTokens,
      temperature,
      ip
    });
    
    // Extract analysis text from response
    const analysisText = response.choices && response.choices[0] ? 
      response.choices[0].message?.content : '';
    
    // Return response
    return res.json({
      success: true,
      data: {
        analysis: analysisText,
        model: response.model,
        usage: response.usage || {}
      }
    });
  } catch (err) {
    logger.error('XAI image analysis handler error', {
      error: err.message,
      stack: err.stack
    });
    
    return next(createError(
      'Failed to analyze image: ' + err.message,
      500,
      'XAI_API_ERROR'
    ));
  }
}

module.exports = {
  handleCompletion,
  handleChatCompletion,
  handleImageGeneration,
  handleImageAnalysis
};