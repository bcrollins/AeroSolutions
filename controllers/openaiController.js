/**
 * OpenAI Controller
 * 
 * This controller handles interactions with the OpenAI API
 * and provides methods for generating text completions, chat responses,
 * and image generation.
 */

const OpenAI = require('openai');
const logger = require('../config/logger');
const { createError } = require('../middlewares/errorHandler');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate a text completion using OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function generateCompletion(req, res, next) {
  try {
    // Extract validated data (safe since it passed validation middleware)
    const { prompt, model, maxTokens, temperature } = req.body;
    
    // Log the request
    logger.info('OpenAI completion request', {
      model,
      promptLength: prompt.length,
      maxTokens
    });
    
    // Make request to OpenAI API
    const completion = await openai.chat.completions.create({
      model: model || 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens || 1024,
      temperature: temperature || 0.7
    });
    
    // Extract and log result
    const result = completion.choices[0].message.content;
    logger.info('OpenAI completion success', {
      model,
      promptTokens: completion.usage.prompt_tokens,
      completionTokens: completion.usage.completion_tokens,
      totalTokens: completion.usage.total_tokens
    });
    
    // Return successful response
    res.json({
      success: true,
      data: {
        completion: result,
        usage: {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens
        }
      }
    });
  } catch (error) {
    // Log API errors
    logger.error('OpenAI completion error', {
      error: error.message,
      status: error.status,
      stack: error.stack
    });
    
    // Format error based on type
    if (error.status === 401) {
      return next(createError('OpenAI API key is invalid', 401, 'OPENAI_UNAUTHORIZED'));
    } else if (error.status === 429) {
      return next(createError('OpenAI rate limit exceeded', 429, 'OPENAI_RATE_LIMIT'));
    } else if (error.status) {
      return next(createError(`OpenAI API error: ${error.message}`, error.status, 'OPENAI_API_ERROR'));
    }
    
    // Generic error for other issues
    next(createError('Error generating completion', 500, 'OPENAI_ERROR'));
  }
}

/**
 * Generate a chat completion using OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function generateChatCompletion(req, res, next) {
  try {
    // Extract validated data from request (safe since it passed validation middleware)
    const { messages, model, maxTokens, temperature, responseFormat } = req.body;
    
    // Log the request
    logger.info('OpenAI chat completion request', {
      model,
      messageCount: messages.length,
      maxTokens
    });
    
    // Prepare API options
    const options = {
      model: model || 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages,
      max_tokens: maxTokens || 1024,
      temperature: temperature || 0.7
    };
    
    // Add response format if specified
    if (responseFormat) {
      options.response_format = { type: responseFormat };
    }
    
    // Make request to OpenAI API
    const completion = await openai.chat.completions.create(options);
    
    // Extract and log result
    const result = completion.choices[0].message.content;
    logger.info('OpenAI chat completion success', {
      model,
      promptTokens: completion.usage.prompt_tokens,
      completionTokens: completion.usage.completion_tokens,
      totalTokens: completion.usage.total_tokens
    });
    
    // Return successful response
    res.json({
      success: true,
      data: {
        message: {
          role: completion.choices[0].message.role,
          content: result
        },
        usage: {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens
        }
      }
    });
  } catch (error) {
    // Log API errors
    logger.error('OpenAI chat completion error', {
      error: error.message,
      status: error.status,
      stack: error.stack
    });
    
    // Format error based on type
    if (error.status === 401) {
      return next(createError('OpenAI API key is invalid', 401, 'OPENAI_UNAUTHORIZED'));
    } else if (error.status === 429) {
      return next(createError('OpenAI rate limit exceeded', 429, 'OPENAI_RATE_LIMIT'));
    } else if (error.status) {
      return next(createError(`OpenAI API error: ${error.message}`, error.status, 'OPENAI_API_ERROR'));
    }
    
    // Generic error for other issues
    next(createError('Error generating chat completion', 500, 'OPENAI_ERROR'));
  }
}

/**
 * Generate an image using OpenAI DALL-E
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function generateImage(req, res, next) {
  try {
    // Extract validated data from request (safe since it passed validation middleware)
    const { prompt, n, size, quality, responseFormat } = req.body;
    
    // Log the request
    logger.info('OpenAI image generation request', {
      promptLength: prompt.length,
      size,
      quality
    });
    
    // Make request to OpenAI API
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: n || 1,
      size: size || '1024x1024',
      quality: quality || 'standard',
      response_format: responseFormat || 'url'
    });
    
    // Extract and log result
    logger.info('OpenAI image generation success', {
      imageCount: response.data.length
    });
    
    // Return successful response
    res.json({
      success: true,
      data: {
        images: response.data.map(img => ({
          url: img.url,
          revisedPrompt: img.revised_prompt
        }))
      }
    });
  } catch (error) {
    // Log API errors
    logger.error('OpenAI image generation error', {
      error: error.message,
      status: error.status,
      stack: error.stack
    });
    
    // Format error based on type
    if (error.status === 401) {
      return next(createError('OpenAI API key is invalid', 401, 'OPENAI_UNAUTHORIZED'));
    } else if (error.status === 429) {
      return next(createError('OpenAI rate limit exceeded', 429, 'OPENAI_RATE_LIMIT'));
    } else if (error.status) {
      return next(createError(`OpenAI API error: ${error.message}`, error.status, 'OPENAI_API_ERROR'));
    }
    
    // Generic error for other issues
    next(createError('Error generating image', 500, 'OPENAI_ERROR'));
  }
}

module.exports = {
  generateCompletion,
  generateChatCompletion,
  generateImage
};