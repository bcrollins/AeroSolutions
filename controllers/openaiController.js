/**
 * OpenAI Controller
 * 
 * Handles logic for OpenAI-related routes
 */

const OpenAI = require('openai');
const logger = require('../config/logger');
const { createError } = require('../middlewares/errorHandler');

// Create OpenAI client with API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define default models for different operations
const DEFAULT_MODELS = {
  text: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  json: 'gpt-4o',
  image: 'gpt-4o'
};

/**
 * Generate text using OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function generateText(req, res, next) {
  try {
    const { prompt, model = DEFAULT_MODELS.text, max_tokens = 1000, temperature = 0.7 } = req.body;

    logger.info('OpenAI text generation request', {
      model,
      prompt_length: prompt.length,
      max_tokens
    });

    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens,
      temperature
    });

    logger.debug('OpenAI text generation response', {
      completion_tokens: response.usage?.completion_tokens,
      prompt_tokens: response.usage?.prompt_tokens,
      finish_reason: response.choices[0]?.finish_reason
    });

    return res.json({
      success: true,
      data: {
        text: response.choices[0]?.message.content || '',
        model: response.model,
        usage: response.usage,
        created: response.created
      }
    });
  } catch (error) {
    logger.error('OpenAI text generation error', {
      error: error.message,
      stack: error.stack
    });

    // Handle specific OpenAI errors
    if (error.response) {
      return next(createError(
        `OpenAI API error: ${error.response.data.error.message}`,
        'OPENAI_API_ERROR',
        error.status || 500
      ));
    }

    return next(createError('Error generating text with OpenAI', 'OPENAI_ERROR', 500));
  }
}

/**
 * Generate JSON using OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function generateJSON(req, res, next) {
  try {
    const { prompt, model = DEFAULT_MODELS.json, max_tokens = 2000, temperature = 0.2 } = req.body;

    logger.info('OpenAI JSON generation request', {
      model,
      prompt_length: prompt.length,
      max_tokens
    });

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { 
          role: 'system', 
          content: 'You are a JSON generator. Always respond with valid JSON only.' 
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ],
      max_tokens,
      temperature,
      response_format: { type: 'json_object' }
    });

    logger.debug('OpenAI JSON generation response', {
      completion_tokens: response.usage?.completion_tokens,
      prompt_tokens: response.usage?.prompt_tokens,
      finish_reason: response.choices[0]?.finish_reason
    });

    // Parse the response content to ensure it's valid JSON
    let parsedJson;
    try {
      parsedJson = JSON.parse(response.choices[0]?.message.content || '{}');
    } catch (jsonError) {
      logger.warn('Failed to parse OpenAI JSON response', {
        content: response.choices[0]?.message.content,
        error: jsonError.message
      });
      parsedJson = { error: 'Invalid JSON response from OpenAI' };
    }

    return res.json({
      success: true,
      data: {
        json: parsedJson,
        raw: response.choices[0]?.message.content,
        model: response.model,
        usage: response.usage,
        created: response.created
      }
    });
  } catch (error) {
    logger.error('OpenAI JSON generation error', {
      error: error.message,
      stack: error.stack
    });

    // Handle specific OpenAI errors
    if (error.response) {
      return next(createError(
        `OpenAI API error: ${error.response.data.error.message}`,
        'OPENAI_API_ERROR',
        error.status || 500
      ));
    }

    return next(createError('Error generating JSON with OpenAI', 'OPENAI_ERROR', 500));
  }
}

/**
 * Analyze image using OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function analyzeImage(req, res, next) {
  try {
    const { imageUrl, prompt = 'Analyze this image in detail and describe what you see.', model = DEFAULT_MODELS.image } = req.body;

    logger.info('OpenAI image analysis request', {
      model,
      prompt_length: prompt.length,
      image_url: imageUrl.substring(0, 100) + '...' // Don't log full URL
    });

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    logger.debug('OpenAI image analysis response', {
      response_length: response.choices[0]?.message.content.length,
      finish_reason: response.choices[0]?.finish_reason
    });

    return res.json({
      success: true,
      data: {
        analysis: response.choices[0]?.message.content || '',
        model: response.model,
        created: response.created
      }
    });
  } catch (error) {
    logger.error('OpenAI image analysis error', {
      error: error.message,
      stack: error.stack
    });

    // Handle specific OpenAI errors
    if (error.response) {
      return next(createError(
        `OpenAI API error: ${error.response.data.error.message}`,
        'OPENAI_API_ERROR',
        error.status || 500
      ));
    }

    return next(createError('Error analyzing image with OpenAI', 'OPENAI_ERROR', 500));
  }
}

/**
 * Test OpenAI API connection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function testConnection(req, res, next) {
  try {
    // Simple test query to check if OpenAI API is working
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Use 3.5 for quicker response in testing
      messages: [{ role: 'user', content: 'Hello, this is a test message. Respond with "OK" if you can receive this.' }],
      max_tokens: 10,
      temperature: 0.1
    });

    logger.info('OpenAI API connection test successful', {
      model: response.model,
      response: response.choices[0]?.message.content
    });

    return res.json({
      success: true,
      message: 'OpenAI API connection successful',
      data: {
        model: response.model,
        response: response.choices[0]?.message.content
      }
    });
  } catch (error) {
    logger.error('OpenAI API connection test failed', {
      error: error.message,
      stack: error.stack
    });

    // Handle specific OpenAI errors
    if (error.response) {
      return next(createError(
        `OpenAI API connection failed: ${error.response.data.error.message}`,
        'OPENAI_API_ERROR',
        error.status || 500
      ));
    }

    return next(createError('OpenAI API connection failed', 'OPENAI_ERROR', 500));
  }
}

module.exports = {
  generateText,
  generateJSON,
  analyzeImage,
  testConnection
};