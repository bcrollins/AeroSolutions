/**
 * User Model
 * 
 * Handles user-related database operations
 */

const bcrypt = require('bcrypt');
const { pool } = require('../config/database');

class User {
  /**
   * Find a user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }
  
  /**
   * Find a user by username
   * @param {string} username - Username
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async findByUsername(username) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }
  
  /**
   * Find a user by email
   * @param {string} email - Email address
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async findByEmail(email) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }
  
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {string} userData.username - Username
   * @param {string} userData.email - Email address
   * @param {string} userData.password - Plain text password
   * @param {string} [userData.role='user'] - User role
   * @returns {Promise<Object>} Created user object
   */
  static async create(userData) {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const result = await pool.query(
        `INSERT INTO users (
          username, email, password, role, created_at
        ) VALUES ($1, $2, $3, $4, NOW())
        RETURNING id, username, email, role, created_at`,
        [
          userData.username,
          userData.email,
          hashedPassword,
          userData.role || 'user'
        ]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  /**
   * Update a user
   * @param {number} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user object
   */
  static async update(id, userData) {
    try {
      const fields = [];
      const values = [];
      let counter = 1;
      
      // Add fields to update
      Object.keys(userData).forEach(key => {
        // Skip id and password (password has a separate method)
        if (key !== 'id' && key !== 'password') {
          fields.push(`${key} = $${counter}`);
          values.push(userData[key]);
          counter++;
        }
      });
      
      // Add updated_at
      fields.push(`updated_at = NOW()`);
      
      // Add ID for WHERE clause
      values.push(id);
      
      const result = await pool.query(
        `UPDATE users 
        SET ${fields.join(', ')} 
        WHERE id = $${counter}
        RETURNING id, username, email, role, created_at, updated_at`,
        values
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
  
  /**
   * Update a user's password
   * @param {number} id - User ID
   * @param {string} newPassword - New plain text password
   * @returns {Promise<boolean>} True if password was updated
   */
  static async updatePassword(id, newPassword) {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      const result = await pool.query(
        `UPDATE users 
        SET password = $1, updated_at = NOW() 
        WHERE id = $2
        RETURNING id`,
        [hashedPassword, id]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error updating user password:', error);
      throw error;
    }
  }
  
  /**
   * Delete a user
   * @param {number} id - User ID
   * @returns {Promise<boolean>} True if user was deleted
   */
  static async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
  
  /**
   * Verify password
   * @param {string} password - Plain text password to verify
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise<boolean>} True if password matches
   */
  static async verifyPassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }
  
  /**
   * Get all users
   * @param {Object} options - Query options
   * @param {number} [options.limit=100] - Maximum number of users to return
   * @param {number} [options.offset=0] - Number of users to skip
   * @returns {Promise<Array>} Array of user objects
   */
  static async getAll({ limit = 100, offset = 0 } = {}) {
    try {
      const result = await pool.query(
        `SELECT id, username, email, role, created_at, updated_at 
        FROM users 
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }
}

module.exports = User;