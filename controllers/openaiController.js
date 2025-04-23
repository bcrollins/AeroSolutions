/**
 * OpenAI Controller
 * 
 * Controller functions for handling OpenAI-related API endpoints
 */

const { validationResult } = require('express-validator');
const openaiService = require('../server/openai').default;

/**
 * Controller for text completion generation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateCompletion = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { prompt, model, maxTokens, temperature } = req.body;
    
    // Call OpenAI API
    const completion = await openaiService.generateCompletion(
      prompt,
      {
        model,
        maxTokens,
        temperature,
        userId: req.user?.id
      }
    );
    
    // Return response
    return res.json({
      success: true,
      data: {
        text: completion.choices[0].message.content,
        model: completion.model,
        usage: completion.usage
      }
    });
  } catch (error) {
    console.error('Error generating completion:', error);
    
    // Handle different error types
    if (error.response) {
      // OpenAI API error
      return res.status(error.response.status).json({
        success: false,
        error: {
          message: error.response.data.error.message,
          type: error.response.data.error.type,
          code: error.response.data.error.code
        }
      });
    } else {
      // Server error
      return res.status(500).json({
        success: false,
        error: {
          message: 'An unexpected error occurred',
          detail: error.message
        }
      });
    }
  }
};

/**
 * Controller for image generation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateImage = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { prompt, size } = req.body;
    
    // Call OpenAI API
    const response = await openaiService.generateImage(
      prompt,
      {
        size,
        userId: req.user?.id
      }
    );
    
    // Return response
    return res.json({
      success: true,
      data: {
        url: response.data[0].url,
        model: 'dall-e-3'
      }
    });
  } catch (error) {
    console.error('Error generating image:', error);
    
    // Handle different error types
    if (error.response) {
      // OpenAI API error
      return res.status(error.response.status).json({
        success: false,
        error: {
          message: error.response.data.error.message,
          type: error.response.data.error.type,
          code: error.response.data.error.code
        }
      });
    } else {
      // Server error
      return res.status(500).json({
        success: false,
        error: {
          message: 'An unexpected error occurred',
          detail: error.message
        }
      });
    }
  }
};

/**
 * Controller for sentiment analysis
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.analyzeSentiment = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { text } = req.body;
    
    // Call OpenAI API
    const sentiment = await openaiService.analyzeSentiment(text);
    
    // Return response
    return res.json({
      success: true,
      data: sentiment
    });
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'An unexpected error occurred',
        detail: error.message
      }
    });
  }
};

/**
 * Controller for text summarization
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateSummary = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { text } = req.body;
    
    // Call OpenAI API
    const summary = await openaiService.generateSummary(text);
    
    // Return response
    return res.json({
      success: true,
      data: {
        summary
      }
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'An unexpected error occurred',
        detail: error.message
      }
    });
  }
};