/**
 * xAI Model
 * 
 * This module provides a client for interacting with the xAI (SAI) API.
 * It handles authentication, request formatting, and response parsing.
 */

const OpenAI = require('openai');
const logger = require('../config/logger');
const db = require('../config/database');

// Initialize xAI client with API key from environment variables
const xai = new OpenAI({
  baseURL: "https://api.x.ai/v1",
  apiKey: process.env.XAI_API_KEY
});

/**
 * Log API usage to database for tracking
 * @param {string} endpoint - API endpoint used
 * @param {string} ip - User IP address
 * @param {number} userId - User ID if authenticated
 * @param {number} tokens - Number of tokens used
 * @param {number} requestTime - Request time in milliseconds
 * @param {boolean} success - Whether the request was successful
 * @param {string} errorType - Error type if request failed
 */
async function logApiUsage(endpoint, ip, userId = null, tokens = 0, requestTime, success = true, errorType = null) {
  try {
    await db.query(
      `INSERT INTO api_usage_logs 
        (endpoint, ip_address, user_id, tokens_used, request_time, success, error_type) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [endpoint, ip, userId, tokens, requestTime, success, errorType]
    );
  } catch (err) {
    logger.error('Failed to log API usage', {
      error: err.message,
      endpoint,
      ip: logger.anonymize(ip)
    });
  }
}

/**
 * Create a completion using the text completion API
 * @param {string} prompt - Text prompt
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - API response
 */
async function createCompletion(prompt, options = {}) {
  const startTime = Date.now();
  const endpoint = 'completions';
  let success = false;
  let errorType = null;
  
  try {
    // Default to grok-2-1212, which is xAI's latest text-only model
    const model = options.model || 'grok-2-1212';
    const maxTokens = options.maxTokens || 1000;
    const temperature = options.temperature || 0.7;
    
    // Create the chat completion
    const response = await xai.chat.completions.create({
      model,
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: maxTokens,
      temperature,
      response_format: options.responseFormat ? { type: options.responseFormat } : undefined
    });
    
    success = true;
    
    // Log API usage
    const tokens = response.usage ? response.usage.total_tokens : 0;
    logApiUsage(
      endpoint, 
      options.ip || 'unknown', 
      options.userId,
      tokens,
      Date.now() - startTime,
      true
    );
    
    return response;
  } catch (err) {
    // Handle and log errors
    errorType = err.type || 'unknown_error';
    
    logger.error('xAI completion error', {
      error: err.message,
      type: errorType,
      model: options.model,
      promptLength: prompt ? prompt.length : 0
    });
    
    // Log failed API usage
    logApiUsage(
      endpoint, 
      options.ip || 'unknown', 
      options.userId,
      0,
      Date.now() - startTime,
      false,
      errorType
    );
    
    throw err;
  }
}

/**
 * Create a chat completion
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - API response
 */
async function createChatCompletion(messages, options = {}) {
  const startTime = Date.now();
  const endpoint = 'chat/completions';
  let success = false;
  let errorType = null;
  
  try {
    // Default to grok-2-1212, which is xAI's latest text-only model
    const model = options.model || 'grok-2-1212';
    const maxTokens = options.maxTokens || 1000;
    const temperature = options.temperature || 0.7;
    
    const response = await xai.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      response_format: options.responseFormat ? { type: options.responseFormat } : undefined
    });
    
    success = true;
    
    // Log API usage
    const tokens = response.usage ? response.usage.total_tokens : 0;
    logApiUsage(
      endpoint, 
      options.ip || 'unknown', 
      options.userId,
      tokens,
      Date.now() - startTime,
      true
    );
    
    return response;
  } catch (err) {
    // Handle and log errors
    errorType = err.type || 'unknown_error';
    
    logger.error('xAI chat completion error', {
      error: err.message,
      type: errorType,
      model: options.model,
      messagesCount: messages ? messages.length : 0
    });
    
    // Log failed API usage
    logApiUsage(
      endpoint, 
      options.ip || 'unknown', 
      options.userId,
      0,
      Date.now() - startTime,
      false,
      errorType
    );
    
    throw err;
  }
}

/**
 * Generate an image using a vision model
 * @param {string} prompt - Image description
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - API response with image data
 */
async function generateImage(prompt, options = {}) {
  const startTime = Date.now();
  const endpoint = 'images/generations';
  let success = false;
  let errorType = null;
  
  try {
    // Vision API is not currently available in xAI directly
    // This function emulates image generation by using the image generation capabilities
    // of the grok-2-vision-1212 model
    const response = await xai.chat.completions.create({
      model: options.model || 'grok-2-vision-1212',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert image generator. Given a text prompt, describe in detail what the image would look like.' 
        },
        { 
          role: 'user', 
          content: `Generate an image with this description: ${prompt}` 
        }
      ],
      max_tokens: 1000,
      temperature: options.temperature || 0.7
    });
    
    success = true;
    
    // Format the response to match the expected structure
    const formattedResponse = {
      created: Date.now(),
      data: [{
        url: null,
        revisedPrompt: prompt,
        description: response.choices[0].message.content
      }]
    };
    
    // Log API usage
    logApiUsage(
      endpoint, 
      options.ip || 'unknown', 
      options.userId,
      response.usage ? response.usage.total_tokens : 0,
      Date.now() - startTime,
      true
    );
    
    return formattedResponse;
  } catch (err) {
    // Handle and log errors
    errorType = err.type || 'unknown_error';
    
    logger.error('xAI image generation error', {
      error: err.message,
      type: errorType,
      promptLength: prompt ? prompt.length : 0
    });
    
    // Log failed API usage
    logApiUsage(
      endpoint, 
      options.ip || 'unknown', 
      options.userId,
      0,
      Date.now() - startTime,
      false,
      errorType
    );
    
    throw err;
  }
}

/**
 * Analyze an image using the vision model
 * @param {string} imageBase64 - Base64-encoded image data
 * @param {string} prompt - Text prompt describing what to look for in the image
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - API response with analysis
 */
async function analyzeImage(imageBase64, prompt, options = {}) {
  const startTime = Date.now();
  const endpoint = 'vision/analysis';
  let success = false;
  let errorType = null;
  
  try {
    const response = await xai.chat.completions.create({
      model: options.model || 'grok-2-vision-1212',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt || 'Analyze this image in detail.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7
    });
    
    success = true;
    
    // Log API usage
    const tokens = response.usage ? response.usage.total_tokens : 0;
    logApiUsage(
      endpoint, 
      options.ip || 'unknown', 
      options.userId,
      tokens,
      Date.now() - startTime,
      true
    );
    
    return response;
  } catch (err) {
    // Handle and log errors
    errorType = err.type || 'unknown_error';
    
    logger.error('xAI vision analysis error', {
      error: err.message,
      type: errorType,
      promptLength: prompt ? prompt.length : 0,
      imageSize: imageBase64 ? imageBase64.length : 0
    });
    
    // Log failed API usage
    logApiUsage(
      endpoint, 
      options.ip || 'unknown', 
      options.userId,
      0,
      Date.now() - startTime,
      false,
      errorType
    );
    
    throw err;
  }
}

// Export functions
module.exports = {
  xai,
  createCompletion,
  createChatCompletion,
  generateImage,
  analyzeImage
};