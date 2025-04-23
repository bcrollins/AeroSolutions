/**
 * OpenAI Controller
 * 
 * This controller handles API interactions with OpenAI services.
 * It provides methods for text completion, chat completion, and image generation.
 */

const OpenAI = require('openai');
const logger = require('../config/logger');
const { createError } = require('../middlewares/errorHandler');

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Text completion endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function createCompletion(req, res, next) {
  try {
    // These fields have been validated by the validator middleware
    const { prompt, model = 'gpt-4o', maxTokens = 500, temperature = 0.7 } = req.body;
    
    logger.info('OpenAI completion request', {
      model,
      promptLength: prompt.length,
      maxTokens
    });
    
    // Map to OpenAI chat completion format
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature
    });
    
    // Log usage statistics
    logger.info('OpenAI completion success', {
      model,
      totalTokens: completion.usage?.total_tokens || 0,
      responseLength: completion.choices[0]?.message?.content?.length || 0
    });
    
    // Send response
    res.json({
      success: true,
      data: {
        text: completion.choices[0]?.message?.content || '',
        usage: completion.usage || {},
        model: completion.model
      }
    });
  } catch (error) {
    // Log the error
    logger.error('OpenAI completion error', {
      error: error.message,
      stack: error.stack
    });
    
    // Check if it's an OpenAI API error
    if (error.response) {
      const openaiError = error.response.data || error;
      return next(createError(
        'OpenAI API error: ' + (openaiError.error?.message || error.message),
        error.status || 500,
        'OPENAI_API_ERROR',
        { type: openaiError.error?.type }
      ));
    }
    
    // Handle other errors
    next(createError('Error processing OpenAI completion request', 500, 'OPENAI_PROCESSING_ERROR'));
  }
}

/**
 * Chat completion endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function createChatCompletion(req, res, next) {
  try {
    // These fields have been validated by the validator middleware
    const { 
      messages, 
      model = 'gpt-4o', 
      maxTokens = 1000, 
      temperature = 0.7,
      responseFormat = 'text'
    } = req.body;
    
    logger.info('OpenAI chat completion request', {
      model,
      messagesCount: messages.length,
      maxTokens,
      responseFormat
    });
    
    // Configure response format if JSON is requested
    const options = {
      model,
      messages,
      max_tokens: maxTokens,
      temperature
    };
    
    if (responseFormat === 'json_object') {
      options.response_format = { type: 'json_object' };
    }
    
    // Call OpenAI API
    const response = await openai.chat.completions.create(options);
    
    // Log usage statistics
    logger.info('OpenAI chat completion success', {
      model,
      totalTokens: response.usage?.total_tokens || 0,
      responseLength: response.choices[0]?.message?.content?.length || 0
    });
    
    // Parse JSON response if requested
    let content = response.choices[0]?.message?.content || '';
    let parsedContent = content;
    
    if (responseFormat === 'json_object' && content) {
      try {
        parsedContent = JSON.parse(content);
      } catch (parseError) {
        logger.warn('Failed to parse JSON response from OpenAI', {
          error: parseError.message
        });
        // Keep the original string if parsing fails
      }
    }
    
    // Send response
    res.json({
      success: true,
      data: {
        content: parsedContent,
        usage: response.usage || {},
        model: response.model
      }
    });
  } catch (error) {
    // Log the error
    logger.error('OpenAI chat completion error', {
      error: error.message,
      stack: error.stack
    });
    
    // Check if it's an OpenAI API error
    if (error.response) {
      const openaiError = error.response.data || error;
      return next(createError(
        'OpenAI API error: ' + (openaiError.error?.message || error.message),
        error.status || 500,
        'OPENAI_API_ERROR',
        { type: openaiError.error?.type }
      ));
    }
    
    // Handle other errors
    next(createError('Error processing OpenAI chat completion request', 500, 'OPENAI_CHAT_ERROR'));
  }
}

/**
 * Image generation endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function createImage(req, res, next) {
  try {
    // These fields have been validated by the validator middleware
    const { 
      prompt, 
      n = 1, 
      size = '1024x1024', 
      quality = 'standard',
      responseFormat = 'url'
    } = req.body;
    
    logger.info('OpenAI image generation request', {
      promptLength: prompt.length,
      n,
      size,
      quality
    });
    
    // Call OpenAI API
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n,
      size,
      quality,
      response_format: responseFormat
    });
    
    logger.info('OpenAI image generation success', {
      imagesGenerated: response.data?.length || 0
    });
    
    // Send response
    res.json({
      success: true,
      data: {
        images: response.data || [],
        created: response.created
      }
    });
  } catch (error) {
    // Log the error
    logger.error('OpenAI image generation error', {
      error: error.message,
      stack: error.stack
    });
    
    // Check if it's an OpenAI API error
    if (error.response) {
      const openaiError = error.response.data || error;
      return next(createError(
        'OpenAI API error: ' + (openaiError.error?.message || error.message),
        error.status || 500,
        'OPENAI_API_ERROR',
        { type: openaiError.error?.type }
      ));
    }
    
    // Handle other errors
    next(createError('Error processing OpenAI image generation request', 500, 'OPENAI_IMAGE_ERROR'));
  }
}

module.exports = {
  createCompletion,
  createChatCompletion,
  createImage
};