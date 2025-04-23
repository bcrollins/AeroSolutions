/**
 * OpenAI Model
 * 
 * This module provides a client for interacting with the OpenAI API.
 * It handles authentication, request formatting, and response parsing.
 */

const OpenAI = require('openai');
const logger = require('../config/logger');
const db = require('../config/database');

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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
    // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const model = options.model || 'gpt-4o';
    const maxTokens = options.maxTokens || 1000;
    const temperature = options.temperature || 0.7;
    
    // Create the chat completion (using chat instead of older completion API)
    const response = await openai.chat.completions.create({
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
    
    logger.error('OpenAI completion error', {
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
    // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const model = options.model || 'gpt-4o';
    const maxTokens = options.maxTokens || 1000;
    const temperature = options.temperature || 0.7;
    
    const response = await openai.chat.completions.create({
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
    
    logger.error('OpenAI chat completion error', {
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
 * Generate an image using DALL-E
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
    const response = await openai.images.generate({
      model: options.model || 'dall-e-3',
      prompt,
      n: options.n || 1,
      size: options.size || '1024x1024',
      quality: options.quality || 'standard',
      response_format: options.responseFormat || 'url'
    });
    
    success = true;
    
    // Log API usage (DALL-E doesn't return token usage)
    logApiUsage(
      endpoint, 
      options.ip || 'unknown', 
      options.userId,
      0, // No token count available for image generation
      Date.now() - startTime,
      true
    );
    
    return response;
  } catch (err) {
    // Handle and log errors
    errorType = err.type || 'unknown_error';
    
    logger.error('OpenAI image generation error', {
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

// Export functions
module.exports = {
  openai,
  createCompletion,
  createChatCompletion,
  generateImage
};