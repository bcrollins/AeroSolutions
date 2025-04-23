/**
 * Contact Controller
 * 
 * Handles logic for contact-related routes
 */

const Contact = require('../models/contact');

const contactController = {
  /**
   * Submit a contact form
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async submitContact(req, res) {
    try {
      const { name, email, subject, message } = req.body;

      // Validate required fields
      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Create contact submission
      const contact = await Contact.create({
        name,
        email,
        subject: subject || 'General Inquiry',
        message
      });

      res.status(201).json({
        success: true,
        message: 'Contact form submitted successfully',
        contact
      });
    } catch (error) {
      console.error('Contact submission error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit contact form',
        error: error.message
      });
    }
  },

  /**
   * Get all contact submissions (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllContacts(req, res) {
    try {
      // Extract query parameters
      const { limit, offset, status } = req.query;
      const options = {};
      
      // Convert limit and offset to numbers if provided
      if (limit) options.limit = parseInt(limit);
      if (offset) options.offset = parseInt(offset);
      if (status) options.status = status;

      // Get contact submissions
      const contacts = await Contact.getAll(options);
      const counts = await Contact.getCounts();

      res.status(200).json({
        success: true,
        contacts,
        meta: {
          ...counts,
          limit: options.limit || 50,
          offset: options.offset || 0
        }
      });
    } catch (error) {
      console.error('Get contacts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get contacts',
        error: error.message
      });
    }
  },

  /**
   * Get a single contact submission by ID (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getContactById(req, res) {
    try {
      const contactId = parseInt(req.params.id);
      
      // Validate ID
      if (isNaN(contactId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid contact ID'
        });
      }

      // Get contact
      const contact = await Contact.getById(contactId);
      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }

      res.status(200).json({
        success: true,
        contact
      });
    } catch (error) {
      console.error('Get contact error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get contact',
        error: error.message
      });
    }
  },

  /**
   * Update a contact submission's status (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateContactStatus(req, res) {
    try {
      const contactId = parseInt(req.params.id);
      const { status } = req.body;
      
      // Validate inputs
      if (isNaN(contactId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid contact ID'
        });
      }

      if (!status || !['pending', 'in-progress', 'resolved', 'closed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: pending, in-progress, resolved, closed'
        });
      }

      // Update status
      const updatedContact = await Contact.updateStatus(contactId, status);
      if (!updatedContact) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Contact status updated successfully',
        contact: updatedContact
      });
    } catch (error) {
      console.error('Update contact status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update contact status',
        error: error.message
      });
    }
  },

  /**
   * Delete a contact submission (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteContact(req, res) {
    try {
      const contactId = parseInt(req.params.id);
      
      // Validate ID
      if (isNaN(contactId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid contact ID'
        });
      }

      // Delete contact
      const deleted = await Contact.delete(contactId);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Contact deleted successfully'
      });
    } catch (error) {
      console.error('Delete contact error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete contact',
        error: error.message
      });
    }
  }
};

module.exports = contactController;