/**
 * OpenAI Controller
 * 
 * This controller handles interactions with the OpenAI API.
 * It provides methods for text completion, chat functionality,
 * and other OpenAI-powered features.
 */

const { OpenAI } = require('openai');
const logger = require('../config/logger');
const { createError } = require('../middlewares/errorHandler');

// Initialize OpenAI client
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
    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      return next(createError(
        'OpenAI API key is missing',
        500,
        'OPENAI_API_KEY_MISSING'
      ));
    }
    
    // Extract request parameters with defaults
    const {
      prompt,
      model = 'gpt-4o',  // Newest model as of May 2024
      maxTokens = 1024,
      temperature = 0.7
    } = req.body;
    
    // Make API request
    const completion = await openai.completions.create({
      model,
      prompt,
      max_tokens: maxTokens,
      temperature
    });
    
    // Log success
    logger.info('OpenAI completion request successful', {
      model,
      promptChars: prompt.length,
      tokens: {
        used: completion.usage?.total_tokens || 'unknown'
      }
    });
    
    // Return response
    res.json({
      success: true,
      data: {
        text: completion.choices[0].text,
        model: completion.model,
        usage: completion.usage
      }
    });
  } catch (error) {
    // Log error
    logger.error('OpenAI completion request failed', {
      error: error.message,
      stack: error.stack
    });
    
    // Handle specific OpenAI API errors
    if (error.response) {
      return next(createError(
        `OpenAI API error: ${error.response.data.error.message}`,
        error.response.status,
        'OPENAI_API_ERROR',
        { openaiError: error.response.data.error }
      ));
    }
    
    // Handle other errors
    next(createError(
      `OpenAI completion error: ${error.message}`,
      500,
      'OPENAI_REQUEST_ERROR'
    ));
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
    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      return next(createError(
        'OpenAI API key is missing',
        500,
        'OPENAI_API_KEY_MISSING'
      ));
    }
    
    // Extract request parameters with defaults
    const {
      messages,
      model = 'gpt-4o',  // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      maxTokens = 1024,
      temperature = 0.7,
      responseFormat = null
    } = req.body;
    
    // Prepare request parameters
    const requestParams = {
      model,
      messages,
      max_tokens: maxTokens,
      temperature
    };
    
    // Add response format if specified
    if (responseFormat) {
      requestParams.response_format = { type: responseFormat };
    }
    
    // Make API request
    const chatCompletion = await openai.chat.completions.create(requestParams);
    
    // Get message content
    const responseContent = chatCompletion.choices[0].message.content;
    
    // Log success
    logger.info('OpenAI chat completion request successful', {
      model,
      messagesCount: messages.length,
      responseLength: responseContent ? responseContent.length : 0,
      tokens: {
        used: chatCompletion.usage?.total_tokens || 'unknown'
      }
    });
    
    // Return response
    res.json({
      success: true,
      data: {
        message: chatCompletion.choices[0].message,
        model: chatCompletion.model,
        usage: chatCompletion.usage
      }
    });
  } catch (error) {
    // Log error
    logger.error('OpenAI chat completion request failed', {
      error: error.message,
      stack: error.stack
    });
    
    // Handle specific OpenAI API errors
    if (error.response) {
      return next(createError(
        `OpenAI API error: ${error.response.data.error.message}`,
        error.response.status,
        'OPENAI_API_ERROR',
        { openaiError: error.response.data.error }
      ));
    }
    
    // Handle other errors
    next(createError(
      `OpenAI chat completion error: ${error.message}`,
      500,
      'OPENAI_REQUEST_ERROR'
    ));
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
    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      return next(createError(
        'OpenAI API key is missing',
        500,
        'OPENAI_API_KEY_MISSING'
      ));
    }
    
    // Extract request parameters with defaults
    const {
      prompt,
      n = 1,
      size = '1024x1024',
      quality = 'standard',
      responseFormat = 'url'
    } = req.body;
    
    // Make API request
    const result = await openai.images.generate({
      prompt,
      n,
      size,
      quality,
      response_format: responseFormat
    });
    
    // Log success
    logger.info('OpenAI image generation request successful', {
      promptLength: prompt.length,
      imageCount: n,
      size,
      quality
    });
    
    // Return response
    res.json({
      success: true,
      data: {
        images: result.data,
        created: result.created
      }
    });
  } catch (error) {
    // Log error
    logger.error('OpenAI image generation request failed', {
      error: error.message,
      stack: error.stack
    });
    
    // Handle specific OpenAI API errors
    if (error.response) {
      return next(createError(
        `OpenAI API error: ${error.response.data.error.message}`,
        error.response.status,
        'OPENAI_API_ERROR',
        { openaiError: error.response.data.error }
      ));
    }
    
    // Handle other errors
    next(createError(
      `OpenAI image generation error: ${error.message}`,
      500,
      'OPENAI_REQUEST_ERROR'
    ));
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
    // Check if API key is configured
    const hasApiKey = !!process.env.OPENAI_API_KEY;
    
    // Only make a test request if the API key is available
    let apiStatus = 'unknown';
    let apiVersion = null;
    let availableModels = [];
    
    if (hasApiKey) {
      try {
        // Try to list models as a simple API test
        const modelsResponse = await openai.models.list();
        
        apiStatus = 'available';
        availableModels = modelsResponse.data
          .slice(0, 10) // Limit to first 10 models to avoid huge response
          .map(model => ({
            id: model.id,
            owned_by: model.owned_by
          }));
          
        // Sort models, placing GPT-4 models first
        availableModels.sort((a, b) => {
          const aIsGpt4 = a.id.includes('gpt-4');
          const bIsGpt4 = b.id.includes('gpt-4');
          
          if (aIsGpt4 && !bIsGpt4) return -1;
          if (!aIsGpt4 && bIsGpt4) return 1;
          return a.id.localeCompare(b.id);
        });
        
      } catch (apiError) {
        apiStatus = 'error';
        logger.error('OpenAI API test failed', {
          error: apiError.message,
          stack: apiError.stack
        });
      }
    } else {
      apiStatus = 'unconfigured';
    }
    
    // Log success
    logger.info('OpenAI status check successful', {
      hasApiKey,
      apiStatus
    });
    
    // Return response
    res.json({
      success: true,
      data: {
        apiStatus,
        hasApiKey,
        apiVersion,
        availableModels: apiStatus === 'available' ? availableModels : []
      }
    });
  } catch (error) {
    // Log error
    logger.error('OpenAI status check failed', {
      error: error.message,
      stack: error.stack
    });
    
    // Handle the error
    next(createError(
      `OpenAI status check error: ${error.message}`,
      500,
      'OPENAI_STATUS_CHECK_ERROR'
    ));
  }
}

module.exports = {
  getCompletion,
  getChatCompletion,
  generateImage,
  checkStatus
};