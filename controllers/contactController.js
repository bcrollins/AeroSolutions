/**
 * Contact Controller
 * 
 * Handles logic for contact-related routes
 */

const { body } = require('express-validator');
const contactModel = require('../models/contact');
const logger = require('../config/logger');
const { handleValidationErrors } = require('../middlewares/validator');

// Validation rules for contact submission
const contactValidationRules = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('subject')
    .notEmpty().withMessage('Subject is required')
    .isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5 and 200 characters'),
  
  body('message')
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10 }).withMessage('Message must be at least 10 characters long'),
  
  // Apply validation
  handleValidationErrors
];

/**
 * Submit a contact form
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function submitContact(req, res) {
  try {
    const { name, email, subject, message } = req.body;
    
    // Log contact submission
    logger.info(`Contact form submission from ${name} (${email}): ${subject}`);
    
    // Submit contact form
    const contact = await contactModel.submit({
      name,
      email,
      subject,
      message
    });
    
    return res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: contact
    });
  } catch (error) {
    logger.error('Error in contactController.submitContact:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit contact form',
      error: error.message
    });
  }
}

/**
 * Get all contact submissions (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllContacts(req, res) {
  try {
    const { 
      limit = 100, 
      offset = 0, 
      status, 
      sortBy = 'created_at', 
      sortOrder = 'DESC' 
    } = req.query;
    
    logger.info('Fetching all contact submissions', { limit, offset, status, sortBy, sortOrder });
    
    const contacts = await contactModel.findAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      status,
      sortBy,
      sortOrder
    });
    
    return res.status(200).json({
      success: true,
      data: contacts,
      count: contacts.length
    });
  } catch (error) {
    logger.error('Error in contactController.getAllContacts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve contact submissions',
      error: error.message
    });
  }
}

/**
 * Get a single contact submission by ID (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getContactById(req, res) {
  try {
    const { id } = req.params;
    
    logger.info(`Fetching contact submission with ID ${id}`);
    
    const contact = await contactModel.findById(parseInt(id));
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    logger.error('Error in contactController.getContactById:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve contact submission',
      error: error.message
    });
  }
}

/**
 * Update a contact submission's status (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateContactStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['new', 'in_progress', 'completed', 'spam'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    logger.info(`Updating contact submission ${id} status to ${status}`);
    
    const contact = await contactModel.updateStatus(parseInt(id), status);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Contact status updated successfully',
      data: contact
    });
  } catch (error) {
    logger.error('Error in contactController.updateContactStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update contact status',
      error: error.message
    });
  }
}

/**
 * Delete a contact submission (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteContact(req, res) {
  try {
    const { id } = req.params;
    
    logger.info(`Deleting contact submission with ID ${id}`);
    
    const deleted = await contactModel.remove(parseInt(id));
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Contact submission deleted successfully'
    });
  } catch (error) {
    logger.error('Error in contactController.deleteContact:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete contact submission',
      error: error.message
    });
  }
}

/**
 * Get contact submission counts by status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getContactCounts(req, res) {
  try {
    logger.info('Fetching contact submission counts by status');
    
    const counts = await contactModel.getCounts();
    
    return res.status(200).json({
      success: true,
      data: counts
    });
  } catch (error) {
    logger.error('Error in contactController.getContactCounts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve contact counts',
      error: error.message
    });
  }
}

module.exports = {
  contactValidationRules,
  submitContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactCounts
};