/**
 * Contact Model
 * 
 * Handles database operations for contact submissions
 */

const pool = require('../config/database');

class Contact {
  /**
   * Create a new contact submission
   * @param {Object} contactData - Contact submission data
   * @returns {Promise<Object>} Created contact submission
   */
  static async create(contactData) {
    const { name, email, subject, message } = contactData;
    
    const result = await pool.query(
      `INSERT INTO contact_submissions (name, email, subject, message, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW()) RETURNING *`,
      [name, email, subject, message]
    );
    
    return result.rows[0];
  }

  /**
   * Get all contact submissions
   * @param {Object} options - Query options (limit, offset, status)
   * @returns {Promise<Array>} Array of contact submissions
   */
  static async getAll(options = {}) {
    const { limit = 50, offset = 0, status } = options;
    
    let query = 'SELECT * FROM contact_submissions';
    const queryParams = [];
    
    // Add status filter if provided
    if (status) {
      query += ' WHERE status = $1';
      queryParams.push(status);
    }
    
    // Add ordering and pagination
    query += ' ORDER BY created_at DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
    queryParams.push(limit, offset);
    
    const result = await pool.query(query, queryParams);
    return result.rows;
  }

  /**
   * Get a single contact submission by ID
   * @param {number} id - Contact submission ID
   * @returns {Promise<Object|null>} Contact submission or null if not found
   */
  static async getById(id) {
    const result = await pool.query('SELECT * FROM contact_submissions WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  /**
   * Update a contact submission's status
   * @param {number} id - Contact submission ID
   * @param {string} status - New status
   * @returns {Promise<Object|null>} Updated contact submission or null if not found
   */
  static async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE contact_submissions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Delete a contact submission
   * @param {number} id - Contact submission ID
   * @returns {Promise<boolean>} Success status
   */
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM contact_submissions WHERE id = $1 RETURNING id',
      [id]
    );
    
    return result.rows.length > 0;
  }
  
  /**
   * Get count of contact submissions by status
   * @returns {Promise<Object>} Counts by status
   */
  static async getCounts() {
    const result = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM contact_submissions
      GROUP BY status
    `);
    
    // Convert to an object with status as keys
    const counts = { total: 0 };
    result.rows.forEach(row => {
      counts[row.status] = parseInt(row.count);
      counts.total += parseInt(row.count);
    });
    
    return counts;
  }
}

module.exports = Contact;