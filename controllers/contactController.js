/**
 * Contact Controller
 * 
 * Handles logic for contact-related routes
 */

const contactModel = require('../models/contact');
const logger = require('../config/logger');

/**
 * Submit a contact form
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function submitContact(req, res) {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields',
          code: 'MISSING_FIELDS'
        }
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid email format',
          code: 'INVALID_EMAIL'
        }
      });
    }
    
    // Create contact submission
    const result = await contactModel.createContact({
      name,
      email,
      subject,
      message
    });
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    return res.status(201).json(result);
  } catch (error) {
    logger.error(`Error in submitContact: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Failed to submit contact form',
        details: error.message
      }
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
    const status = req.query.status || null;
    const result = await contactModel.getAllContacts(status);
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    return res.json(result);
  } catch (error) {
    logger.error(`Error in getAllContacts: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get contact submissions',
        details: error.message
      }
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
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid contact ID',
          code: 'INVALID_ID'
        }
      });
    }
    
    const result = await contactModel.getContactById(parseInt(id));
    
    if (!result.success) {
      if (result.error && result.error.message === 'Contact not found') {
        return res.status(404).json(result);
      }
      return res.status(500).json(result);
    }
    
    return res.json(result);
  } catch (error) {
    logger.error(`Error in getContactById: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get contact submission',
        details: error.message
      }
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
    const { status, notes } = req.body;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid contact ID',
          code: 'INVALID_ID'
        }
      });
    }
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Status is required',
          code: 'MISSING_STATUS'
        }
      });
    }
    
    // Validate status
    const validStatuses = ['new', 'in_progress', 'completed', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid status value',
          code: 'INVALID_STATUS',
          validValues: validStatuses
        }
      });
    }
    
    const result = await contactModel.updateContactStatus(parseInt(id), status, notes);
    
    if (!result.success) {
      if (result.error && result.error.message === 'Contact not found') {
        return res.status(404).json(result);
      }
      return res.status(500).json(result);
    }
    
    return res.json(result);
  } catch (error) {
    logger.error(`Error in updateContactStatus: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update contact status',
        details: error.message
      }
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
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid contact ID',
          code: 'INVALID_ID'
        }
      });
    }
    
    const result = await contactModel.deleteContact(parseInt(id));
    
    if (!result.success) {
      if (result.error && result.error.message === 'Contact not found') {
        return res.status(404).json(result);
      }
      return res.status(500).json(result);
    }
    
    return res.json(result);
  } catch (error) {
    logger.error(`Error in deleteContact: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete contact submission',
        details: error.message
      }
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
    const result = await contactModel.getContactCounts();
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    return res.json(result);
  } catch (error) {
    logger.error(`Error in getContactCounts: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get contact counts',
        details: error.message
      }
    });
  }
}

module.exports = {
  submitContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactCounts
};