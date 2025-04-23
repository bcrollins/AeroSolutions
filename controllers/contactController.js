/**
 * Contact Controller
 * 
 * Handles logic for contact form submissions
 */

const db = require('../config/database');
const logger = require('../config/logger');
const { createError } = require('../middlewares/errorHandler');
const nodemailer = require('nodemailer');

/**
 * Submit a contact form
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function submitContact(req, res, next) {
  try {
    const { name, email, phone, subject, message, companyName } = req.body;
    
    // Insert into database
    const query = `
      INSERT INTO contact_submissions 
        (name, email, phone, subject, message, company_name, status, ip_address, user_agent) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, created_at;
    `;
    
    const result = await db.query(query, [
      name,
      email,
      phone || null,
      subject,
      message,
      companyName || null,
      'pending', // Default status
      req.ip,
      req.headers['user-agent'] || 'Unknown'
    ]);
    
    const submissionId = result.rows[0].id;
    
    // Send notification email to admin
    try {
      if (process.env.NOTIFICATION_EMAIL) {
        // Initialize nodemailer transport
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.example.com',
          port: process.env.EMAIL_PORT || 587,
          secure: process.env.EMAIL_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });
        
        // Prepare email content
        const mailOptions = {
          from: process.env.EMAIL_FROM || 'noreply@example.com',
          to: process.env.NOTIFICATION_EMAIL,
          subject: `New Contact Submission: ${subject}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>ID:</strong> ${submissionId}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Company:</strong> ${companyName || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <p><strong>IP Address:</strong> ${req.ip}</p>
            <p><strong>User Agent:</strong> ${req.headers['user-agent'] || 'Unknown'}</p>
            <p><strong>Submission Time:</strong> ${result.rows[0].created_at}</p>
          `
        };
        
        // Send email asynchronously (don't await)
        transporter.sendMail(mailOptions)
          .catch(emailError => {
            logger.error('Failed to send notification email', {
              error: emailError.message,
              stack: emailError.stack,
              submissionId
            });
          });
      }
    } catch (emailError) {
      // Log error but don't fail the request
      logger.error('Error setting up email notification', {
        error: emailError.message,
        stack: emailError.stack
      });
    }
    
    // Return success response
    res.json({
      success: true,
      data: {
        id: submissionId,
        timestamp: result.rows[0].created_at
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
 * Get all contact submissions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getAllContacts(req, res, next) {
  try {
    // Extract query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || null;
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Prepare query parameters
    const queryParams = [];
    let whereClause = '';
    
    // Add status filter if provided
    if (status) {
      whereClause = 'WHERE status = $1';
      queryParams.push(status);
    }
    
    // Create base query
    const baseQuery = `
      FROM contact_submissions
      ${whereClause}
    `;
    
    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);
    
    // Main query for data
    const dataQueryParams = [...queryParams, limit, offset];
    const dataQuery = `
      SELECT 
        id, name, email, phone, subject, 
        message, company_name, status, 
        ip_address, user_agent, created_at, updated_at
      ${baseQuery}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;
    
    const dataResult = await db.query(dataQuery, dataQueryParams);
    
    // Prepare pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    
    res.json({
      success: true,
      data: {
        contacts: dataResult.rows,
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
 * Get contact submission counts by status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getContactCounts(req, res, next) {
  try {
    const query = `
      SELECT 
        status, 
        COUNT(*) as count
      FROM 
        contact_submissions
      GROUP BY 
        status
      ORDER BY 
        status
    `;
    
    const result = await db.query(query);
    
    // Get total count
    const totalQuery = `
      SELECT COUNT(*) as total
      FROM contact_submissions
    `;
    
    const totalResult = await db.query(totalQuery);
    const total = parseInt(totalResult.rows[0].total);
    
    // Format the response
    const statusCounts = result.rows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count);
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        total,
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
 * Get contact submission by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getContactById(req, res, next) {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        id, name, email, phone, subject, 
        message, company_name, status, 
        ip_address, user_agent, created_at, updated_at
      FROM 
        contact_submissions
      WHERE 
        id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rowCount === 0) {
      return next(createError(
        `Contact submission with ID ${id} not found`,
        404,
        'CONTACT_NOT_FOUND'
      ));
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error(`Failed to get contact submission with ID ${req.params.id}`, {
      error: error.message,
      stack: error.stack
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
    
    // Validate status
    const validStatuses = ['pending', 'in_progress', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return next(createError(
        `Invalid status value. Must be one of: ${validStatuses.join(', ')}`,
        400,
        'INVALID_STATUS'
      ));
    }
    
    // Check if record exists first
    const checkQuery = `
      SELECT id FROM contact_submissions WHERE id = $1
    `;
    
    const checkResult = await db.query(checkQuery, [id]);
    
    if (checkResult.rowCount === 0) {
      return next(createError(
        `Contact submission with ID ${id} not found`,
        404,
        'CONTACT_NOT_FOUND'
      ));
    }
    
    // Update the record
    const updateQuery = `
      UPDATE contact_submissions
      SET 
        status = $1,
        notes = $2,
        updated_at = NOW()
      WHERE 
        id = $3
      RETURNING 
        id, status, updated_at
    `;
    
    const updateResult = await db.query(updateQuery, [status, notes || null, id]);
    
    res.json({
      success: true,
      data: updateResult.rows[0],
      message: 'Contact submission status updated successfully'
    });
  } catch (error) {
    logger.error(`Failed to update status for contact submission with ID ${req.params.id}`, {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    
    next(createError(
      'Failed to update contact submission status: ' + error.message,
      500,
      'DATABASE_ERROR'
    ));
  }
}

/**
 * Delete contact submission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function deleteContact(req, res, next) {
  try {
    const { id } = req.params;
    
    // Check if record exists first
    const checkQuery = `
      SELECT id FROM contact_submissions WHERE id = $1
    `;
    
    const checkResult = await db.query(checkQuery, [id]);
    
    if (checkResult.rowCount === 0) {
      return next(createError(
        `Contact submission with ID ${id} not found`,
        404,
        'CONTACT_NOT_FOUND'
      ));
    }
    
    // Delete the record
    const deleteQuery = `
      DELETE FROM contact_submissions
      WHERE id = $1
      RETURNING id
    `;
    
    await db.query(deleteQuery, [id]);
    
    res.json({
      success: true,
      data: { id: parseInt(id) },
      message: 'Contact submission deleted successfully'
    });
  } catch (error) {
    logger.error(`Failed to delete contact submission with ID ${req.params.id}`, {
      error: error.message,
      stack: error.stack
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