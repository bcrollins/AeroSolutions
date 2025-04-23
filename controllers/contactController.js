/**
 * Contact Controller
 * 
 * This controller handles all operations related to contact form submissions,
 * including submission, retrieval, status updates, and management.
 */

const db = require('../config/database');
const logger = require('../config/logger');
const { createError } = require('../middlewares/errorHandler');

/**
 * Submit a new contact form
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function submitContact(req, res, next) {
  try {
    const { name, email, phone, subject, message, companyName } = req.body;
    
    logger.debug('Processing contact form submission', { 
      email, 
      subject,
      ip: req.ip
    });
    
    // Store client information for tracking/analytics
    const clientInfo = {
      ip_address: req.ip,
      user_agent: req.headers['user-agent'] || 'Unknown'
    };
    
    // Insert into database
    const query = `
      INSERT INTO contact_submissions (
        name, 
        email, 
        phone, 
        subject, 
        message, 
        company_name, 
        status,
        ip_address,
        user_agent
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, created_at
    `;
    
    const values = [
      name,
      email,
      phone || null,
      subject,
      message,
      companyName || null,
      'pending', // Default status
      clientInfo.ip_address,
      clientInfo.user_agent
    ];
    
    const result = await db.query(query, values);
    const submission = result.rows[0];
    
    logger.info('Contact form submitted successfully', {
      id: submission.id,
      email,
      subject
    });
    
    // Send email notification if needed (commented out for now)
    /*
    try {
      await sendNotificationEmail({
        to: process.env.NOTIFICATION_EMAIL,
        subject: `New Contact Form: ${subject}`,
        content: `New contact form from ${name} (${email}): ${message}`
      });
    } catch (emailError) {
      logger.error('Failed to send notification email', {
        error: emailError.message,
        stack: emailError.stack
      });
      // Don't fail the request if email fails
    }
    */
    
    res.status(201).json({
      success: true,
      data: {
        id: submission.id,
        timestamp: submission.created_at
      },
      message: 'Contact form submitted successfully'
    });
  } catch (error) {
    logger.error('Failed to submit contact form', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    
    next(createError(
      'Failed to submit contact form: ' + error.message,
      500,
      'CONTACT_SUBMISSION_ERROR'
    ));
  }
}

/**
 * Get all contact submissions with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getAllContacts(req, res, next) {
  try {
    // Extract query parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    // Validate sortBy to prevent SQL injection
    const allowedSortFields = [
      'id', 'name', 'email', 'subject', 'status', 'created_at', 'updated_at'
    ];
    
    if (!allowedSortFields.includes(sortBy)) {
      return next(createError(
        `Invalid sort field: ${sortBy}. Allowed fields: ${allowedSortFields.join(', ')}`,
        400,
        'INVALID_SORT_FIELD'
      ));
    }
    
    logger.debug('Getting contact submissions', { page, limit, status, sortBy, sortOrder });
    
    // Build the query
    let query = `
      SELECT 
        id, name, email, phone, subject, message, company_name, status, created_at, updated_at
      FROM 
        contact_submissions
    `;
    
    const queryParams = [];
    let whereClause = '';
    
    // Add status filter if provided
    if (status) {
      whereClause = ' WHERE status = $1';
      queryParams.push(status);
    }
    
    // Add where clause if needed
    query += whereClause;
    
    // Add sorting
    query += ` ORDER BY ${sortBy} ${sortOrder}`;
    
    // Add pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    // Execute the query
    const result = await db.query(query, queryParams);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total FROM contact_submissions${whereClause}
    `;
    const countResult = await db.query(countQuery, status ? [status] : []);
    const total = parseInt(countResult.rows[0].total);
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    
    logger.info('Retrieved contact submissions', {
      count: result.rows.length,
      total,
      page,
      totalPages
    });
    
    res.json({
      success: true,
      data: {
        contacts: result.rows,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage,
          hasPreviousPage
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get contact submissions', {
      error: error.message,
      stack: error.stack,
      query: req.query
    });
    
    next(createError(
      'Failed to get contact submissions: ' + error.message,
      500,
      'DATABASE_ERROR'
    ));
  }
}

/**
 * Get contact counts by status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getContactCounts(req, res, next) {
  try {
    logger.debug('Getting contact submission counts by status');
    
    const query = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM
        contact_submissions
    `;
    
    const result = await db.query(query);
    const counts = result.rows[0];
    
    // Convert string counts to numbers
    const statusCounts = {
      pending: parseInt(counts.pending),
      in_progress: parseInt(counts.in_progress),
      completed: parseInt(counts.completed),
      rejected: parseInt(counts.rejected)
    };
    
    logger.info('Retrieved contact submission counts', {
      total: parseInt(counts.total),
      statusCounts
    });
    
    res.json({
      success: true,
      data: {
        total: parseInt(counts.total),
        statusCounts
      }
    });
  } catch (error) {
    logger.error('Failed to get contact submission counts', {
      error: error.message,
      stack: error.stack
    });
    
    next(createError(
      'Failed to get contact submission counts: ' + error.message,
      500,
      'DATABASE_ERROR'
    ));
  }
}

/**
 * Get a specific contact submission by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getContactById(req, res, next) {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return next(createError(
        'Invalid contact submission ID',
        400,
        'INVALID_ID'
      ));
    }
    
    logger.debug('Getting contact submission by ID', { id });
    
    const query = `
      SELECT 
        * 
      FROM 
        contact_submissions 
      WHERE 
        id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return next(createError(
        `Contact submission with ID ${id} not found`,
        404,
        'CONTACT_NOT_FOUND'
      ));
    }
    
    const submission = result.rows[0];
    
    logger.info('Retrieved contact submission', { id });
    
    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    logger.error('Failed to get contact submission', {
      error: error.message,
      stack: error.stack,
      id: req.params.id
    });
    
    next(createError(
      'Failed to get contact submission: ' + error.message,
      500,
      'DATABASE_ERROR'
    ));
  }
}

/**
 * Update contact submission status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function updateContactStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return next(createError(
        'Invalid contact submission ID',
        400,
        'INVALID_ID'
      ));
    }
    
    // Validate status
    const validStatuses = ['pending', 'in_progress', 'completed', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return next(createError(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        400,
        'INVALID_STATUS'
      ));
    }
    
    logger.debug('Updating contact submission status', { id, status });
    
    // Check if submission exists
    const checkQuery = 'SELECT id FROM contact_submissions WHERE id = $1';
    const checkResult = await db.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return next(createError(
        `Contact submission with ID ${id} not found`,
        404,
        'CONTACT_NOT_FOUND'
      ));
    }
    
    // Update the submission
    const updateQuery = `
      UPDATE 
        contact_submissions 
      SET 
        status = $1, 
        notes = $2, 
        updated_at = NOW() 
      WHERE 
        id = $3 
      RETURNING 
        id, status, updated_at
    `;
    
    const result = await db.query(updateQuery, [status, notes || null, id]);
    
    logger.info('Updated contact submission status', {
      id,
      status,
      previousStatus: checkResult.rows[0].status
    });
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Contact submission status updated successfully'
    });
  } catch (error) {
    logger.error('Failed to update contact submission status', {
      error: error.message,
      stack: error.stack,
      id: req.params.id,
      status: req.body.status
    });
    
    next(createError(
      'Failed to update contact submission status: ' + error.message,
      500,
      'DATABASE_ERROR'
    ));
  }
}

/**
 * Delete a contact submission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function deleteContact(req, res, next) {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return next(createError(
        'Invalid contact submission ID',
        400,
        'INVALID_ID'
      ));
    }
    
    logger.debug('Deleting contact submission', { id });
    
    // Check if submission exists
    const checkQuery = 'SELECT id FROM contact_submissions WHERE id = $1';
    const checkResult = await db.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return next(createError(
        `Contact submission with ID ${id} not found`,
        404,
        'CONTACT_NOT_FOUND'
      ));
    }
    
    // Delete the submission
    const deleteQuery = 'DELETE FROM contact_submissions WHERE id = $1 RETURNING id';
    const result = await db.query(deleteQuery, [id]);
    
    logger.info('Deleted contact submission', { id });
    
    res.json({
      success: true,
      data: {
        id: result.rows[0].id
      },
      message: 'Contact submission deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete contact submission', {
      error: error.message,
      stack: error.stack,
      id: req.params.id
    });
    
    next(createError(
      'Failed to delete contact submission: ' + error.message,
      500,
      'DATABASE_ERROR'
    ));
  }
}

module.exports = {
  submitContact,
  getAllContacts,
  getContactCounts,
  getContactById,
  updateContactStatus,
  deleteContact
};