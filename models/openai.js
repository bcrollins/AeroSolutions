/**
 * OpenAI Model
 * 
 * Handles interactions with the OpenAI API
 */

const { Configuration, OpenAIApi } = require('openai');
const logger = require('../config/logger');

// Initialize OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});

// Create the OpenAI API instance
const openai = new OpenAIApi(configuration);

/**
 * Default model to use (gpt-4o is the newest as of May 13, 2024)
 */
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

/**
 * Generate text completion using OpenAI
 * @param {string} prompt - The prompt text
 * @param {object} options - Generation options
 * @returns {Promise<object>} - OpenAI response
 */
async function generateText(prompt, options = {}) {
  try {
    const model = options.model || DEFAULT_MODEL;
    const maxTokens = options.max_tokens || 1000;
    const temperature = options.temperature || 0.7;

    logger.info(`Generating text with model: ${model}`);
    
    const response = await openai.createChatCompletion({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: temperature
    });

    return {
      success: true,
      data: response.data,
      text: response.data.choices[0].message.content,
      usage: response.data.usage
    };
  } catch (error) {
    logger.error(`OpenAI text generation error: ${error.message}`);
    return {
      success: false,
      error: {
        message: error.message,
        code: error.response?.status || 'UNKNOWN'
      }
    };
  }
}

/**
 * Generate JSON using OpenAI
 * @param {string} prompt - The prompt text
 * @param {object} options - Generation options
 * @returns {Promise<object>} - OpenAI response with JSON
 */
async function generateJSON(prompt, options = {}) {
  try {
    const model = options.model || DEFAULT_MODEL;
    const maxTokens = options.max_tokens || 1000;
    const temperature = options.temperature || 0.7;
    
    logger.info(`Generating JSON with model: ${model}`);
    
    const systemPrompt = 'You are a helpful assistant that always responds with valid JSON. ' +
                         'Ensure your response can be parsed with JSON.parse().';
    
    const response = await openai.createChatCompletion({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: maxTokens,
      temperature: temperature,
      response_format: { type: "json_object" }
    });

    const jsonContent = response.data.choices[0].message.content;
    
    try {
      // Verify the response is valid JSON
      const parsedJSON = JSON.parse(jsonContent);
      
      return {
        success: true,
        data: response.data,
        json: parsedJSON,
        usage: response.data.usage
      };
    } catch (parseError) {
      logger.error(`JSON parsing error: ${parseError.message}`);
      return {
        success: false,
        error: {
          message: 'Generated content is not valid JSON',
          details: parseError.message,
          content: jsonContent
        }
      };
    }
  } catch (error) {
    logger.error(`OpenAI JSON generation error: ${error.message}`);
    return {
      success: false,
      error: {
        message: error.message,
        code: error.response?.status || 'UNKNOWN'
      }
    };
  }
}

/**
 * Analyze an image using OpenAI Vision
 * @param {string} imageUrl - URL or base64 image data
 * @param {string} prompt - Optional prompt for analysis
 * @param {object} options - Analysis options
 * @returns {Promise<object>} - OpenAI response with analysis
 */
async function analyzeImage(imageUrl, prompt = 'Describe this image in detail', options = {}) {
  try {
    const model = options.model || 'gpt-4o'; // Using GPT-4o for vision capabilities
    const maxTokens = options.max_tokens || 500;
    const temperature = options.temperature || 0.7;
    
    logger.info(`Analyzing image with model: ${model}`);
    
    const imageData = imageUrl.startsWith('data:') 
      ? imageUrl 
      : { url: imageUrl };

    const response = await openai.createChatCompletion({
      model: model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: imageData }
          ]
        }
      ],
      max_tokens: maxTokens,
      temperature: temperature
    });

    return {
      success: true,
      data: response.data,
      analysis: response.data.choices[0].message.content,
      usage: response.data.usage
    };
  } catch (error) {
    logger.error(`OpenAI image analysis error: ${error.message}`);
    return {
      success: false,
      error: {
        message: error.message,
        code: error.response?.status || 'UNKNOWN'
      }
    };
  }
}

/**
 * Test the OpenAI API connection
 * @returns {Promise<object>} - Connection test result
 */
async function testConnection() {
  try {
    // Try a simple completion as a test
    const model = DEFAULT_MODEL;
    const response = await openai.createChatCompletion({
      model,
      messages: [{ role: 'user', content: 'Hello, are you working?' }],
      max_tokens: 20,
      temperature: 0.7
    });
    
    return {
      success: true,
      model,
      message: 'OpenAI API connection successful',
      data: {
        model: response.data.model,
        text: response.data.choices[0].message.content,
        usage: response.data.usage
      }
    };
  } catch (error) {
    logger.error(`OpenAI connection test error: ${error.message}`);
    
    let errorMessage = error.message;
    let errorCode = error.response?.status || 'UNKNOWN';
    
    if (error.response?.status === 401) {
      errorMessage = 'Authentication error: Invalid API key. Please check your OPENAI_API_KEY environment variable.';
    } else if (!process.env.OPENAI_API_KEY) {
      errorMessage = 'Missing API key: OPENAI_API_KEY environment variable is not set.';
      errorCode = 'CONFIG_ERROR';
    }
    
    return {
      success: false,
      error: {
        message: errorMessage,
        code: errorCode
      }
    };
  }
}

module.exports = {
  generateText,
  generateJSON,
  analyzeImage,
  testConnection,
  DEFAULT_MODEL
};