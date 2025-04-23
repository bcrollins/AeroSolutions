/**
 * Contact Model
 * 
 * Handles contact form submissions and related database operations
 */

const { pool } = require('../config/database');

class Contact {
  /**
   * Create a new contact form submission
   * @param {Object} contactData - Contact form data
   * @param {string} contactData.name - Name of the person submitting the form
   * @param {string} contactData.email - Email of the person submitting the form
   * @param {string} contactData.subject - Subject of the contact message
   * @param {string} contactData.message - Content of the contact message
   * @returns {Promise<Object>} - Created contact object
   */
  static async create({ name, email, subject, message }) {
    try {
      // Validate required fields
      if (!name || !email || !subject || !message) {
        throw new Error('All fields are required');
      }
      
      // Insert new contact
      const result = await pool.query(
        `INSERT INTO contacts (name, email, subject, message, status, created_at) 
         VALUES ($1, $2, $3, $4, 'pending', NOW()) 
         RETURNING *`,
        [name, email, subject, message]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating contact submission:', error);
      throw error;
    }
  }
  
  /**
   * Get a contact submission by ID
   * @param {number} id - Contact ID
   * @returns {Promise<Object|null>} - Contact object or null if not found
   */
  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM contacts WHERE id = $1',
        [id]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding contact by ID:', error);
      throw error;
    }
  }
  
  /**
   * Update a contact submission's status
   * @param {number} id - Contact ID
   * @param {string} status - New status ('pending', 'in_progress', 'completed', 'archived')
   * @param {string} [notes] - Optional notes to add
   * @returns {Promise<Object>} - Updated contact object
   */
  static async updateStatus(id, status, notes) {
    try {
      // Validate status
      const validStatuses = ['pending', 'in_progress', 'completed', 'archived'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
      
      let query, params;
      
      if (notes) {
        query = `
          UPDATE contacts
          SET status = $1, notes = $2, updated_at = NOW()
          WHERE id = $3
          RETURNING *
        `;
        params = [status, notes, id];
      } else {
        query = `
          UPDATE contacts
          SET status = $1, updated_at = NOW()
          WHERE id = $2
          RETURNING *
        `;
        params = [status, id];
      }
      
      const result = await pool.query(query, params);
      
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
   * Get all contact submissions
   * @param {Object} options - Query options
   * @param {string} [options.status] - Filter by status
   * @param {string} [options.sortBy='created_at'] - Field to sort by
   * @param {string} [options.sortOrder='DESC'] - Sort order ('ASC' or 'DESC')
   * @param {number} [options.limit=100] - Maximum number of contacts to return
   * @param {number} [options.offset=0] - Number of contacts to skip
   * @returns {Promise<Array>} - Array of contact objects
   */
  static async getAll({ status, sortBy = 'created_at', sortOrder = 'DESC', limit = 100, offset = 0 }) {
    try {
      // Build query with optional status filter
      let query = 'SELECT * FROM contacts';
      const params = [];
      
      if (status) {
        query += ' WHERE status = $1';
        params.push(status);
      }
      
      // Add sorting (with basic SQL injection protection)
      const validSortFields = ['created_at', 'name', 'email', 'subject', 'status', 'updated_at'];
      const validSortOrders = ['ASC', 'DESC'];
      
      if (!validSortFields.includes(sortBy)) {
        sortBy = 'created_at';
      }
      
      if (!validSortOrders.includes(sortOrder)) {
        sortOrder = 'DESC';
      }
      
      query += ` ORDER BY ${sortBy} ${sortOrder}`;
      
      // Add pagination
      query += ' LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
      params.push(limit, offset);
      
      const result = await pool.query(query, params);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting contact submissions:', error);
      throw error;
    }
  }
  
  /**
   * Count total contact submissions
   * @param {string} [status] - Optional status to filter by
   * @returns {Promise<number>} - Total count of contacts
   */
  static async count(status) {
    try {
      let query = 'SELECT COUNT(*) as count FROM contacts';
      const params = [];
      
      if (status) {
        query += ' WHERE status = $1';
        params.push(status);
      }
      
      const result = await pool.query(query, params);
      
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error counting contact submissions:', error);
      throw error;
    }
  }
  
  /**
   * Delete a contact submission
   * @param {number} id - Contact ID
   * @returns {Promise<boolean>} - True if deletion successful
   */
  static async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM contacts WHERE id = $1 RETURNING id',
        [id]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Contact not found');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }
}

module.exports = Contact;