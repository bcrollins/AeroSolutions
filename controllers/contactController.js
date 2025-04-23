/**
 * Contact Form Controller
 * 
 * This controller handles contact form submissions.
 * It provides a method to process and store contact requests.
 */

const db = require('../config/database');
const logger = require('../config/logger');
const { createError } = require('../middlewares/errorHandler');

/**
 * Submit a contact form
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function submitContact(req, res, next) {
  try {
    // Data has already been validated by the validator middleware
    const { name, email, phone, subject, message, company } = req.body;
    
    // Capture additional information for security/analytics
    const ipAddress = logger.anonymize(req.ip);
    const userAgent = req.get('user-agent');
    
    // Insert into database
    const result = await db.query(
      `INSERT INTO contacts 
       (name, email, phone, subject, message, company_name, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, created_at`,
      [name, email, phone, subject, message, company, ipAddress, userAgent]
    );
    
    // Log successful submission (excluding personal data)
    logger.info('Contact form submitted', {
      id: result.rows[0].id,
      subject
    });
    
    // Send success response
    res.status(201).json({
      success: true,
      data: {
        id: result.rows[0].id,
        timestamp: result.rows[0].created_at
      },
      message: 'Contact form submitted successfully'
    });
  } catch (err) {
    // Log error
    logger.error('Contact form submission error', {
      error: err.message,
      stack: err.stack
    });
    
    // Send error response
    next(createError('Failed to submit contact form', 500, 'CONTACT_SUBMISSION_ERROR'));
  }
}

/**
 * Get all contact submissions (for admin purposes)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getContacts(req, res, next) {
  try {
    // Simple pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50 per page
    const offset = (page - 1) * limit;
    
    // Get contacts
    const result = await db.query(
      `SELECT id, name, email, subject, created_at
       FROM contacts
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    // Get total count for pagination
    const countResult = await db.query('SELECT COUNT(*) FROM contacts');
    const totalCount = parseInt(countResult.rows[0].count);
    
    // Send response
    res.json({
      success: true,
      data: {
        contacts: result.rows,
        pagination: {
          page,
          limit,
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (err) {
    // Send error response
    next(createError('Failed to retrieve contacts', 500, 'CONTACTS_RETRIEVAL_ERROR'));
  }
}

/**
 * Get details of a specific contact submission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getContactById(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return next(createError('Invalid contact ID', 400, 'INVALID_CONTACT_ID'));
    }
    
    // Get contact details
    const result = await db.query(
      `SELECT * FROM contacts WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return next(createError('Contact not found', 404, 'CONTACT_NOT_FOUND'));
    }
    
    // Send response
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    // Send error response
    next(createError('Failed to retrieve contact details', 500, 'CONTACT_RETRIEVAL_ERROR'));
  }
}

module.exports = {
  submitContact,
  getContacts,
  getContactById
};