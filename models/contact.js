/**
 * Contact Model
 * 
 * Handles contact form submissions and related operations
 */

const { pool } = require('../config/database');

class Contact {
  /**
   * Submit a new contact form
   * @param {Object} contactData - Contact form data
   * @param {string} contactData.name - Contact name
   * @param {string} contactData.email - Contact email
   * @param {string} contactData.subject - Email subject
   * @param {string} contactData.message - Message content
   * @returns {Promise<Object>} Created contact form submission
   */
  static async submit(contactData) {
    try {
      const result = await pool.query(
        `INSERT INTO contacts (
          name, email, subject, message, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id, name, email, subject, message, status, created_at`,
        [
          contactData.name,
          contactData.email,
          contactData.subject,
          contactData.message,
          'pending' // Initial status
        ]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw error;
    }
  }
  
  /**
   * Get a contact submission by ID
   * @param {number} id - Contact submission ID
   * @returns {Promise<Object|null>} Contact object or null if not found
   */
  static async getById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM contacts WHERE id = $1',
        [id]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting contact by ID:', error);
      throw error;
    }
  }
  
  /**
   * Get all contact submissions
   * @param {Object} options - Query options
   * @param {number} [options.limit=50] - Maximum number of contacts to return
   * @param {number} [options.offset=0] - Number of contacts to skip
   * @param {string} [options.status] - Filter by status
   * @returns {Promise<Array>} Array of contact objects
   */
  static async getAll({ limit = 50, offset = 0, status } = {}) {
    try {
      let query = 'SELECT * FROM contacts';
      const params = [];
      
      // Add status filter if provided
      if (status) {
        query += ' WHERE status = $1';
        params.push(status);
      }
      
      // Add ordering and pagination
      query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
      params.push(limit, offset);
      
      const result = await pool.query(query, params);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting all contacts:', error);
      throw error;
    }
  }
  
  /**
   * Update a contact submission's status
   * @param {number} id - Contact submission ID
   * @param {string} status - New status ('pending', 'responded', 'spam', etc.)
   * @param {string} [notes] - Optional admin notes about status change
   * @returns {Promise<Object>} Updated contact object
   */
  static async updateStatus(id, status, notes) {
    try {
      const result = await pool.query(
        `UPDATE contacts 
        SET status = $1, notes = $2, updated_at = NOW() 
        WHERE id = $3
        RETURNING *`,
        [status, notes || null, id]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Contact not found');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating contact status:', error);
      throw error;
    }
  }
  
  /**
   * Delete a contact submission
   * @param {number} id - Contact submission ID
   * @returns {Promise<boolean>} True if contact was deleted
   */
  static async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM contacts WHERE id = $1 RETURNING id',
        [id]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }
  
  /**
   * Count contact submissions by status
   * @returns {Promise<Object>} Counts by status
   */
  static async countByStatus() {
    try {
      const result = await pool.query(
        'SELECT status, COUNT(*) as count FROM contacts GROUP BY status'
      );
      
      // Convert to object
      const counts = { total: 0 };
      result.rows.forEach(row => {
        counts[row.status] = parseInt(row.count);
        counts.total += parseInt(row.count);
      });
      
      return counts;
    } catch (error) {
      console.error('Error counting contacts by status:', error);
      throw error;
    }
  }
}

module.exports = Contact;