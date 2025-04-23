/**
 * OpenAI Controller
 * 
 * Handles logic for OpenAI-related routes
 */

const OpenAIService = require('../models/openai');

class OpenAIController {
  /**
   * Generate text using OpenAI
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateText(req, res) {
    try {
      const { prompt, model, max_tokens, temperature } = req.body;
      
      // Validate required fields
      if (!prompt) {
        return res.status(400).json({
          success: false,
          message: 'Prompt is required'
        });
      }
      
      // Generate text
      const result = await OpenAIService.generateText({
        prompt,
        model,
        max_tokens,
        temperature
      });
      
      res.json({
        success: true,
        text: result.text,
        model: result.model,
        usage: result.usage
      });
    } catch (error) {
      console.error('Error generating text:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating text',
        error: error.message
      });
    }
  }
  
  /**
   * Generate JSON using OpenAI
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateJson(req, res) {
    try {
      const { prompt, model, max_tokens, temperature } = req.body;
      
      // Validate required fields
      if (!prompt) {
        return res.status(400).json({
          success: false,
          message: 'Prompt is required'
        });
      }
      
      // Generate JSON
      const result = await OpenAIService.generateJSON({
        prompt,
        model,
        max_tokens,
        temperature
      });
      
      res.json({
        success: true,
        json: result.json,
        model: result.model,
        usage: result.usage
      });
    } catch (error) {
      console.error('Error generating JSON:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating JSON',
        error: error.message
      });
    }
  }
  
  /**
   * Analyze an image using OpenAI
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async analyzeImage(req, res) {
    try {
      const { image, prompt, model, max_tokens } = req.body;
      
      // Validate required fields
      if (!image) {
        return res.status(400).json({
          success: false,
          message: 'Image data is required'
        });
      }
      
      // Analyze image
      const result = await OpenAIService.analyzeImage({
        image,
        prompt,
        model,
        max_tokens
      });
      
      res.json({
        success: true,
        analysis: result.analysis,
        model: result.model,
        usage: result.usage
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      res.status(500).json({
        success: false,
        message: 'Error analyzing image',
        error: error.message
      });
    }
  }
  
  /**
   * Test OpenAI connection
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async testConnection(req, res) {
    try {
      const result = await OpenAIService.testConnection();
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          model: result.model
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'OpenAI API connection failed',
          error: result.error,
          details: result.details
        });
      }
    } catch (error) {
      console.error('Error testing OpenAI connection:', error);
      res.status(500).json({
        success: false,
        message: 'Error testing OpenAI connection',
        error: error.message
      });
    }
  }
}

module.exports = new OpenAIController();