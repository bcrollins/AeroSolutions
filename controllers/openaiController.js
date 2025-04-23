/**
 * OpenAI Controller
 * 
 * This controller handles interactions with the OpenAI API.
 * It provides methods for text completion, chat functionality,
 * and other OpenAI-powered features.
 */

const { Configuration, OpenAIApi } = require('openai');
const logger = require('../config/logger');
const { createError } = require('../middlewares/errorHandler');

// Initialize OpenAI API client
let openai;
try {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  openai = new OpenAIApi(configuration);
  
  if (!process.env.OPENAI_API_KEY) {
    logger.warn('OpenAI API key not found in environment variables');
  } else {
    logger.info('OpenAI API client initialized successfully');
  }
} catch (error) {
  logger.error('Error initializing OpenAI API client', {
    error: error.message,
    stack: error.stack
  });
}

/**
 * Get text completion from OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getCompletion(req, res, next) {
  try {
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      return next(createError(
        'OpenAI API key not configured', 
        500, 
        'API_KEY_MISSING'
      ));
    }
    
    // Extract parameters from request body
    const { 
      prompt, 
      model = 'text-davinci-003', 
      maxTokens = 150, 
      temperature = 0.7 
    } = req.body;
    
    // Validate required fields
    if (!prompt) {
      return next(createError(
        'Prompt is required', 
        400, 
        'INVALID_PARAMETERS'
      ));
    }
    
    logger.debug('Processing OpenAI completion request', {
      model,
      maxTokens,
      temperature,
      promptLength: prompt.length
    });
    
    const response = await openai.createCompletion({
      model,
      prompt,
      max_tokens: maxTokens,
      temperature,
    });
    
    logger.info('OpenAI completion request successful', {
      model,
      tokensUsed: response.data.usage?.total_tokens || 0
    });
    
    res.json({
      success: true,
      data: {
        text: response.data.choices[0]?.text.trim() || '',
        model: response.data.model,
        usage: response.data.usage
      }
    });
  } catch (error) {
    logger.error('OpenAI completion request failed', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    
    // Handle different error types
    if (error.response) {
      // OpenAI API error response
      const statusCode = error.response.status;
      const errorData = error.response.data;
      
      return next(createError(
        `OpenAI API error: ${errorData.error?.message || JSON.stringify(errorData)}`, 
        statusCode, 
        'OPENAI_API_ERROR',
        { openaiError: errorData }
      ));
    } else {
      // Other errors
      return next(createError(
        `Error processing OpenAI request: ${error.message}`, 
        500, 
        'OPENAI_REQUEST_ERROR'
      ));
    }
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
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      return next(createError(
        'OpenAI API key not configured', 
        500, 
        'API_KEY_MISSING'
      ));
    }
    
    // Extract parameters from request body
    const { 
      messages, 
      model = 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      maxTokens = 1000, 
      temperature = 0.7 
    } = req.body;
    
    // Validate required fields
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return next(createError(
        'Messages array is required and must not be empty', 
        400, 
        'INVALID_PARAMETERS'
      ));
    }
    
    // Validate message format
    const invalidMessages = messages.filter(msg => 
      !msg.role || !msg.content || 
      !['system', 'user', 'assistant'].includes(msg.role)
    );
    
    if (invalidMessages.length > 0) {
      return next(createError(
        'Messages must have valid role (system, user, or assistant) and content', 
        400, 
        'INVALID_MESSAGE_FORMAT'
      ));
    }
    
    logger.debug('Processing OpenAI chat completion request', {
      model,
      maxTokens,
      temperature,
      messageCount: messages.length
    });
    
    const response = await openai.createChatCompletion({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    });
    
    logger.info('OpenAI chat completion request successful', {
      model,
      tokensUsed: response.data.usage?.total_tokens || 0
    });
    
    res.json({
      success: true,
      data: {
        message: response.data.choices[0]?.message || {},
        model: response.data.model,
        usage: response.data.usage
      }
    });
  } catch (error) {
    logger.error('OpenAI chat completion request failed', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    
    // Handle different error types
    if (error.response) {
      // OpenAI API error response
      const statusCode = error.response.status;
      const errorData = error.response.data;
      
      return next(createError(
        `OpenAI API error: ${errorData.error?.message || JSON.stringify(errorData)}`, 
        statusCode, 
        'OPENAI_API_ERROR',
        { openaiError: errorData }
      ));
    } else {
      // Other errors
      return next(createError(
        `Error processing OpenAI request: ${error.message}`, 
        500, 
        'OPENAI_REQUEST_ERROR'
      ));
    }
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
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      return next(createError(
        'OpenAI API key not configured', 
        500, 
        'API_KEY_MISSING'
      ));
    }
    
    // Extract parameters from request body
    const { 
      prompt, 
      n = 1, 
      size = '1024x1024',
      quality = 'standard',
      responseFormat = 'url'
    } = req.body;
    
    // Validate required fields
    if (!prompt) {
      return next(createError(
        'Prompt is required', 
        400, 
        'INVALID_PARAMETERS'
      ));
    }
    
    // Validate size
    const validSizes = ['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792'];
    if (!validSizes.includes(size)) {
      return next(createError(
        `Invalid size. Must be one of: ${validSizes.join(', ')}`, 
        400, 
        'INVALID_PARAMETERS'
      ));
    }
    
    // Validate quality
    const validQualities = ['standard', 'hd'];
    if (!validQualities.includes(quality)) {
      return next(createError(
        `Invalid quality. Must be one of: ${validQualities.join(', ')}`, 
        400, 
        'INVALID_PARAMETERS'
      ));
    }
    
    // Validate n
    if (n < 1 || n > 10) {
      return next(createError(
        'Number of images (n) must be between 1 and 10', 
        400, 
        'INVALID_PARAMETERS'
      ));
    }
    
    // Validate responseFormat
    const validFormats = ['url', 'b64_json'];
    if (!validFormats.includes(responseFormat)) {
      return next(createError(
        `Invalid response format. Must be one of: ${validFormats.join(', ')}`, 
        400, 
        'INVALID_PARAMETERS'
      ));
    }
    
    logger.debug('Processing OpenAI image generation request', {
      promptLength: prompt.length,
      n,
      size,
      quality
    });
    
    const response = await openai.createImage({
      prompt,
      n,
      size,
      quality,
      response_format: responseFormat,
    });
    
    logger.info('OpenAI image generation request successful', {
      imageCount: response.data.data.length
    });
    
    res.json({
      success: true,
      data: {
        images: response.data.data,
        created: response.data.created
      }
    });
  } catch (error) {
    logger.error('OpenAI image generation request failed', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    
    // Handle different error types
    if (error.response) {
      // OpenAI API error response
      const statusCode = error.response.status;
      const errorData = error.response.data;
      
      return next(createError(
        `OpenAI API error: ${errorData.error?.message || JSON.stringify(errorData)}`, 
        statusCode, 
        'OPENAI_API_ERROR',
        { openaiError: errorData }
      ));
    } else {
      // Other errors
      return next(createError(
        `Error processing OpenAI request: ${error.message}`, 
        500, 
        'OPENAI_REQUEST_ERROR'
      ));
    }
  }
}

/**
 * Check OpenAI API status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function checkStatus(req, res, next) {
  // Check if API key is configured
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  
  let apiStatus = 'unknown';
  let models = [];
  let error = null;
  
  if (hasApiKey) {
    try {
      // Make a lightweight API call to validate the key and check status
      const response = await openai.listModels();
      apiStatus = 'operational';
      models = response.data.data.map(model => ({
        id: model.id,
        owned_by: model.owned_by,
      }));
      
      logger.info('OpenAI API status check successful', {
        status: apiStatus,
        modelCount: models.length
      });
    } catch (err) {
      apiStatus = 'error';
      error = err.message;
      
      logger.error('OpenAI API status check failed', {
        error: err.message,
        stack: err.stack
      });
    }
  } else {
    apiStatus = 'unconfigured';
    logger.warn('OpenAI API key not configured');
  }
  
  res.json({
    success: true,
    data: {
      apiStatus,
      hasApiKey,
      error,
      models: models.length > 0 ? models : undefined
    }
  });
}

module.exports = {
  getCompletion,
  getChatCompletion,
  generateImage,
  checkStatus
};