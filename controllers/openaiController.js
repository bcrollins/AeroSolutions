/**
 * OpenAI Controller
 * 
 * Handles logic for OpenAI-related routes
 */

const OpenAI = require('../models/openai');
const { z } = require('zod');

// Validation schema for generate text requests
const generateTextSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  model: z.string().optional().default('gpt-4o'),
  max_tokens: z.number().optional().default(1000),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  systemPrompt: z.string().optional()
});

// Validation schema for generate JSON requests
const generateJsonSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  model: z.string().optional().default('gpt-4o'),
  max_tokens: z.number().optional().default(2000),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  systemPrompt: z.string().optional()
});

// Validation schema for image analysis requests
const analyzeImageSchema = z.object({
  imageUrl: z.string().url('A valid image URL is required'),
  prompt: z.string().optional(),
  model: z.string().optional().default('gpt-4o'),
  max_tokens: z.number().optional().default(1000)
});

const openaiController = {
  /**
   * Generate text using OpenAI
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateText(req, res) {
    try {
      // Validate request body
      const validationResult = generateTextSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request data',
          errors: validationResult.error.errors
        });
      }

      const options = validationResult.data;
      
      // Generate text
      const result = await OpenAI.generateText(options);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Generate text error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate text',
        error: error.message
      });
    }
  },

  /**
   * Generate JSON using OpenAI
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateJson(req, res) {
    try {
      // Validate request body
      const validationResult = generateJsonSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request data',
          errors: validationResult.error.errors
        });
      }

      const options = validationResult.data;
      
      // Generate JSON
      const result = await OpenAI.generateJSON(options);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Generate JSON error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate JSON',
        error: error.message
      });
    }
  },

  /**
   * Analyze an image using OpenAI
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async analyzeImage(req, res) {
    try {
      // Validate request body
      const validationResult = analyzeImageSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request data',
          errors: validationResult.error.errors
        });
      }

      const options = validationResult.data;
      
      // Analyze image
      const result = await OpenAI.analyzeImage(options);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Analyze image error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze image',
        error: error.message
      });
    }
  },

  /**
   * Test OpenAI connection
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async testConnection(req, res) {
    try {
      console.log("Testing OpenAI API connection...");
      
      // Generate a simple test response
      const result = await OpenAI.generateText({
        prompt: 'Say hello in one word.',
        max_tokens: 10,
        temperature: 0.2
      });
      
      console.log("OpenAI API test successful!");
      
      res.status(200).json({
        success: true,
        message: 'OpenAI API test successful',
        data: result.result
      });
    } catch (error) {
      console.error("OpenAI API test failed:", error);
      
      res.status(500).json({
        success: false,
        message: 'OpenAI API test failed',
        error: error.message
      });
    }
  }
};

module.exports = openaiController;