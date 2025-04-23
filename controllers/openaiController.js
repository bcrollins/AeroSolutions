/**
 * OpenAI Controller
 * 
 * Handles logic for OpenAI-related routes
 */

const { body } = require('express-validator');
const OpenAIModel = require('../models/openai');
const logger = require('../config/logger');
const { handleValidationErrors } = require('../middlewares/validator');

// Validation rules for text generation
const textGenerationRules = [
  body('prompt')
    .notEmpty().withMessage('Prompt is required')
    .isString().withMessage('Prompt must be a string')
    .isLength({ min: 3, max: 4000 }).withMessage('Prompt must be between 3 and 4000 characters'),
  
  body('model')
    .optional()
    .isString().withMessage('Model must be a string'),
  
  body('max_tokens')
    .optional()
    .isInt({ min: 1, max: 4000 }).withMessage('Max tokens must be between 1 and 4000'),
  
  body('temperature')
    .optional()
    .isFloat({ min: 0, max: 2 }).withMessage('Temperature must be between 0 and 2'),
  
  // Apply validation
  handleValidationErrors
];

/**
 * Generate text using OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function generateText(req, res) {
  try {
    const { prompt, model, max_tokens, temperature } = req.body;
    
    // Log request
    logger.info('OpenAI text generation request', { 
      prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
      model, 
      max_tokens, 
      temperature 
    });
    
    // Generate text
    const response = await OpenAIModel.generateText({
      prompt,
      model,
      max_tokens,
      temperature
    });
    
    // Extract response content
    const content = response.choices[0]?.message?.content || '';
    
    // Log success
    logger.info('OpenAI text generation successful', {
      model: response.model,
      tokens: response.usage?.total_tokens || 0
    });
    
    return res.status(200).json({
      success: true,
      data: {
        text: content,
        model: response.model,
        usage: response.usage
      }
    });
  } catch (error) {
    logger.error('Error in openaiController.generateText:', error);
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
    const { prompt, model, max_tokens, temperature } = req.body;
    
    // Log request
    logger.info('OpenAI JSON generation request', { 
      prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
      model, 
      max_tokens, 
      temperature 
    });
    
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
      logger.error('Error parsing JSON response:', parseError, { rawContent: content });
      return res.status(500).json({
        success: false,
        message: 'Failed to parse JSON response',
        error: parseError.message,
        rawContent: content
      });
    }
    
    // Log success
    logger.info('OpenAI JSON generation successful', {
      model: response.model,
      tokens: response.usage?.total_tokens || 0
    });
    
    return res.status(200).json({
      success: true,
      data: {
        json: jsonData,
        model: response.model,
        usage: response.usage
      }
    });
  } catch (error) {
    logger.error('Error in openaiController.generateJSON:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate JSON',
      error: error.message
    });
  }
}

// Validation rules for JSON generation
const jsonGenerationRules = [
  body('prompt')
    .notEmpty().withMessage('Prompt is required')
    .isString().withMessage('Prompt must be a string')
    .isLength({ min: 3, max: 4000 }).withMessage('Prompt must be between 3 and 4000 characters'),
  
  body('model')
    .optional()
    .isString().withMessage('Model must be a string'),
  
  body('max_tokens')
    .optional()
    .isInt({ min: 1, max: 4000 }).withMessage('Max tokens must be between 1 and 4000'),
  
  body('temperature')
    .optional()
    .isFloat({ min: 0, max: 2 }).withMessage('Temperature must be between 0 and 2'),
  
  // Apply validation
  handleValidationErrors
];

// Validation rules for image analysis
const imageAnalysisRules = [
  body('image')
    .notEmpty().withMessage('Image data is required')
    .isString().withMessage('Image must be provided as a base64 string'),
  
  body('prompt')
    .optional()
    .isString().withMessage('Prompt must be a string'),
  
  body('model')
    .optional()
    .isString().withMessage('Model must be a string'),
  
  body('max_tokens')
    .optional()
    .isInt({ min: 1, max: 4000 }).withMessage('Max tokens must be between 1 and 4000'),
  
  // Apply validation
  handleValidationErrors
];

/**
 * Analyze image using OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function analyzeImage(req, res) {
  try {
    const { image, prompt, model, max_tokens } = req.body;
    
    // Log request (omit image data for size reasons)
    logger.info('OpenAI image analysis request', { 
      promptLength: prompt?.length || 0,
      imageDataLength: image?.length || 0,
      model, 
      max_tokens
    });
    
    // Analyze image
    const response = await OpenAIModel.analyzeImage({
      image,
      prompt,
      model,
      max_tokens
    });
    
    // Extract response content
    const content = response.choices[0]?.message?.content || '';
    
    // Log success
    logger.info('OpenAI image analysis successful', {
      model: response.model,
      analysisLength: content.length,
      tokens: response.usage?.total_tokens || 0
    });
    
    return res.status(200).json({
      success: true,
      data: {
        analysis: content,
        model: response.model,
        usage: response.usage
      }
    });
  } catch (error) {
    logger.error('Error in openaiController.analyzeImage:', error);
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
    logger.info('Testing OpenAI API connection');
    
    const result = await OpenAIModel.testConnection();
    
    logger.info('OpenAI API connection test successful', result);
    
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Error in openaiController.testConnection:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to test OpenAI connection',
      error: error.message
    });
  }
}

module.exports = {
  textGenerationRules,
  jsonGenerationRules,
  imageAnalysisRules,
  generateText,
  generateJSON,
  analyzeImage,
  testConnection
};