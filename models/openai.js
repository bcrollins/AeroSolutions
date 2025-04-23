/**
 * OpenAI Model
 * 
 * Handles interactions with the OpenAI API
 */

const OpenAI = require('openai');

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Default values
const DEFAULT_MODEL = 'gpt-4o'; // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const DEFAULT_MAX_TOKENS = 1000;
const DEFAULT_TEMPERATURE = 0.7;

/**
 * Generate text using OpenAI
 * @param {Object} options - Generation options
 * @param {string} options.prompt - The prompt to generate from
 * @param {string} [options.model] - The model to use
 * @param {number} [options.max_tokens] - Maximum tokens to generate
 * @param {number} [options.temperature] - Temperature for generation
 * @returns {Promise<Object>} - OpenAI completion response
 */
const generateText = async ({ prompt, model = DEFAULT_MODEL, max_tokens = DEFAULT_MAX_TOKENS, temperature = DEFAULT_TEMPERATURE }) => {
  try {
    const response = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: model,
      max_tokens: max_tokens,
      temperature: temperature
    });
    
    return response;
  } catch (error) {
    console.error('OpenAI text generation error:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
};

/**
 * Generate JSON using OpenAI
 * @param {Object} options - Generation options
 * @param {string} options.prompt - The prompt to generate from
 * @param {string} [options.model] - The model to use
 * @param {number} [options.max_tokens] - Maximum tokens to generate
 * @param {number} [options.temperature] - Temperature for generation
 * @returns {Promise<Object>} - OpenAI completion response
 */
const generateJSON = async ({ prompt, model = DEFAULT_MODEL, max_tokens = DEFAULT_MAX_TOKENS, temperature = DEFAULT_TEMPERATURE }) => {
  try {
    // Add JSON instructions to the prompt
    const jsonPrompt = `${prompt}\n\nReturn your response as a valid JSON object.`;
    
    const response = await openai.chat.completions.create({
      messages: [{ role: 'user', content: jsonPrompt }],
      model: model,
      max_tokens: max_tokens,
      temperature: temperature,
      response_format: { type: 'json_object' }
    });
    
    return response;
  } catch (error) {
    console.error('OpenAI JSON generation error:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
};

/**
 * Analyze image using OpenAI
 * @param {Object} options - Analysis options
 * @param {string} options.image - Base64 encoded image
 * @param {string} [options.prompt] - Analysis prompt
 * @param {string} [options.model] - The model to use
 * @param {number} [options.max_tokens] - Maximum tokens to generate
 * @returns {Promise<Object>} - OpenAI analysis response
 */
const analyzeImage = async ({ image, prompt = 'Analyze this image in detail.', model = DEFAULT_MODEL, max_tokens = DEFAULT_MAX_TOKENS }) => {
  try {
    const response = await openai.chat.completions.create({
      model: model,
      max_tokens: max_tokens,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${image}`
              }
            }
          ],
        },
      ],
    });
    
    return response;
  } catch (error) {
    console.error('OpenAI image analysis error:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
};

/**
 * Test OpenAI API connection
 * @returns {Promise<Object>} - Connection test result
 */
const testConnection = async () => {
  try {
    const models = await openai.models.list();
    
    return {
      success: true,
      message: 'OpenAI API connection successful',
      models: models.data.slice(0, 5).map(model => model.id), // Return first 5 models
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('OpenAI connection test error:', error);
    throw new Error(`OpenAI API connection failed: ${error.message}`);
  }
};

module.exports = {
  generateText,
  generateJSON,
  analyzeImage,
  testConnection
};