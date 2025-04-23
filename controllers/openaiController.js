/**
 * OpenAI Controller
 * 
 * Handles logic for OpenAI-related routes
 */

const openaiModel = require('../models/openai');
const logger = require('../config/logger');

/**
 * Generate text using OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function generateText(req, res) {
  try {
    const { prompt, model, max_tokens, temperature } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Prompt is required',
          code: 'MISSING_PARAMETER'
        }
      });
    }
    
    // Generate text with the OpenAI model
    const options = {
      model,
      max_tokens,
      temperature
    };
    
    const result = await openaiModel.generateText(prompt, options);
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    return res.json(result);
  } catch (error) {
    logger.error(`Error in generateText: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Failed to generate text',
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
    const { prompt, model, max_tokens, temperature } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Prompt is required',
          code: 'MISSING_PARAMETER'
        }
      });
    }
    
    // Generate JSON with the OpenAI model
    const options = {
      model,
      max_tokens,
      temperature
    };
    
    const result = await openaiModel.generateJSON(prompt, options);
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    return res.json(result);
  } catch (error) {
    logger.error(`Error in generateJSON: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Failed to generate JSON',
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
    const { imageUrl, prompt, model, max_tokens, temperature } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Image URL is required',
          code: 'MISSING_PARAMETER'
        }
      });
    }
    
    // Analyze the image with the OpenAI model
    const options = {
      model,
      max_tokens,
      temperature
    };
    
    const result = await openaiModel.analyzeImage(imageUrl, prompt, options);
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    return res.json(result);
  } catch (error) {
    logger.error(`Error in analyzeImage: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Failed to analyze image',
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
    const result = await openaiModel.testConnection();
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    return res.json(result);
  } catch (error) {
    logger.error(`Error in testConnection: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Failed to test OpenAI connection',
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