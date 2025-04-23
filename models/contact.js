/**
 * Contact Model
 * 
 * Handles contact form submissions and related operations
 */

const { query } = require('../config/database');

/**
 * Submit a new contact form
 * @param {Object} contactData - Contact form data
 * @param {string} contactData.name - Submitter's name
 * @param {string} contactData.email - Submitter's email
 * @param {string} contactData.subject - Message subject
 * @param {string} contactData.message - Message content
 * @returns {Promise<Object>} - Submitted contact data with ID
 */
const submit = async (contactData) => {
  try {
    const result = await query(
      `INSERT INTO contact_submissions (name, email, subject, message, status, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, 'new', NOW(), NOW()) 
       RETURNING id, name, email, subject, message, status, created_at`,
      [
        contactData.name,
        contactData.email,
        contactData.subject || '',
        contactData.message
      ]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in contact.submit:', error);
    throw new Error(`Failed to submit contact form: ${error.message}`);
  }
};

/**
 * Get all contact submissions (for admin)
 * @param {Object} options - Query options
 * @param {number} [options.limit=100] - Maximum number of submissions to return
 * @param {number} [options.offset=0] - Offset for pagination
 * @param {string} [options.status] - Filter by status
 * @param {string} [options.sortBy='created_at'] - Sort field
 * @param {string} [options.sortOrder='DESC'] - Sort direction
 * @returns {Promise<Array>} - Array of contact submissions
 */
const findAll = async (options = {}) => {
  try {
    // Set defaults
    const limit = options.limit || 100;
    const offset = options.offset || 0;
    const sortBy = options.sortBy || 'created_at';
    const sortOrder = options.sortOrder || 'DESC';
    
    // Validate sort field to prevent SQL injection
    const allowedSortFields = ['id', 'name', 'email', 'subject', 'status', 'created_at', 'updated_at'];
    if (!allowedSortFields.includes(sortBy)) {
      throw new Error('Invalid sort field');
    }
    
    // Validate sort order to prevent SQL injection
    if (!['ASC', 'DESC'].includes(sortOrder)) {
      throw new Error('Invalid sort order');
    }
    
    // Build query
    let queryText = `
      SELECT id, name, email, subject, message, status, created_at, updated_at 
      FROM contact_submissions
    `;
    
    const queryParams = [];
    let paramCounter = 1;
    
    // Add status filter if provided
    if (options.status) {
      queryText += ` WHERE status = $${paramCounter++}`;
      queryParams.push(options.status);
    }
    
    // Add sorting and pagination
    queryText += ` ORDER BY ${sortBy} ${sortOrder} LIMIT $${paramCounter++} OFFSET $${paramCounter++}`;
    queryParams.push(limit, offset);
    
    // Execute query
    const result = await query(queryText, queryParams);
    
    return result.rows;
  } catch (error) {
    console.error('Error in contact.findAll:', error);
    throw new Error(`Failed to retrieve contact submissions: ${error.message}`);
  }
};

/**
 * Get a single contact submission by ID
 * @param {number} id - Contact submission ID
 * @returns {Promise<Object|null>} - Contact submission or null if not found
 */
const findById = async (id) => {
  try {
    const result = await query(
      `SELECT id, name, email, subject, message, status, created_at, updated_at 
       FROM contact_submissions 
       WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in contact.findById:', error);
    throw new Error(`Failed to retrieve contact submission: ${error.message}`);
  }
};

/**
 * Update contact submission status
 * @param {number} id - Contact submission ID
 * @param {string} status - New status value
 * @returns {Promise<Object>} - Updated contact submission
 */
const updateStatus = async (id, status) => {
  try {
    // Validate status
    const validStatuses = ['new', 'in_progress', 'completed', 'spam'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }
    
    const result = await query(
      `UPDATE contact_submissions 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING id, name, email, subject, message, status, created_at, updated_at`,
      [status, id]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Contact submission not found');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in contact.updateStatus:', error);
    throw new Error(`Failed to update contact status: ${error.message}`);
  }
};

/**
 * Delete a contact submission
 * @param {number} id - Contact submission ID
 * @returns {Promise<boolean>} - Success indicator
 */
const remove = async (id) => {
  try {
    const result = await query(
      'DELETE FROM contact_submissions WHERE id = $1 RETURNING id',
      [id]
    );
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error in contact.remove:', error);
    throw new Error(`Failed to delete contact submission: ${error.message}`);
  }
};

/**
 * Get count of contact submissions by status
 * @returns {Promise<Object>} - Counts by status
 */
const getCounts = async () => {
  try {
    const result = await query(`
      SELECT status, COUNT(*) as count
      FROM contact_submissions
      GROUP BY status
    `);
    
    // Convert to object with status as keys
    const counts = {
      total: 0,
      new: 0,
      in_progress: 0,
      completed: 0,
      spam: 0
    };
    
    result.rows.forEach(row => {
      counts[row.status] = parseInt(row.count);
      counts.total += parseInt(row.count);
    });
    
    return counts;
  } catch (error) {
    console.error('Error in contact.getCounts:', error);
    throw new Error(`Failed to get contact counts: ${error.message}`);
  }
};

module.exports = {
  submit,
  findAll,
  findById,
  updateStatus,
  remove,
  getCounts
};