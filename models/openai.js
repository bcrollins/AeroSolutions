/**
 * OpenAI Model
 * 
 * Handles interactions with the OpenAI API
 */

const OpenAI = require('openai');

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class OpenAIService {
  /**
   * Generate text using OpenAI API
   * @param {Object} options - Generation options
   * @param {string} options.prompt - The prompt to send to OpenAI
   * @param {string} [options.model='gpt-4o'] - OpenAI model to use
   * @param {number} [options.max_tokens=500] - Maximum tokens to generate
   * @param {number} [options.temperature=0.7] - Temperature for text generation
   * @returns {Promise<Object>} - Generated text and metadata
   */
  async generateText({ prompt, model = 'gpt-4o', max_tokens = 500, temperature = 0.7 }) {
    try {
      const startTime = Date.now();
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: max_tokens,
        temperature: temperature
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        text: response.choices[0].message.content,
        model: response.model,
        usage: response.usage,
        responseTime
      };
    } catch (error) {
      console.error('OpenAI text generation error:', error);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
  
  /**
   * Generate structured JSON using OpenAI API
   * @param {Object} options - Generation options
   * @param {string} options.prompt - The prompt to send to OpenAI
   * @param {string} [options.model='gpt-4o'] - OpenAI model to use
   * @param {number} [options.max_tokens=500] - Maximum tokens to generate
   * @param {number} [options.temperature=0.7] - Temperature for generation
   * @returns {Promise<Object>} - Generated JSON and metadata
   */
  async generateJSON({ prompt, model = 'gpt-4o', max_tokens = 500, temperature = 0.7 }) {
    try {
      const startTime = Date.now();
      
      // Enhance prompt to request JSON format
      const jsonPrompt = `${prompt}\n\nRespond with valid JSON only.`;
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: jsonPrompt }],
        max_tokens: max_tokens,
        temperature: temperature,
        response_format: { type: 'json_object' }
      });
      
      const responseTime = Date.now() - startTime;
      
      // Parse response to ensure valid JSON
      const jsonText = response.choices[0].message.content;
      const jsonData = JSON.parse(jsonText);
      
      return {
        json: jsonData,
        model: response.model,
        usage: response.usage,
        responseTime
      };
    } catch (error) {
      console.error('OpenAI JSON generation error:', error);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
  
  /**
   * Analyze an image using OpenAI API
   * @param {Object} options - Analysis options
   * @param {string} options.image - Base64-encoded image data
   * @param {string} [options.prompt='Analyze this image in detail'] - Prompt for analysis
   * @param {string} [options.model='gpt-4o'] - OpenAI model to use
   * @param {number} [options.max_tokens=500] - Maximum tokens to generate
   * @returns {Promise<Object>} - Image analysis and metadata
   */
  async analyzeImage({ image, prompt = 'Analyze this image in detail', model = 'gpt-4o', max_tokens = 500 }) {
    try {
      const startTime = Date.now();
      
      if (!image) {
        throw new Error('Image data is required');
      }
      
      // Check if image is already base64 or needs conversion
      const base64Image = image.startsWith('data:image') ? image : `data:image/jpeg;base64,${image}`;
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image
                }
              }
            ]
          }
        ],
        max_tokens: max_tokens
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        analysis: response.choices[0].message.content,
        model: response.model,
        usage: response.usage,
        responseTime
      };
    } catch (error) {
      console.error('OpenAI image analysis error:', error);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
  
  /**
   * Test OpenAI API connection
   * @returns {Promise<Object>} - Connection test result
   */
  async testConnection() {
    try {
      const startTime = Date.now();
      
      // Simple test prompt
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Hello, this is a connection test. Please respond with "OpenAI connection successful".' }],
        max_tokens: 20,
        temperature: 0.5
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        message: 'OpenAI API connection successful',
        responseTime,
        model: response.model
      };
    } catch (error) {
      console.error('OpenAI connection test error:', error);
      
      return {
        success: false,
        message: 'OpenAI API connection failed',
        error: error.message,
        details: error.stack
      };
    }
  }
}

module.exports = new OpenAIService();