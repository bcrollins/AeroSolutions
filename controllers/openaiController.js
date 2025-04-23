/**
 * OpenAI Controller
 * 
 * Handles logic for OpenAI API integration
 */
const OpenAI = require('openai');
const logger = require('../config/logger');
const { 
  ValidationError, 
  ServiceUnavailableError, 
  InternalServerError 
} = require('../middlewares/errorHandler');

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validate and sanitize parameters for text generation
function validateTextParams(params) {
  const errors = {};
  const sanitizedParams = {
    model: params.model || 'gpt-4o', 
    messages: [],
    max_tokens: params.max_tokens || 500,
    temperature: params.temperature || 0.7
  };

  // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

  // Validate model
  if (!params.model && !sanitizedParams.model) {
    errors.model = 'Model is required';
  }

  // Validate prompt
  if (!params.prompt) {
    errors.prompt = 'Prompt is required';
  } else {
    // Convert prompt to OpenAI messages format (for modern models)
    sanitizedParams.messages = [
      { role: 'user', content: params.prompt }
    ];
  }

  // Validate max_tokens
  if (params.max_tokens !== undefined) {
    const maxTokens = parseInt(params.max_tokens);
    if (isNaN(maxTokens) || maxTokens < 1 || maxTokens > 4000) {
      errors.max_tokens = 'max_tokens must be a number between 1 and 4000';
    } else {
      sanitizedParams.max_tokens = maxTokens;
    }
  }

  // Validate temperature
  if (params.temperature !== undefined) {
    const temp = parseFloat(params.temperature);
    if (isNaN(temp) || temp < 0 || temp > 2) {
      errors.temperature = 'temperature must be a number between 0 and 2';
    } else {
      sanitizedParams.temperature = temp;
    }
  }

  // Return errors and sanitized parameters
  return {
    errors: Object.keys(errors).length > 0 ? errors : null,
    params: sanitizedParams
  };
}

// Validate and sanitize parameters for JSON generation
function validateJSONParams(params) {
  const { errors, params: sanitizedParams } = validateTextParams(params);
  
  // Add response_format for JSON
  sanitizedParams.response_format = { type: "json_object" };
  
  return { errors, params: sanitizedParams };
}

// Validate parameters for image analysis
function validateImageParams(params) {
  const errors = {};
  
  // Check if image data is provided
  if (!params.image) {
    errors.image = 'Image data is required';
  }
  
  // Check if prompt is provided
  if (!params.prompt) {
    // Use default prompt if not provided
    params.prompt = 'Analyze this image in detail and describe its key elements, context, and any notable aspects.';
  }
  
  // Default model
  const sanitizedParams = {
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: params.prompt
          },
          {
            type: 'image_url',
            image_url: {
              url: params.image.startsWith('data:') 
                ? params.image 
                : `data:image/jpeg;base64,${params.image}`
            }
          }
        ]
      }
    ],
    max_tokens: params.max_tokens || 500
  };
  
  return {
    errors: Object.keys(errors).length > 0 ? errors : null,
    params: sanitizedParams
  };
}

/**
 * Generate text using OpenAI API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function generateText(req, res, next) {
  try {
    // Validate and sanitize request parameters
    const { errors, params } = validateTextParams(req.body);
    
    // Return validation errors if any
    if (errors) {
      throw new ValidationError('Validation failed', errors);
    }
    
    // Log OpenAI request (excluding full content for privacy)
    logger.logOpenAIRequest('text', {
      model: params.model,
      max_tokens: params.max_tokens,
      temperature: params.temperature,
      prompt_length: params.messages[0].content.length
    }, 'request');
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create(params);
    
    // Extract response text
    const responseText = completion.choices[0].message.content;
    
    // Log successful response (excluding full content for privacy)
    logger.logOpenAIRequest('text', {
      model: params.model,
      tokens_used: completion.usage?.total_tokens || 'unknown',
      response_length: responseText.length
    }, 'success');
    
    // Return response
    return res.json({
      success: true,
      data: {
        text: responseText,
        model: params.model,
        usage: completion.usage
      }
    });
  } catch (error) {
    // Handle and log error
    logger.logOpenAIRequest('text', {
      error: error.message,
      status: error.status || 500
    }, 'error');
    
    // Handle specific API errors
    if (error.response) {
      next(new ServiceUnavailableError(`OpenAI API Error: ${error.response.data.error.message}`));
    } else if (error instanceof ValidationError) {
      next(error);
    } else {
      next(new InternalServerError(`Failed to generate text: ${error.message}`));
    }
  }
}

/**
 * Generate JSON using OpenAI API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function generateJSON(req, res, next) {
  try {
    // Validate and sanitize request parameters
    const { errors, params } = validateJSONParams(req.body);
    
    // Return validation errors if any
    if (errors) {
      throw new ValidationError('Validation failed', errors);
    }
    
    // Log OpenAI request (excluding full content for privacy)
    logger.logOpenAIRequest('json', {
      model: params.model,
      max_tokens: params.max_tokens,
      temperature: params.temperature,
      prompt_length: params.messages[0].content.length
    }, 'request');
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create(params);
    
    // Extract response JSON
    const responseText = completion.choices[0].message.content;
    let responseJSON;
    
    try {
      // Parse the JSON response
      responseJSON = JSON.parse(responseText);
    } catch (parseError) {
      throw new InternalServerError('Failed to parse JSON response from OpenAI');
    }
    
    // Log successful response
    logger.logOpenAIRequest('json', {
      model: params.model,
      tokens_used: completion.usage?.total_tokens || 'unknown',
    }, 'success');
    
    // Return response
    return res.json({
      success: true,
      data: {
        json: responseJSON,
        model: params.model,
        usage: completion.usage
      }
    });
  } catch (error) {
    // Handle and log error
    logger.logOpenAIRequest('json', {
      error: error.message,
      status: error.status || 500
    }, 'error');
    
    // Handle specific API errors
    if (error.response) {
      next(new ServiceUnavailableError(`OpenAI API Error: ${error.response.data.error.message}`));
    } else if (error instanceof ValidationError) {
      next(error);
    } else {
      next(new InternalServerError(`Failed to generate JSON: ${error.message}`));
    }
  }
}

/**
 * Analyze image using OpenAI Vision API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function analyzeImage(req, res, next) {
  try {
    // Validate and sanitize request parameters
    const { errors, params } = validateImageParams(req.body);
    
    // Return validation errors if any
    if (errors) {
      throw new ValidationError('Validation failed', errors);
    }
    
    // Log OpenAI request (excluding image data for privacy)
    logger.logOpenAIRequest('vision', {
      model: params.model,
      max_tokens: params.max_tokens,
      prompt: params.messages[0].content[0].text
    }, 'request');
    
    // Call OpenAI API
    const response = await openai.chat.completions.create(params);
    
    // Extract response text
    const analysisText = response.choices[0].message.content;
    
    // Log successful response
    logger.logOpenAIRequest('vision', {
      model: params.model,
      tokens_used: response.usage?.total_tokens || 'unknown',
      response_length: analysisText.length
    }, 'success');
    
    // Return response
    return res.json({
      success: true,
      data: {
        analysis: analysisText,
        model: params.model,
        usage: response.usage
      }
    });
  } catch (error) {
    // Handle and log error
    logger.logOpenAIRequest('vision', {
      error: error.message,
      status: error.status || 500
    }, 'error');
    
    // Handle specific API errors
    if (error.response) {
      next(new ServiceUnavailableError(`OpenAI API Error: ${error.response.data.error.message}`));
    } else if (error instanceof ValidationError) {
      next(error);
    } else {
      next(new InternalServerError(`Failed to analyze image: ${error.message}`));
    }
  }
}

/**
 * Test OpenAI API connection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function testConnection(req, res, next) {
  try {
    // Simple prompt to test connection
    const params = {
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Hello, are you working? Reply with a simple yes.' }],
      max_tokens: 10,
      temperature: 0.5
    };
    
    // Log test request
    logger.info('Testing OpenAI API connection');
    
    // Call OpenAI API
    const response = await openai.chat.completions.create(params);
    
    // Check if response is valid
    if (response && response.choices && response.choices.length > 0) {
      return res.json({
        success: true,
        data: {
          connected: true,
          model: response.model,
          message: 'Successfully connected to OpenAI API'
        }
      });
    } else {
      throw new Error('Invalid response from OpenAI API');
    }
  } catch (error) {
    logger.error('OpenAI connection test failed', { error: error.message });
    
    return res.status(500).json({
      success: false,
      error: {
        connected: false,
        message: `Failed to connect to OpenAI API: ${error.message}`,
        details: error.response ? error.response.data : null
      }
    });
  }
}

module.exports = {
  generateText,
  generateJSON,
  analyzeImage,
  testConnection
};