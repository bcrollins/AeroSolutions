/**
 * OpenAI Model
 * 
 * Handles interactions with the OpenAI API
 */

const { OpenAI } = require('openai');
const pool = require('../config/database');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class OpenAIService {
  /**
   * Generate text using OpenAI's GPT models
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} OpenAI response
   */
  static async generateText(options) {
    const {
      prompt,
      model = 'gpt-4o', // The newest OpenAI model is "gpt-4o" which was released May 13, 2024
      max_tokens = 1000,
      temperature = 0.7,
      systemPrompt = 'You are a helpful assistant that provides clear, concise, and accurate information.'
    } = options;

    try {
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens,
        temperature
      });

      // Log the request to the database
      await this.logRequest({
        type: 'text',
        prompt,
        model,
        tokens: completion.usage?.total_tokens || 0,
        success: true
      });

      return {
        success: true,
        result: completion.choices[0].message.content,
        model: completion.model,
        usage: completion.usage
      };
    } catch (error) {
      // Log the failed request
      await this.logRequest({
        type: 'text',
        prompt,
        model,
        success: false,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Generate JSON using OpenAI's GPT models
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Parsed JSON response
   */
  static async generateJSON(options) {
    const {
      prompt,
      model = 'gpt-4o', // The newest OpenAI model is "gpt-4o" which was released May 13, 2024
      max_tokens = 2000,
      temperature = 0.7,
      systemPrompt = 'You are a helpful assistant that provides responses in valid JSON format.'
    } = options;

    try {
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens,
        temperature,
        response_format: { type: 'json_object' }
      });

      // Parse the JSON response
      const jsonResult = JSON.parse(completion.choices[0].message.content);

      // Log the request
      await this.logRequest({
        type: 'json',
        prompt,
        model,
        tokens: completion.usage?.total_tokens || 0,
        success: true
      });

      return {
        success: true,
        result: jsonResult,
        model: completion.model,
        usage: completion.usage
      };
    } catch (error) {
      // Log the failed request
      await this.logRequest({
        type: 'json',
        prompt,
        model,
        success: false,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Analyze an image using OpenAI's vision capabilities
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis results
   */
  static async analyzeImage(options) {
    const {
      imageUrl,
      prompt = 'Analyze this image and describe what you see in detail.',
      model = 'gpt-4o', // The newest OpenAI model is "gpt-4o" which was released May 13, 2024
      max_tokens = 1000
    } = options;

    try {
      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens
      });

      // Log the request
      await this.logRequest({
        type: 'image_analysis',
        prompt,
        model,
        tokens: response.usage?.total_tokens || 0,
        success: true
      });

      return {
        success: true,
        result: response.choices[0].message.content,
        model: response.model,
        usage: response.usage
      };
    } catch (error) {
      // Log the failed request
      await this.logRequest({
        type: 'image_analysis',
        prompt,
        model,
        success: false,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Log API request to the database
   * @param {Object} logData - Log data
   * @returns {Promise<void>}
   */
  static async logRequest(logData) {
    try {
      const { type, prompt, model, tokens = 0, success, error = null } = logData;
      
      await pool.query(
        `INSERT INTO logs (
          level, message, context, source, created_at
        ) VALUES ($1, $2, $3, $4, NOW())`,
        [
          success ? 'info' : 'error',
          success ? 'OpenAI API request' : 'OpenAI API error',
          JSON.stringify({
            type,
            prompt: prompt.substring(0, 500), // Limit prompt length in logs
            model,
            tokens,
            success,
            error
          }),
          'openai-service'
        ]
      );
    } catch (dbError) {
      // Log to console since we couldn't log to database
      console.error('Error logging OpenAI request:', dbError);
    }
  }
}

module.exports = OpenAIService;