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
   * @returns {Promise<Object|null>} - User object without password or null if not found
   */
  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = $1',
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
   * @param {string} username - Username to search for
   * @returns {Promise<Object|null>} - User object or null if not found
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
   * @param {string} email - Email to search for
   * @returns {Promise<Object|null>} - User object or null if not found
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
   * @param {Object} userData - User data object
   * @param {string} userData.username - Username
   * @param {string} userData.email - Email
   * @param {string} userData.password - Password (will be hashed)
   * @param {string} [userData.role='user'] - User role
   * @returns {Promise<Object>} - Created user object without password
   */
  static async create({ username, email, password, role = 'user' }) {
    try {
      // Check for duplicate username or email
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE username = $1 OR email = $2',
        [username, email]
      );
      
      if (existingUser.rows.length > 0) {
        const isDuplicateUsername = existingUser.rows[0].username === username;
        throw new Error(`${isDuplicateUsername ? 'Username' : 'Email'} already exists`);
      }
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Insert new user
      const result = await pool.query(
        `INSERT INTO users (username, email, password, role, created_at) 
         VALUES ($1, $2, $3, $4, NOW()) 
         RETURNING id, username, email, role, created_at`,
        [username, email, hashedPassword, role]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  /**
   * Update a user's profile
   * @param {number} id - User ID
   * @param {Object} userData - User data to update
   * @param {string} [userData.username] - New username
   * @param {string} [userData.email] - New email
   * @returns {Promise<Object>} - Updated user object without password
   */
  static async update(id, userData) {
    try {
      const { username, email } = userData;
      
      // Check for duplicate username or email
      if (username || email) {
        const query = 'SELECT * FROM users WHERE (username = $1 OR email = $2) AND id != $3';
        const params = [username || '', email || '', id];
        const existingUser = await pool.query(query, params);
        
        if (existingUser.rows.length > 0) {
          const isDuplicateUsername = existingUser.rows[0].username === username;
          throw new Error(`${isDuplicateUsername ? 'Username' : 'Email'} already exists`);
        }
      }
      
      // Build update query dynamically
      let updateFields = [];
      let queryParams = [];
      let paramIndex = 1;
      
      if (username) {
        updateFields.push(`username = $${paramIndex}`);
        queryParams.push(username);
        paramIndex++;
      }
      
      if (email) {
        updateFields.push(`email = $${paramIndex}`);
        queryParams.push(email);
        paramIndex++;
      }
      
      updateFields.push(`updated_at = NOW()`);
      
      // Add user ID as the last parameter
      queryParams.push(id);
      
      // Execute update
      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')} 
        WHERE id = $${paramIndex}
        RETURNING id, username, email, role, created_at, updated_at
      `;
      
      const result = await pool.query(query, queryParams);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
  
  /**
   * Change a user's password
   * @param {number} id - User ID
   * @param {string} currentPassword - Current password for verification
   * @param {string} newPassword - New password to set
   * @returns {Promise<boolean>} - True if password change successful
   */
  static async changePassword(id, currentPassword, newPassword) {
    try {
      // Get user with password
      const userResult = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      
      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }
      
      const user = userResult.rows[0];
      
      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }
      
      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Update password
      await pool.query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
        [hashedPassword, id]
      );
      
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
  
  /**
   * Delete a user
   * @param {number} id - User ID
   * @returns {Promise<boolean>} - True if deletion successful
   */
  static async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
      );
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
  
  /**
   * Get all users (for admin purposes)
   * @param {number} [limit=100] - Maximum number of users to return
   * @param {number} [offset=0] - Number of users to skip
   * @returns {Promise<Array>} - Array of user objects without passwords
   */
  static async getAll(limit = 100, offset = 0) {
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
      console.error('Error getting all users:', error);
      throw error;
    }
  }
  
  /**
   * Update a user's role (admin only)
   * @param {number} id - User ID
   * @param {string} role - New role (e.g., 'user', 'admin')
   * @returns {Promise<Object>} - Updated user object without password
   */
  static async updateRole(id, role) {
    try {
      const result = await pool.query(
        `UPDATE users
         SET role = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING id, username, email, role, created_at, updated_at`,
        [role, id]
      );
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }
  
  /**
   * Authenticate a user with username/email and password
   * @param {string} identifier - Username or email
   * @param {string} password - Password to verify
   * @returns {Promise<Object|null>} - User object without password or null if invalid
   */
  static async authenticate(identifier, password) {
    try {
      // Check if identifier is email or username
      const isEmail = identifier.includes('@');
      
      // Get user with password
      const result = await pool.query(
        `SELECT * FROM users WHERE ${isEmail ? 'email' : 'username'} = $1`,
        [identifier]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const user = result.rows[0];
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return null;
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }
}

module.exports = User;