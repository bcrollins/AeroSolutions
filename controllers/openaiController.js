/**
 * OpenAI Controller
 * 
 * Handles logic for OpenAI-related routes
 */
const OpenAI = require('openai');
const logger = require('../config/logger');
const { ValidationError, ServiceUnavailableError } = require('../middlewares/errorHandler');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Default model to use
const DEFAULT_MODEL = 'gpt-4o'; // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const DEFAULT_MAX_TOKENS = 1000;
const DEFAULT_TEMPERATURE = 0.7;

/**
 * Generate text using OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function generateText(req, res, next) {
  try {
    const { prompt, model = DEFAULT_MODEL, max_tokens = DEFAULT_MAX_TOKENS, temperature = DEFAULT_TEMPERATURE } = req.body;
    
    // Validate input
    if (!prompt) {
      throw new ValidationError('Prompt is required', { prompt: 'This field is required' });
    }
    
    if (typeof prompt !== 'string') {
      throw new ValidationError('Prompt must be a string', { prompt: 'Invalid type, must be a string' });
    }
    
    // Log the request (sanitized for privacy/security)
    logger.logOpenAIRequest('generateText', {
      model,
      prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
      max_tokens,
      temperature
    }, 'pending');
    
    // Make the API call
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens,
      temperature,
    });
    
    // Log success (sanitized)
    logger.logOpenAIRequest('generateText', {
      model,
      prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
    }, 'success');
    
    // Return response
    return res.json({
      success: true,
      data: {
        text: response.choices[0].message.content,
        usage: response.usage,
        model: response.model,
      }
    });
  } catch (error) {
    // Handle specific OpenAI errors
    if (error.name === 'APIError') {
      if (error.status === 429) {
        return next(new ServiceUnavailableError('OpenAI rate limit exceeded, please try again later'));
      } else if (error.status === 400) {
        return next(new ValidationError('Invalid request to OpenAI', { details: error.message }));
      } else {
        logger.error('OpenAI API Error', { error: error.message, status: error.status });
        return next(new ServiceUnavailableError('Error communicating with OpenAI'));
      }
    }
    
    // Pass to global error handler for all other errors
    next(error);
  }
}

/**
 * Generate JSON using OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function generateJSON(req, res, next) {
  try {
    const { 
      prompt, 
      model = DEFAULT_MODEL, 
      max_tokens = DEFAULT_MAX_TOKENS, 
      temperature = DEFAULT_TEMPERATURE,
      schema
    } = req.body;
    
    // Validate input
    if (!prompt) {
      throw new ValidationError('Prompt is required', { prompt: 'This field is required' });
    }
    
    if (typeof prompt !== 'string') {
      throw new ValidationError('Prompt must be a string', { prompt: 'Invalid type, must be a string' });
    }
    
    // Create an augmented prompt that includes schema information if provided
    let augmentedPrompt = prompt;
    if (schema) {
      augmentedPrompt += `\n\nPlease return a valid JSON object with the following structure: ${JSON.stringify(schema)}`;
    }
    
    // Log the request (sanitized for privacy/security)
    logger.logOpenAIRequest('generateJSON', {
      model,
      prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
      max_tokens,
      temperature,
      schema: schema ? 'provided' : 'not provided'
    }, 'pending');
    
    // Make the API call with JSON response format
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: augmentedPrompt }],
      max_tokens,
      temperature,
      response_format: { type: "json_object" }
    });
    
    // Log success
    logger.logOpenAIRequest('generateJSON', {
      model,
      prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
    }, 'success');
    
    // Parse the JSON response
    let jsonData;
    try {
      jsonData = JSON.parse(response.choices[0].message.content);
    } catch (parseError) {
      throw new ValidationError('OpenAI returned invalid JSON', { 
        response: response.choices[0].message.content.substring(0, 100) + '...' 
      });
    }
    
    // Return response
    return res.json({
      success: true,
      data: {
        json: jsonData,
        usage: response.usage,
        model: response.model,
      }
    });
  } catch (error) {
    // Handle specific OpenAI errors
    if (error.name === 'APIError') {
      if (error.status === 429) {
        return next(new ServiceUnavailableError('OpenAI rate limit exceeded, please try again later'));
      } else if (error.status === 400) {
        return next(new ValidationError('Invalid request to OpenAI', { details: error.message }));
      } else {
        logger.error('OpenAI API Error', { error: error.message, status: error.status });
        return next(new ServiceUnavailableError('Error communicating with OpenAI'));
      }
    }
    
    // Pass to global error handler for all other errors
    next(error);
  }
}

/**
 * Analyze image using OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function analyzeImage(req, res, next) {
  try {
    const { image_url, image_base64, prompt, model = 'gpt-4o' } = req.body;
    
    // Validate input
    if (!image_url && !image_base64) {
      throw new ValidationError('Either image_url or image_base64 is required', { 
        image: 'Provide either an image URL or base64 encoded image' 
      });
    }
    
    if (!prompt) {
      throw new ValidationError('Prompt is required', { prompt: 'This field is required' });
    }
    
    // Prepare the message content
    const content = [
      { type: 'text', text: prompt }
    ];
    
    // Add the image
    if (image_url) {
      content.push({
        type: 'image_url',
        image_url: { url: image_url },
      });
    } else if (image_base64) {
      content.push({
        type: 'image_url',
        image_url: { url: `data:image/jpeg;base64,${image_base64}` },
      });
    }
    
    // Log the request (sanitized for privacy/security)
    logger.logOpenAIRequest('analyzeImage', {
      model,
      prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
      has_image: true,
    }, 'pending');
    
    // Make the API call
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content }],
      max_tokens: DEFAULT_MAX_TOKENS,
    });
    
    // Log success
    logger.logOpenAIRequest('analyzeImage', {
      model,
      prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
    }, 'success');
    
    // Return response
    return res.json({
      success: true,
      data: {
        analysis: response.choices[0].message.content,
        model: response.model,
      }
    });
  } catch (error) {
    // Handle specific OpenAI errors
    if (error.name === 'APIError') {
      if (error.status === 429) {
        return next(new ServiceUnavailableError('OpenAI rate limit exceeded, please try again later'));
      } else if (error.status === 400) {
        return next(new ValidationError('Invalid request to OpenAI', { details: error.message }));
      } else {
        logger.error('OpenAI API Error', { error: error.message, status: error.status });
        return next(new ServiceUnavailableError('Error communicating with OpenAI'));
      }
    }
    
    // Pass to global error handler for all other errors
    next(error);
  }
}

/**
 * Test OpenAI API connection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function testConnection(req, res, next) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      throw new ServiceUnavailableError('OpenAI API key is not configured');
    }
    
    // Make a simple API call to test connection
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: 'Hello, this is a test. Respond with a simple "OK".' }],
      max_tokens: 10,
      temperature: 0.1,
    });
    
    // Return success response
    return res.json({
      success: true,
      data: {
        status: 'connected',
        model: response.model,
        message: 'Successfully connected to OpenAI API',
      }
    });
  } catch (error) {
    // Handle specific OpenAI errors
    if (error.name === 'APIError') {
      logger.error('OpenAI API Error during connection test', { 
        error: error.message, 
        status: error.status 
      });
      
      return res.status(503).json({
        success: false,
        error: {
          message: 'Failed to connect to OpenAI API',
          details: error.message,
          status: error.status,
        }
      });
    }
    
    // Pass to global error handler for all other errors
    next(error);
  }
}

module.exports = {
  generateText,
  generateJSON,
  analyzeImage,
  testConnection
};