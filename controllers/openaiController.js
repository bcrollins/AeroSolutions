/**
 * OpenAI Controller
 * 
 * Handles logic for OpenAI API integration
 * 
 * This controller provides functionality to interact with various OpenAI APIs:
 * - Text generation (chat completions)
 * - JSON response generation
 * - Image analysis (vision)
 * - Connection testing
 */

const { OpenAI } = require('openai');
const logger = require('../config/logger');
const { createError } = require('../middlewares/errorHandler');

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Validates parameters for text generation
 * @param {Object} params - Input parameters to validate
 * @returns {Object} - Validated parameters or throws error
 */
function validateTextParams(params) {
  const { model, prompt, max_tokens, temperature } = params;
  
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    throw new Error('A valid prompt is required');
  }
  
  return {
    model: model || 'gpt-4o', // Default to latest GPT-4o model (released May 13, 2024)
    prompt,
    max_tokens: max_tokens !== undefined ? parseInt(max_tokens) : 1000,
    temperature: temperature !== undefined ? parseFloat(temperature) : 0.7
  };
}

/**
 * Validates parameters for JSON response generation
 * @param {Object} params - Input parameters to validate 
 * @returns {Object} - Validated parameters or throws error
 */
function validateJSONParams(params) {
  const validated = validateTextParams(params);
  
  // Add JSON response format setting
  return {
    ...validated,
    response_format: { type: "json_object" }
  };
}

/**
 * Validates parameters for image analysis
 * @param {Object} params - Input parameters to validate
 * @returns {Object} - Validated parameters or throws error
 */
function validateImageParams(params) {
  const { imageUrl, prompt, model } = params;
  
  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new Error('A valid image URL is required');
  }
  
  return {
    model: model || 'gpt-4o', // Default to GPT-4o for vision
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt || 'Analyze this image in detail'
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
  };
}

/**
 * Generate text using OpenAI API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function generateText(req, res, next) {
  try {
    // Extract and validate parameters
    const params = validateTextParams(req.body);
    logger.debug('OpenAI text generation request', { ...params, prompt_length: params.prompt.length });
    
    // Create the completion request
    const completion = await openai.chat.completions.create({
      model: params.model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: params.prompt }
      ],
      max_tokens: params.max_tokens,
      temperature: params.temperature
    });
    
    // Extract response text
    const responseText = completion.choices[0].message.content;
    
    // Log token usage for monitoring
    logger.debug('OpenAI API token usage', {
      promptTokens: completion.usage.prompt_tokens,
      completionTokens: completion.usage.completion_tokens,
      totalTokens: completion.usage.total_tokens
    });
    
    res.json({
      success: true,
      data: {
        text: responseText,
        model: params.model,
        usage: completion.usage
      }
    });
  } catch (error) {
    logger.error('OpenAI text generation error', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    
    next(createError(
      'Failed to generate text with OpenAI: ' + error.message,
      error.status || 500,
      'OPENAI_API_ERROR'
    ));
  }
}

/**
 * Generate JSON using OpenAI API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function generateJSON(req, res, next) {
  try {
    // Extract and validate parameters
    const params = validateJSONParams(req.body);
    logger.debug('OpenAI JSON generation request', { ...params, prompt_length: params.prompt.length });
    
    // Create the completion request with JSON response format
    const completion = await openai.chat.completions.create({
      model: params.model,
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful assistant that responds with JSON data. Always format your response as valid JSON.' 
        },
        { role: 'user', content: params.prompt }
      ],
      max_tokens: params.max_tokens,
      temperature: params.temperature,
      response_format: { type: "json_object" } // Request JSON response
    });
    
    // Extract and parse the JSON response
    const responseText = completion.choices[0].message.content;
    let jsonData;
    
    try {
      jsonData = JSON.parse(responseText);
    } catch (parseError) {
      logger.error('Failed to parse OpenAI JSON response', {
        error: parseError.message,
        response: responseText
      });
      
      return next(createError(
        'Failed to parse OpenAI JSON response: ' + parseError.message,
        500,
        'JSON_PARSE_ERROR',
        { responseText }
      ));
    }
    
    // Log token usage for monitoring
    logger.debug('OpenAI API token usage', {
      promptTokens: completion.usage.prompt_tokens,
      completionTokens: completion.usage.completion_tokens,
      totalTokens: completion.usage.total_tokens
    });
    
    res.json({
      success: true,
      data: {
        json: jsonData,
        model: params.model,
        usage: completion.usage
      }
    });
  } catch (error) {
    logger.error('OpenAI JSON generation error', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    
    next(createError(
      'Failed to generate JSON with OpenAI: ' + error.message,
      error.status || 500,
      'OPENAI_API_ERROR'
    ));
  }
}

/**
 * Analyze image using OpenAI Vision API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function analyzeImage(req, res, next) {
  try {
    // Extract and validate parameters
    const params = validateImageParams(req.body);
    logger.debug('OpenAI image analysis request', { 
      imageUrl: req.body.imageUrl,
      prompt: req.body.prompt 
    });
    
    // Create the vision request
    const completion = await openai.chat.completions.create(params);
    
    // Extract response text
    const responseText = completion.choices[0].message.content;
    
    // Log token usage for monitoring (if available)
    if (completion.usage) {
      logger.debug('OpenAI API token usage', {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens
      });
    }
    
    res.json({
      success: true,
      data: {
        analysis: responseText,
        model: params.model
      }
    });
  } catch (error) {
    logger.error('OpenAI image analysis error', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    
    next(createError(
      'Failed to analyze image with OpenAI: ' + error.message,
      error.status || 500,
      'OPENAI_API_ERROR'
    ));
  }
}

/**
 * Test OpenAI API connection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function testConnection(req, res, next) {
  try {
    // Simple test prompt
    const testMessage = "Hello, this is a test message. Please respond with 'API connection successful' to verify connectivity.";
    
    // Log test attempt
    logger.debug('Testing OpenAI API connection');
    
    // Create a small test completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Use less expensive model for testing
      messages: [
        { role: 'system', content: 'You are a test assistant. Keep responses very brief.' },
        { role: 'user', content: testMessage }
      ],
      max_tokens: 20,
      temperature: 0.5
    });
    
    // Log successful connection
    logger.info('OpenAI API connection test successful', {
      model: 'gpt-3.5-turbo',
      response: completion.choices[0].message.content
    });
    
    res.json({
      success: true,
      message: 'OpenAI API connection test successful',
      data: {
        response: completion.choices[0].message.content,
        model: 'gpt-3.5-turbo'
      }
    });
  } catch (error) {
    logger.error('OpenAI API connection test failed', {
      error: error.message,
      stack: error.stack
    });
    
    next(createError(
      'OpenAI API connection test failed: ' + error.message,
      error.status || 500,
      'OPENAI_CONNECTION_ERROR'
    ));
  }
}

module.exports = {
  generateText,
  generateJSON,
  analyzeImage,
  testConnection
};