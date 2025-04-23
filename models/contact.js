/**
 * Contact Model
 * 
 * Handles contact form submissions and related operations
 */

const { query } = require('../config/database');
const logger = require('../config/logger');

/**
 * Create a new contact submission
 * @param {object} contactData - Contact form data
 * @returns {Promise<object>} - Created contact submission
 */
async function createContact(contactData) {
  try {
    const { name, email, subject, message } = contactData;
    
    const result = await query(
      `INSERT INTO contact_submissions (name, email, subject, message) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, email, subject, message]
    );
    
    logger.info(`New contact submission created: ${result.rows[0].id}`);
    return { success: true, contact: result.rows[0] };
  } catch (error) {
    logger.error(`Error creating contact: ${error.message}`);
    return { 
      success: false, 
      error: { 
        message: 'Failed to create contact submission',
        details: error.message
      } 
    };
  }
}

/**
 * Get all contact submissions
 * @param {string} status - Optional status filter
 * @returns {Promise<Array>} - List of contact submissions
 */
async function getAllContacts(status = null) {
  try {
    let queryText = 'SELECT * FROM contact_submissions';
    const queryParams = [];
    
    if (status) {
      queryText += ' WHERE status = $1';
      queryParams.push(status);
    }
    
    queryText += ' ORDER BY created_at DESC';
    
    const result = await query(queryText, queryParams);
    return { success: true, contacts: result.rows };
  } catch (error) {
    logger.error(`Error fetching contacts: ${error.message}`);
    return { 
      success: false, 
      error: { 
        message: 'Failed to fetch contact submissions',
        details: error.message
      } 
    };
  }
}

/**
 * Get a contact submission by ID
 * @param {number} id - Contact submission ID
 * @returns {Promise<object>} - Contact submission
 */
async function getContactById(id) {
  try {
    const result = await query(
      'SELECT * FROM contact_submissions WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return { success: false, error: { message: 'Contact not found' } };
    }
    
    return { success: true, contact: result.rows[0] };
  } catch (error) {
    logger.error(`Error fetching contact by ID: ${error.message}`);
    return { 
      success: false, 
      error: { 
        message: 'Failed to fetch contact submission',
        details: error.message
      } 
    };
  }
}

/**
 * Update a contact submission's status
 * @param {number} id - Contact submission ID
 * @param {string} status - New status
 * @param {string} notes - Optional notes
 * @returns {Promise<object>} - Updated contact submission
 */
async function updateContactStatus(id, status, notes = null) {
  try {
    let queryText = 'UPDATE contact_submissions SET status = $1, updated_at = NOW()';
    const queryParams = [status];
    
    if (notes !== null) {
      queryText += ', notes = $2';
      queryParams.push(notes);
    }
    
    queryText += ' WHERE id = $' + (queryParams.length + 1) + ' RETURNING *';
    queryParams.push(id);
    
    const result = await query(queryText, queryParams);
    
    if (result.rows.length === 0) {
      return { success: false, error: { message: 'Contact not found' } };
    }
    
    logger.info(`Contact submission ${id} status updated to: ${status}`);
    return { success: true, contact: result.rows[0] };
  } catch (error) {
    logger.error(`Error updating contact status: ${error.message}`);
    return { 
      success: false, 
      error: { 
        message: 'Failed to update contact submission',
        details: error.message
      } 
    };
  }
}

/**
 * Delete a contact submission
 * @param {number} id - Contact submission ID
 * @returns {Promise<object>} - Result of deletion
 */
async function deleteContact(id) {
  try {
    const result = await query(
      'DELETE FROM contact_submissions WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return { success: false, error: { message: 'Contact not found' } };
    }
    
    logger.info(`Contact submission deleted: ${id}`);
    return { success: true, message: 'Contact deleted successfully' };
  } catch (error) {
    logger.error(`Error deleting contact: ${error.message}`);
    return { 
      success: false, 
      error: { 
        message: 'Failed to delete contact submission',
        details: error.message
      } 
    };
  }
}

/**
 * Get counts of contact submissions by status
 * @returns {Promise<object>} - Counts by status
 */
async function getContactCounts() {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) AS total,
        COUNT(CASE WHEN status = 'new' THEN 1 END) AS new,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) AS in_progress,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed
      FROM contact_submissions
    `);
    
    return { success: true, counts: result.rows[0] };
  } catch (error) {
    logger.error(`Error fetching contact counts: ${error.message}`);
    return { 
      success: false, 
      error: { 
        message: 'Failed to fetch contact counts',
        details: error.message
      } 
    };
  }
}

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactCounts
};