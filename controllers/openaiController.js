/**
 * OpenAI Controller
 * 
 * Handles API routes for OpenAI interactions
 */

const openaiService = require('../models/openai');

/**
 * Generate text using OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateText = async (req, res) => {
  try {
    const { prompt, model, max_tokens, temperature } = req.body;
    
    // Basic validation
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }
    
    const result = await openaiService.generateText({
      prompt,
      model,
      max_tokens,
      temperature
    });
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in generateText controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate text',
      error: error.message
    });
  }
};

/**
 * Generate JSON using OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateJSON = async (req, res) => {
  try {
    const { prompt, model, max_tokens, temperature } = req.body;
    
    // Basic validation
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }
    
    const result = await openaiService.generateJSON({
      prompt,
      model,
      max_tokens,
      temperature
    });
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in generateJSON controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate JSON',
      error: error.message
    });
  }
};

/**
 * Analyze an image using OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const analyzeImage = async (req, res) => {
  try {
    const { image, prompt, model, max_tokens } = req.body;
    
    // Basic validation
    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image data is required'
      });
    }
    
    const result = await openaiService.analyzeImage({
      image,
      prompt,
      model,
      max_tokens
    });
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in analyzeImage controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze image',
      error: error.message
    });
  }
};

/**
 * Test OpenAI API connection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const testConnection = async (req, res) => {
  try {
    const result = await openaiService.testConnection();
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in testConnection controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to test OpenAI connection',
      error: error.message
    });
  }
};

module.exports = {
  generateText,
  generateJSON,
  analyzeImage,
  testConnection
};