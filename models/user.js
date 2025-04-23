/**
 * User Model
 * 
 * Handles database operations for user records
 */

const pool = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  /**
   * Find a user by their ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async findById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  /**
   * Find a user by their email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  /**
   * Find a user by their username
   * @param {string} username - Username
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async findByUsername(username) {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
  }

  /**
   * Create a new user
   * @param {Object} userData - User data (email, username, password)
   * @returns {Promise<Object>} Created user object
   */
  static async create(userData) {
    const { email, username, password, first_name, last_name, role = 'user' } = userData;

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      `INSERT INTO users (
        email, username, password, first_name, last_name, role, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`,
      [email, username, hashedPassword, first_name, last_name, role]
    );

    return result.rows[0];
  }

  /**
   * Update a user's profile
   * @param {number} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated user object or null if not found
   */
  static async update(id, updateData) {
    // Create the SET part of the query dynamically
    const fields = Object.keys(updateData).filter(key => key !== 'id' && key !== 'password');
    
    if (fields.length === 0) {
      return this.findById(id);
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = fields.map(field => updateData[field]);

    // Add the updated_at field
    const query = `
      UPDATE users 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1 
      RETURNING *
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  }

  /**
   * Verify user credentials (username/email and password)
   * @param {string} identifier - Username or email
   * @param {string} password - Plain text password to check
   * @returns {Promise<Object|null>} User object if credentials are valid, null otherwise
   */
  static async verifyCredentials(identifier, password) {
    // Check if identifier is an email (contains @) or username
    const field = identifier.includes('@') ? 'email' : 'username';
    
    const result = await pool.query(
      `SELECT * FROM users WHERE ${field} = $1`,
      [identifier]
    );

    const user = result.rows[0];
    
    // If no user found or password doesn't match
    if (!user) return null;
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    return passwordMatch ? user : null;
  }

  /**
   * Update a user's password
   * @param {number} id - User ID
   * @param {string} newPassword - New plain text password
   * @returns {Promise<boolean>} Success status
   */
  static async updatePassword(id, newPassword) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    const result = await pool.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
      [hashedPassword, id]
    );
    
    return result.rows.length > 0;
  }

  /**
   * Delete a user
   * @param {number} id - User ID
   * @returns {Promise<boolean>} Success status
   */
  static async delete(id) {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }
}

module.exports = User;