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
    // Extract validated data from the request body
    const { name, email, phone = null, subject, message, companyName = null } = req.body;
    
    // Additional metadata from the request
    const ip = req.ip || null;
    const userAgent = req.headers['user-agent'] || null;
    
    // Insert into database
    const result = await db.query(
      `INSERT INTO contacts 
        (name, email, phone, subject, message, company_name, ip_address, user_agent, created_at) 
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) 
       RETURNING id, created_at`,
      [name, email, phone, subject, message, companyName, ip, userAgent]
    );
    
    // Get the inserted contact details
    const contact = result.rows[0];
    
    // Format timestamp for response
    const timestamp = contact.created_at.toISOString();
    
    // Log success
    logger.info('Contact form submitted', {
      contactId: contact.id,
      name,
      email,
      subject,
      ip
    });
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        id: contact.id,
        timestamp
      }
    });
  } catch (error) {
    // Log error
    logger.error('Contact form submission failed', {
      error: error.message,
      stack: error.stack
    });
    
    // Handle database errors
    if (error.code === '23505') {
      // Duplicate key violation
      return next(createError(
        'A recent identical submission was detected. Please wait before submitting again.',
        409,
        'DUPLICATE_SUBMISSION'
      ));
    }
    
    // Handle other errors
    next(createError(
      `Contact form submission error: ${error.message}`,
      500,
      'CONTACT_SUBMISSION_ERROR'
    ));
  }
}

module.exports = {
  submitContact
};