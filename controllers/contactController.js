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
    // Extract validated data (safe since it passed validation middleware)
    const { name, email, phone, subject, message, company } = req.body;
    
    // Get IP and user agent for tracking
    const ip_address = logger.anonymize(req.ip);
    const user_agent = req.get('user-agent') || 'unknown';
    
    // Log contact submission attempt
    logger.info('Contact form submission received', {
      email,
      subject,
      ip: ip_address
    });
    
    // Store in database
    const result = await db.query(
      `INSERT INTO contacts 
        (name, email, phone, subject, message, company_name, ip_address, user_agent) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, created_at`,
      [name, email, phone || null, subject, message, company || null, ip_address, user_agent]
    );
    
    // Check if insertion was successful
    if (!result.rows || result.rows.length === 0) {
      return next(createError('Failed to save contact submission', 500, 'CONTACT_SAVE_ERROR'));
    }
    
    // Log success
    logger.info('Contact form submission saved', {
      id: result.rows[0].id,
      email,
      createdAt: result.rows[0].created_at
    });
    
    // Return success response
    res.status(201).json({
      success: true,
      data: {
        id: result.rows[0].id,
        message: 'Contact form submitted successfully',
        timestamp: result.rows[0].created_at
      }
    });
  } catch (error) {
    // Log error details
    logger.error('Contact form submission error', {
      error: error.message,
      stack: error.stack
    });
    
    // Forward to error handler
    next(createError('Error processing contact form', 500, 'CONTACT_SUBMISSION_ERROR'));
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
    // Extract pagination parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Query to get paginated results
    const result = await db.query(
      `SELECT id, name, email, phone, subject, 
        LEFT(message, 100) as message_preview, 
        company_name, created_at 
       FROM contacts 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    // Get total count for pagination
    const countResult = await db.query('SELECT COUNT(*) FROM contacts');
    const totalCount = parseInt(countResult.rows[0].count);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    
    // Return response
    res.json({
      success: true,
      data: {
        contacts: result.rows,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: totalPages,
          hasMore: page < totalPages
        }
      }
    });
  } catch (error) {
    // Log error details
    logger.error('Error fetching contacts', {
      error: error.message,
      stack: error.stack
    });
    
    // Forward to error handler
    next(createError('Error retrieving contact submissions', 500, 'CONTACT_FETCH_ERROR'));
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
    
    // Query to get contact details
    const result = await db.query(
      'SELECT * FROM contacts WHERE id = $1',
      [id]
    );
    
    // Check if contact exists
    if (!result.rows || result.rows.length === 0) {
      return next(createError('Contact not found', 404, 'CONTACT_NOT_FOUND'));
    }
    
    // Return contact details
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    // Log error details
    logger.error('Error fetching contact details', {
      error: error.message,
      stack: error.stack,
      contactId: req.params.id
    });
    
    // Forward to error handler
    next(createError('Error retrieving contact details', 500, 'CONTACT_DETAIL_ERROR'));
  }
}

module.exports = {
  submitContact,
  getContacts,
  getContactById
};