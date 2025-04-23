/**
 * Contact Form Controller
 * 
 * This controller handles contact form submissions.
 * It provides a method to process and store contact requests.
 */

const logger = require('../config/logger');
const db = require('../config/database');
const { createError } = require('../middlewares/errorHandler');

/**
 * Submit a contact form
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function submitContact(req, res, next) {
  try {
    // Extract form data from request body
    const { name, email, phone, subject, message, companyName } = req.body;
    
    // Log the contact request
    logger.info('Contact form submission received', {
      name,
      email,
      subject,
      ipAddress: req.ip,
      hasCompany: !!companyName
    });
    
    // Structure data for database storage
    const contactData = {
      name,
      email,
      phone: phone || null,
      subject,
      message,
      company_name: companyName || null,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      created_at: new Date()
    };
    
    // Save to database if available
    let contactId = null;
    try {
      // Insert into database
      const result = await db.query(
        `INSERT INTO contacts 
         (name, email, phone, subject, message, company_name, ip_address, user_agent, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          contactData.name,
          contactData.email,
          contactData.phone,
          contactData.subject,
          contactData.message,
          contactData.company_name,
          contactData.ip_address,
          contactData.user_agent,
          contactData.created_at
        ]
      );
      
      contactId = result.rows[0].id;
      logger.info('Contact form saved to database', { id: contactId });
    } catch (dbError) {
      // Log the error but continue - we'll handle this as a non-fatal error
      logger.error('Failed to save contact form to database', {
        error: dbError.message,
        stack: dbError.stack
      });
      
      // If the error is due to missing table, log a more helpful message
      if (dbError.message.includes('relation "contacts" does not exist')) {
        logger.warn('Contacts table does not exist. Please run the database migrations.');
      }
    }
    
    // Return success response with or without a contactId
    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        id: contactId,
        timestamp: contactData.created_at.toISOString()
      }
    });
  } catch (error) {
    logger.error('Error processing contact form', {
      error: error.message,
      stack: error.stack
    });
    
    next(createError(
      `Error processing contact form: ${error.message}`,
      500,
      'CONTACT_SUBMISSION_ERROR'
    ));
  }
}

module.exports = {
  submitContact
};