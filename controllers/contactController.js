/**
 * Contact Controller
 * 
 * Handles logic for contact-related routes
 */

const ContactModel = require('../models/contact');
const { validationResult } = require('express-validator');

/**
 * Submit a contact form
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function submitContact(req, res) {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { name, email, subject, message } = req.body;
    
    // Submit contact form
    const result = await ContactModel.submit({
      name,
      email,
      subject,
      message
    });
    
    // Log submission
    console.info('Contact form submitted:', {
      name,
      email,
      subject: subject || '(No subject)',
      date: new Date().toISOString()
    });
    
    return res.status(201).json({
      success: true,
      data: result,
      message: 'Contact form submitted successfully'
    });
  } catch (error) {
    console.error('Error in contactController.submitContact:', error);
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
    // Check if user is admin (middleware should handle this)
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    // Parse query parameters
    const options = {
      limit: req.query.limit ? parseInt(req.query.limit) : 100,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
      status: req.query.status,
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'DESC'
    };
    
    // Get contact submissions
    const contacts = await ContactModel.findAll(options);
    
    // Get counts by status
    const counts = await ContactModel.getCounts();
    
    return res.status(200).json({
      success: true,
      data: contacts,
      count: contacts.length,
      counts,
      pagination: {
        limit: options.limit,
        offset: options.offset
      }
    });
  } catch (error) {
    console.error('Error in contactController.getAllContacts:', error);
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
    // Check if user is admin (middleware should handle this)
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    const { id } = req.params;
    
    // Get contact submission
    const contact = await ContactModel.findById(parseInt(id));
    
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
    console.error('Error in contactController.getContactById:', error);
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
    // Check if user is admin (middleware should handle this)
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['new', 'in_progress', 'completed', 'spam'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
        validValues: validStatuses
      });
    }
    
    // Update contact status
    const contact = await ContactModel.updateStatus(parseInt(id), status);
    
    return res.status(200).json({
      success: true,
      data: contact,
      message: 'Contact status updated successfully'
    });
  } catch (error) {
    console.error('Error in contactController.updateContactStatus:', error);
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
    // Check if user is admin (middleware should handle this)
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    const { id } = req.params;
    
    // Delete contact submission
    const success = await ContactModel.remove(parseInt(id));
    
    if (!success) {
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
    console.error('Error in contactController.deleteContact:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete contact submission',
      error: error.message
    });
  }
}

module.exports = {
  submitContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact
};