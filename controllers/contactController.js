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
    // Extract validated data from request body
    const { name, email, phone, subject, message, company } = req.body;
    
    // Client information
    const ipAddress = logger.anonymize(req.ip); // Anonymized for privacy
    const userAgent = req.get('user-agent') || 'unknown';
    
    // Insert into database
    const result = await db.query(
      `INSERT INTO contacts (name, email, phone, subject, message, company_name, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, created_at`,
      [name, email, phone || null, subject, message, company || null, ipAddress, userAgent]
    );
    
    // Log the successful submission
    logger.info('Contact form submitted', {
      id: result.rows[0].id,
      email,
      subject
    });
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        id: result.rows[0].id,
        createdAt: result.rows[0].created_at
      }
    });
  } catch (error) {
    // Log database errors
    logger.error('Contact form submission error', {
      error: error.message,
      stack: error.stack
    });
    
    // Pass error to error handler middleware
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
    // Query to get all contacts, ordered by most recent first
    const result = await db.query(
      `SELECT id, name, email, phone, subject, message, company_name, created_at
       FROM contacts
       ORDER BY created_at DESC`
    );
    
    // Return the contacts
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    // Log database errors
    logger.error('Error fetching contact submissions', {
      error: error.message,
      stack: error.stack
    });
    
    // Pass error to error handler middleware
    next(createError('Failed to fetch contact submissions', 500, 'CONTACT_FETCH_ERROR'));
  }
}

module.exports = {
  submitContact,
  getContacts
};