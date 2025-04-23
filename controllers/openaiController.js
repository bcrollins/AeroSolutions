/**
 * OpenAI Controller
 * 
 * Handles logic for OpenAI-related routes
 */

const OpenAI = require('openai');
const logger = require('../config/logger');

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate text using OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function generateText(req, res) {
  try {
    const { prompt, model = 'gpt-4o', max_tokens = 1000, temperature = 0.7 } = req.body;
    
    // Validate required parameters
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Prompt is required'
        }
      });
    }
    
    // Log API request (redact sensitive information)
    logger.info(`OpenAI API request for model: ${model}, tokens: ${max_tokens}, temp: ${temperature}`);
    
    // Call OpenAI API
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: max_tokens,
      temperature: temperature,
    });
    
    // Log success (no sensitive data)
    logger.info(`OpenAI API response received successfully`);
    
    // Return response
    return res.json({
      success: true,
      data: {
        text: response.choices[0].message.content,
        model: model,
        usage: response.usage
      }
    });
  } catch (error) {
    // Log error
    logger.error(`OpenAI API error: ${error.message}`);
    
    // Return error response
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error generating text with OpenAI',
        details: error.message
      }
    });
  }
}

/**
 * Generate JSON using OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function generateJSON(req, res) {
  try {
    const { prompt, model = 'gpt-4o', max_tokens = 1000, temperature = 0.7, schema } = req.body;
    
    // Validate required parameters
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Prompt is required'
        }
      });
    }

    // Create system message with schema if provided
    const systemMessage = schema 
      ? `Please provide a response in JSON format according to this schema: ${JSON.stringify(schema)}` 
      : 'Please provide a response in JSON format.';

    // Log API request (redact sensitive information)
    logger.info(`OpenAI JSON API request for model: ${model}, tokens: ${max_tokens}, temp: ${temperature}`);
    
    // Call OpenAI API with JSON format specification
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      max_tokens: max_tokens,
      temperature: temperature,
      response_format: { type: "json_object" }
    });
    
    // Log success (no sensitive data)
    logger.info(`OpenAI JSON API response received successfully`);
    
    // Parse the JSON response
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(response.choices[0].message.content);
    } catch (parseError) {
      logger.error(`Error parsing OpenAI JSON response: ${parseError.message}`);
      jsonResponse = { error: 'Could not parse JSON response', text: response.choices[0].message.content };
    }
    
    // Return response
    return res.json({
      success: true,
      data: {
        json: jsonResponse,
        model: model,
        usage: response.usage
      }
    });
  } catch (error) {
    // Log error
    logger.error(`OpenAI JSON API error: ${error.message}`);
    
    // Return error response
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error generating JSON with OpenAI',
        details: error.message
      }
    });
  }
}

/**
 * Analyze image using OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function analyzeImage(req, res) {
  try {
    const { image_url, prompt = 'Describe this image in detail.', model = 'gpt-4o' } = req.body;
    
    // Validate required parameters
    if (!image_url) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Image URL is required'
        }
      });
    }
    
    // Log API request (redact sensitive information)
    logger.info(`OpenAI Vision API request for model: ${model}`);
    
    // Call OpenAI API
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: image_url } }
          ]
        }
      ],
      max_tokens: 1000,
    });
    
    // Log success (no sensitive data)
    logger.info(`OpenAI Vision API response received successfully`);
    
    // Return response
    return res.json({
      success: true,
      data: {
        analysis: response.choices[0].message.content,
        model: model
      }
    });
  } catch (error) {
    // Log error
    logger.error(`OpenAI Vision API error: ${error.message}`);
    
    // Return error response
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error analyzing image with OpenAI',
        details: error.message
      }
    });
  }
}

/**
 * Test OpenAI API connection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function testConnection(req, res) {
  try {
    // Send a simple request to OpenAI API to test connection
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Hello, are you working?' }],
      max_tokens: 10,
      temperature: 0,
    });
    
    // Log success (no sensitive data)
    logger.info('OpenAI API connection test successful');
    
    // Return success response
    return res.json({
      success: true,
      message: 'OpenAI API connection successful',
      data: {
        model: 'gpt-4o',
        response: response.choices[0].message.content.trim()
      }
    });
  } catch (error) {
    // Log error
    logger.error(`OpenAI API connection test failed: ${error.message}`);
    
    // Return error response
    return res.status(500).json({
      success: false,
      error: {
        message: 'OpenAI API connection test failed',
        details: error.message
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