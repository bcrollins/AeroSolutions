/**
 * Contact Controller
 * 
 * Handles logic for contact-related routes
 */

const db = require('../config/database');
const logger = require('../config/logger');
const { createError } = require('../middlewares/errorHandler');

/**
 * Submit a contact form
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function submitContact(req, res, next) {
  try {
    const { name, email, subject, message } = req.body;
    
    // Insert contact submission into database
    const query = `
      INSERT INTO contacts (name, email, subject, message, status, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, name, email, subject, status, created_at;
    `;
    
    const values = [name, email, subject, message, 'new'];
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return next(createError('Failed to submit contact form', 'DATABASE_ERROR', 500));
    }
    
    const contact = result.rows[0];
    
    logger.info('Contact form submitted', {
      id: contact.id,
      email: contact.email
    });
    
    // TODO: Send notification email to admin or add to queue
    
    return res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        status: contact.status,
        created_at: contact.created_at
      }
    });
  } catch (error) {
    logger.error('Error submitting contact form', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    
    return next(createError(`Error submitting contact form: ${error.message}`, 'CONTACT_ERROR', 500));
  }
}

/**
 * Get all contact submissions (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllContacts(req, res, next) {
  try {
    // Extract query parameters for filtering and pagination
    const { status, search, page = 1, limit = 20, sort = 'created_at', order = 'desc' } = req.query;
    
    // Build query with potential filters
    let query = `
      SELECT 
        id, name, email, subject, message, status, created_at, updated_at
      FROM 
        contacts
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    // Add status filter if provided
    if (status) {
      query += ` AND status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }
    
    // Add search filter if provided
    if (search) {
      query += ` AND (
        name ILIKE $${paramIndex} OR
        email ILIKE $${paramIndex} OR
        subject ILIKE $${paramIndex} OR
        message ILIKE $${paramIndex}
      )`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    // Add sorting
    query += ` ORDER BY ${sort} ${order === 'asc' ? 'ASC' : 'DESC'}`;
    
    // Add pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);
    
    // Execute query
    const result = await db.query(query, queryParams);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM contacts
      WHERE 1=1
      ${status ? ' AND status = $1' : ''}
      ${search ? ` AND (
        name ILIKE $${status ? 2 : 1} OR
        email ILIKE $${status ? 2 : 1} OR
        subject ILIKE $${status ? 2 : 1} OR
        message ILIKE $${status ? 2 : 1}
      )` : ''}
    `;
    
    const countParams = [];
    if (status) countParams.push(status);
    if (search) countParams.push(`%${search}%`);
    
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    logger.info('Retrieved contact submissions', {
      count: result.rows.length,
      total,
      page,
      limit
    });
    
    return res.json({
      success: true,
      data: {
        contacts: result.rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error retrieving contact submissions', {
      error: error.message,
      stack: error.stack
    });
    
    return next(createError(`Error retrieving contact submissions: ${error.message}`, 'CONTACT_ERROR', 500));
  }
}

/**
 * Get a single contact submission by ID (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getContactById(req, res, next) {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        id, name, email, subject, message, status, created_at, updated_at
      FROM 
        contacts
      WHERE 
        id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return next(createError(`Contact with ID ${id} not found`, 'NOT_FOUND', 404));
    }
    
    const contact = result.rows[0];
    
    logger.info(`Retrieved contact submission with ID ${id}`);
    
    return res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    logger.error('Error retrieving contact submission', {
      error: error.message,
      stack: error.stack,
      id: req.params.id
    });
    
    return next(createError(`Error retrieving contact submission: ${error.message}`, 'CONTACT_ERROR', 500));
  }
}

/**
 * Update a contact submission's status (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateContactStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Get current contact to verify it exists
    const checkQuery = `
      SELECT id FROM contacts WHERE id = $1
    `;
    
    const checkResult = await db.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return next(createError(`Contact with ID ${id} not found`, 'NOT_FOUND', 404));
    }
    
    // Update contact status
    const updateQuery = `
      UPDATE contacts
      SET 
        status = $1,
        notes = $2,
        updated_at = NOW()
      WHERE 
        id = $3
      RETURNING 
        id, name, email, subject, status, notes, created_at, updated_at
    `;
    
    const updateResult = await db.query(updateQuery, [status, notes, id]);
    
    const updatedContact = updateResult.rows[0];
    
    logger.info(`Updated contact submission status`, {
      id,
      status,
      hasNotes: !!notes
    });
    
    return res.json({
      success: true,
      message: 'Contact status updated successfully',
      data: updatedContact
    });
  } catch (error) {
    logger.error('Error updating contact status', {
      error: error.message,
      stack: error.stack,
      id: req.params.id,
      status: req.body.status
    });
    
    return next(createError(`Error updating contact status: ${error.message}`, 'CONTACT_ERROR', 500));
  }
}

/**
 * Delete a contact submission (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteContact(req, res, next) {
  try {
    const { id } = req.params;
    
    // Get current contact to verify it exists
    const checkQuery = `
      SELECT id FROM contacts WHERE id = $1
    `;
    
    const checkResult = await db.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return next(createError(`Contact with ID ${id} not found`, 'NOT_FOUND', 404));
    }
    
    // Delete contact
    const deleteQuery = `
      DELETE FROM contacts
      WHERE id = $1
      RETURNING id
    `;
    
    await db.query(deleteQuery, [id]);
    
    logger.info(`Deleted contact submission with ID ${id}`);
    
    return res.json({
      success: true,
      message: 'Contact deleted successfully',
      data: { id: parseInt(id) }
    });
  } catch (error) {
    logger.error('Error deleting contact submission', {
      error: error.message,
      stack: error.stack,
      id: req.params.id
    });
    
    return next(createError(`Error deleting contact submission: ${error.message}`, 'CONTACT_ERROR', 500));
  }
}

/**
 * Get contact submission counts by status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getContactCounts(req, res, next) {
  try {
    const query = `
      SELECT 
        status, COUNT(*) as count
      FROM 
        contacts
      GROUP BY 
        status
      ORDER BY 
        CASE 
          WHEN status = 'new' THEN 1
          WHEN status = 'in_progress' THEN 2
          WHEN status = 'completed' THEN 3
          WHEN status = 'archived' THEN 4
          ELSE 5
        END
    `;
    
    const result = await db.query(query);
    
    // Get total count
    const totalQuery = `
      SELECT COUNT(*) as total FROM contacts
    `;
    
    const totalResult = await db.query(totalQuery);
    const total = parseInt(totalResult.rows[0].total);
    
    // Format result as an object
    const counts = {
      total,
      byStatus: {}
    };
    
    // Initialize all statuses with zero counts
    ['new', 'in_progress', 'completed', 'archived'].forEach(status => {
      counts.byStatus[status] = 0;
    });
    
    // Update with actual counts
    result.rows.forEach(row => {
      counts.byStatus[row.status] = parseInt(row.count);
    });
    
    logger.info('Retrieved contact submission counts');
    
    return res.json({
      success: true,
      data: counts
    });
  } catch (error) {
    logger.error('Error retrieving contact counts', {
      error: error.message,
      stack: error.stack
    });
    
    return next(createError(`Error retrieving contact counts: ${error.message}`, 'CONTACT_ERROR', 500));
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