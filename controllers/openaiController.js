/**
 * OpenAI Controller
 * 
 * Handles logic for OpenAI-related routes
 */

const OpenAIModel = require('../models/openai');
const { validationResult } = require('express-validator');

/**
 * Generate text using OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function generateText(req, res) {
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
    const response = await OpenAIModel.generateText({
      prompt,
      model,
      max_tokens,
      temperature
    });
    
    // Extract response content
    const content = response.choices[0]?.message?.content || '';
    
    return res.status(200).json({
      success: true,
      data: {
        text: content,
        model: response.model,
        usage: response.usage
      }
    });
  } catch (error) {
    console.error('Error in openaiController.generateText:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate text',
      error: error.message
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
    const response = await OpenAIModel.generateJSON({
      prompt,
      model,
      max_tokens,
      temperature
    });
    
    // Extract and parse JSON content
    const content = response.choices[0]?.message?.content || '{}';
    let jsonData;
    
    try {
      jsonData = JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      return res.status(500).json({
        success: false,
        message: 'Failed to parse JSON response',
        error: parseError.message,
        rawContent: content
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        json: jsonData,
        model: response.model,
        usage: response.usage
      }
    });
  } catch (error) {
    console.error('Error in openaiController.generateJSON:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate JSON',
      error: error.message
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
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { image, prompt, model, max_tokens } = req.body;
    
    // Analyze image
    const response = await OpenAIModel.analyzeImage({
      image,
      prompt,
      model,
      max_tokens
    });
    
    // Extract response content
    const content = response.choices[0]?.message?.content || '';
    
    return res.status(200).json({
      success: true,
      data: {
        analysis: content,
        model: response.model,
        usage: response.usage
      }
    });
  } catch (error) {
    console.error('Error in openaiController.analyzeImage:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze image',
      error: error.message
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
    const result = await OpenAIModel.testConnection();
    
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error in openaiController.testConnection:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to test OpenAI connection',
      error: error.message
    });
  }
}

module.exports = {
  generateText,
  generateJSON,
  analyzeImage,
  testConnection
};