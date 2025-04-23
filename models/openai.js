/**
 * OpenAI Model
 * 
 * Handles OpenAI API interactions
 */

const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class OpenAIService {
  /**
   * Generate text using OpenAI
   * @param {Object} options - Generation options
   * @param {string} options.prompt - The prompt to generate text from
   * @param {string} [options.model='gpt-4o'] - The model to use
   * @param {number} [options.max_tokens=500] - Maximum tokens to generate
   * @param {number} [options.temperature=0.7] - Sampling temperature
   * @returns {Promise<Object>} Generated text and metadata
   */
  static async generateText({ 
    prompt, 
    model = 'gpt-4o', 
    max_tokens = 500, 
    temperature = 0.7 
  }) {
    try {
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: max_tokens,
        temperature: temperature
      });
      
      return {
        text: response.choices[0].message.content,
        model: model,
        usage: response.usage
      };
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  }
  
  /**
   * Generate structured JSON using OpenAI
   * @param {Object} options - Generation options
   * @param {string} options.prompt - The prompt to generate JSON from
   * @param {string} [options.model='gpt-4o'] - The model to use
   * @param {number} [options.max_tokens=1000] - Maximum tokens to generate
   * @param {number} [options.temperature=0.7] - Sampling temperature
   * @returns {Promise<Object>} Generated JSON and metadata
   */
  static async generateJSON({ 
    prompt, 
    model = 'gpt-4o', 
    max_tokens = 1000, 
    temperature = 0.7 
  }) {
    try {
      // Modify prompt to specify JSON output
      const jsonPrompt = `${prompt}\n\nRespond with valid JSON only. No explanation or text outside of the JSON structure.`;
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: jsonPrompt }],
        max_tokens: max_tokens,
        temperature: temperature,
        response_format: { type: 'json_object' }
      });
      
      const content = response.choices[0].message.content;
      
      // Parse JSON or return error if invalid
      try {
        const parsedJSON = JSON.parse(content);
        
        return {
          json: parsedJSON,
          model: model,
          usage: response.usage
        };
      } catch (parseError) {
        throw new Error('Failed to parse generated JSON: ' + parseError.message);
      }
    } catch (error) {
      console.error('Error generating JSON:', error);
      throw error;
    }
  }
  
  /**
   * Analyze an image using OpenAI Vision
   * @param {Object} options - Analysis options
   * @param {string} options.image - Base64 encoded image
   * @param {string} options.prompt - Text prompt for analysis
   * @param {string} [options.model='gpt-4o'] - The model to use
   * @param {number} [options.max_tokens=500] - Maximum tokens to generate
   * @returns {Promise<Object>} Analysis results
   */
  static async analyzeImage({ 
    image, 
    prompt, 
    model = 'gpt-4o', 
    max_tokens = 500 
  }) {
    try {
      // Prepare message with image and text
      const messages = [
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
                url: `data:image/jpeg;base64,${image}`
              }
            }
          ]
        }
      ];
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: model,
        messages: messages,
        max_tokens: max_tokens
      });
      
      return {
        analysis: response.choices[0].message.content,
        model: model,
        usage: response.usage
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  }
  
  /**
   * Test OpenAI API connection
   * @returns {Promise<Object>} Connection status
   */
  static async testConnection() {
    try {
      // Simple test request
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Hello, are you working?' }],
        max_tokens: 20,
        temperature: 0.5
      });
      
      return {
        success: true,
        model: 'gpt-4o',
        message: response.choices[0].message.content
      };
    } catch (error) {
      console.error('OpenAI API connection test failed:', error);
      return {
        success: false,
        error: error.message,
        details: error.response?.data || 'No details available'
      };
    }
  }
}

module.exports = OpenAIService;