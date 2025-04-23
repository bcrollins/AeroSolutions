/**
 * OpenAI Model
 * 
 * Provides a wrapper for OpenAI API services
 */

const OpenAI = require('openai');

// Initialize OpenAI API client with key from environment
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

// Default values for API calls
const defaults = {
  model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  max_tokens: 500,
  temperature: 0.7
};

/**
 * Generate text using OpenAI's chat completion API
 * @param {Object} options - Options for text generation
 * @param {string} options.prompt - The prompt to generate text from
 * @param {string} [options.model] - OpenAI model to use
 * @param {number} [options.max_tokens] - Maximum tokens to generate
 * @param {number} [options.temperature] - Sampling temperature
 * @returns {Promise<Object>} - Generated text and metadata
 */
const generateText = async (options) => {
  try {
    const params = {
      model: options.model || defaults.model,
      messages: [{ role: 'user', content: options.prompt }],
      max_tokens: options.max_tokens || defaults.max_tokens,
      temperature: options.temperature || defaults.temperature
    };
    
    const response = await openai.chat.completions.create(params);
    
    return {
      text: response.choices[0].message.content,
      usage: response.usage,
      model: response.model
    };
  } catch (error) {
    console.error('OpenAI generateText error:', error);
    throw new Error(`Failed to generate text: ${error.message}`);
  }
};

/**
 * Generate JSON using OpenAI's chat completion API with JSON mode
 * @param {Object} options - Options for JSON generation
 * @param {string} options.prompt - The prompt to generate JSON from
 * @param {string} [options.model] - OpenAI model to use
 * @param {number} [options.max_tokens] - Maximum tokens to generate
 * @param {number} [options.temperature] - Sampling temperature
 * @returns {Promise<Object>} - Generated JSON and metadata
 */
const generateJSON = async (options) => {
  try {
    const params = {
      model: options.model || defaults.model,
      messages: [
        { 
          role: 'system', 
          content: 'You are a JSON generator. Respond with valid JSON only, no additional text.'
        },
        { 
          role: 'user', 
          content: options.prompt 
        }
      ],
      max_tokens: options.max_tokens || defaults.max_tokens,
      temperature: options.temperature || defaults.temperature,
      response_format: { type: 'json_object' }
    };
    
    const response = await openai.chat.completions.create(params);
    
    return {
      json: JSON.parse(response.choices[0].message.content),
      usage: response.usage,
      model: response.model
    };
  } catch (error) {
    console.error('OpenAI generateJSON error:', error);
    throw new Error(`Failed to generate JSON: ${error.message}`);
  }
};

/**
 * Analyze an image using OpenAI's vision API
 * @param {Object} options - Options for image analysis
 * @param {string} options.image - Base64 encoded image to analyze
 * @param {string} [options.prompt] - Additional prompt for analysis guidance
 * @param {string} [options.model] - OpenAI model to use
 * @param {number} [options.max_tokens] - Maximum tokens to generate
 * @returns {Promise<Object>} - Analysis results and metadata
 */
const analyzeImage = async (options) => {
  try {
    const params = {
      model: options.model || 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: options.prompt || 'Analyze this image in detail and describe its key elements, context, and any notable aspects.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${options.image}`
              }
            }
          ],
        },
      ],
      max_tokens: options.max_tokens || 500,
    };
    
    const response = await openai.chat.completions.create(params);
    
    return {
      analysis: response.choices[0].message.content,
      usage: response.usage,
      model: response.model
    };
  } catch (error) {
    console.error('OpenAI analyzeImage error:', error);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
};

/**
 * Test the OpenAI connection with a simple query
 * @returns {Promise<Object>} - Connection status and model information
 */
const testConnection = async () => {
  try {
    const response = await openai.chat.completions.create({
      model: defaults.model,
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5
    });
    
    return {
      status: 'connected',
      model: response.model,
      available: true
    };
  } catch (error) {
    console.error('OpenAI testConnection error:', error);
    return {
      status: 'error',
      message: error.message,
      available: false
    };
  }
};

module.exports = {
  generateText,
  generateJSON,
  analyzeImage,
  testConnection
};