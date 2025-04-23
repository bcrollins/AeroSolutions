/**
 * Contact Model
 * 
 * Handles contact form data and operations
 */

const { pool, query } = require('../config/database');

/**
 * Submit a contact form
 * @param {Object} contact - Contact form data
 * @param {string} contact.name - Contact name
 * @param {string} contact.email - Contact email
 * @param {string} contact.subject - Contact subject
 * @param {string} contact.message - Contact message
 * @returns {Promise<Object>} - Submitted contact
 */
const submit = async ({ name, email, subject, message }) => {
  try {
    const now = new Date();
    
    const result = await query(
      `INSERT INTO contacts (name, email, subject, message, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, email, subject, message, 'new', now, now]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in contact.submit:', error);
    throw new Error(`Failed to submit contact form: ${error.message}`);
  }
};

/**
 * Find all contact submissions
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of results
 * @param {number} options.offset - Offset for pagination
 * @param {string} options.status - Filter by status
 * @param {string} options.sortBy - Column to sort by
 * @param {string} options.sortOrder - Sort order (ASC or DESC)
 * @returns {Promise<Array>} - Contact submissions
 */
const findAll = async ({ limit = 100, offset = 0, status, sortBy = 'created_at', sortOrder = 'DESC' }) => {
  try {
    // Validate sort column to prevent SQL injection
    const validColumns = ['id', 'name', 'email', 'subject', 'status', 'created_at', 'updated_at'];
    if (!validColumns.includes(sortBy)) {
      sortBy = 'created_at';
    }
    
    // Validate sort order to prevent SQL injection
    sortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';
    
    let sql = `
      SELECT * FROM contacts
      WHERE 1=1
    `;
    
    const params = [];
    
    // Add status filter if provided
    if (status) {
      sql += ` AND status = $${params.length + 1}`;
      params.push(status);
    }
    
    // Add sorting and pagination
    sql += ` ORDER BY ${sortBy} ${sortOrder}
             LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('Error in contact.findAll:', error);
    throw new Error(`Failed to retrieve contact submissions: ${error.message}`);
  }
};

/**
 * Find contact submission by ID
 * @param {number} id - Contact ID
 * @returns {Promise<Object|null>} - Contact submission or null if not found
 */
const findById = async (id) => {
  try {
    const result = await query(
      'SELECT * FROM contacts WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error in contact.findById:', error);
    throw new Error(`Failed to retrieve contact submission: ${error.message}`);
  }
};

/**
 * Update contact submission status
 * @param {number} id - Contact ID
 * @param {string} status - New status
 * @returns {Promise<Object|null>} - Updated contact submission
 */
const updateStatus = async (id, status) => {
  try {
    const now = new Date();
    
    const result = await query(
      `UPDATE contacts
       SET status = $1, updated_at = $2
       WHERE id = $3
       RETURNING *`,
      [status, now, id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in contact.updateStatus:', error);
    throw new Error(`Failed to update contact status: ${error.message}`);
  }
};

/**
 * Remove contact submission
 * @param {number} id - Contact ID
 * @returns {Promise<boolean>} - True if removed, false if not found
 */
const remove = async (id) => {
  try {
    const result = await query(
      'DELETE FROM contacts WHERE id = $1 RETURNING id',
      [id]
    );
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error in contact.remove:', error);
    throw new Error(`Failed to delete contact submission: ${error.message}`);
  }
};

/**
 * Get counts by status
 * @returns {Promise<Object>} - Counts by status
 */
const getCounts = async () => {
  try {
    const result = await query(`
      SELECT status, COUNT(*) as count
      FROM contacts
      GROUP BY status
    `);
    
    // Convert to object format
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
    throw new Error(`Failed to retrieve contact counts: ${error.message}`);
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