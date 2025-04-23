/**
 * OpenAI Controller
 * 
 * Handles OpenAI-related API requests
 */

const OpenAIModel = require('../models/openai');
const { validationResult } = require('express-validator');

/**
 * Generate text using OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateText = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { prompt, model, max_tokens, temperature } = req.body;
    
    // Generate text
    const result = await OpenAIModel.generateText({
      prompt,
      model,
      max_tokens,
      temperature
    });
    
    // Log usage
    console.info('OpenAI text generation:', {
      prompt: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
      model: result.model,
      tokens: result.usage?.total_tokens || 'unknown'
    });
    
    // Return result
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in openaiController.generateText:', error);
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
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { prompt, model, max_tokens, temperature } = req.body;
    
    // Generate JSON
    const result = await OpenAIModel.generateJSON({
      prompt,
      model,
      max_tokens,
      temperature
    });
    
    // Log usage
    console.info('OpenAI JSON generation:', {
      prompt: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
      model: result.model,
      tokens: result.usage?.total_tokens || 'unknown'
    });
    
    // Return result
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in openaiController.generateJSON:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate JSON',
      error: error.message
    });
  }
};

/**
 * Analyze image using OpenAI Vision API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const analyzeImage = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { image, prompt, model, max_tokens } = req.body;
    
    // Ensure image is provided
    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image data is required'
      });
    }
    
    // Analyze image
    const result = await OpenAIModel.analyzeImage({
      image,
      prompt,
      model,
      max_tokens
    });
    
    // Log usage
    console.info('OpenAI image analysis:', {
      model: result.model,
      tokens: result.usage?.total_tokens || 'unknown'
    });
    
    // Return result
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in openaiController.analyzeImage:', error);
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
    const result = await OpenAIModel.testConnection();
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in openaiController.testConnection:', error);
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