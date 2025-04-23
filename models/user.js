/**
 * User Model
 * 
 * Handles user data and operations
 */

const { pool, query } = require('../config/database');
const bcrypt = require('bcrypt');

// Constants
const SALT_ROUNDS = 10;

/**
 * Find a user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} - User object or null if not found
 */
const findById = async (id) => {
  try {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    delete user.password; // Don't expose password hash
    return user;
  } catch (error) {
    console.error('Error in user.findById:', error);
    throw new Error(`Failed to find user: ${error.message}`);
  }
};

/**
 * Find a user by username
 * @param {string} username - Username
 * @returns {Promise<Object|null>} - User object or null if not found
 */
const findByUsername = async (username) => {
  try {
    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error in user.findByUsername:', error);
    throw new Error(`Failed to find user: ${error.message}`);
  }
};

/**
 * Find a user by email
 * @param {string} email - Email
 * @returns {Promise<Object|null>} - User object or null if not found
 */
const findByEmail = async (email) => {
  try {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error in user.findByEmail:', error);
    throw new Error(`Failed to find user: ${error.message}`);
  }
};

/**
 * Create a new user
 * @param {Object} userData - User data
 * @param {string} userData.username - Username
 * @param {string} userData.email - Email
 * @param {string} userData.password - Password (plaintext)
 * @param {string} [userData.fullName] - Full name
 * @param {string} [userData.role] - User role (default: 'user')
 * @returns {Promise<Object>} - Created user
 */
const create = async ({ username, email, password, fullName = '', role = 'user' }) => {
  try {
    // Check if username or email already exists
    const existingUser = await query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    if (existingUser.rows.length > 0) {
      const existing = existingUser.rows[0];
      if (existing.username === username) {
        throw new Error('Username already exists');
      }
      if (existing.email === email) {
        throw new Error('Email already exists');
      }
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    const now = new Date();
    
    // Create user
    const result = await query(
      `INSERT INTO users (username, email, password, full_name, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [username, email, passwordHash, fullName, role, now, now]
    );
    
    const user = result.rows[0];
    delete user.password; // Don't expose password hash
    return user;
  } catch (error) {
    console.error('Error in user.create:', error);
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

/**
 * Update a user
 * @param {number} id - User ID
 * @param {Object} userData - User data to update
 * @param {string} [userData.email] - Email
 * @param {string} [userData.fullName] - Full name
 * @param {string} [userData.role] - User role
 * @returns {Promise<Object|null>} - Updated user or null if not found
 */
const update = async (id, { email, fullName, role }) => {
  try {
    // Build update query dynamically
    const updates = [];
    const values = [];
    
    if (email) {
      updates.push(`email = $${updates.length + 1}`);
      values.push(email);
    }
    
    if (fullName !== undefined) {
      updates.push(`full_name = $${updates.length + 1}`);
      values.push(fullName);
    }
    
    if (role) {
      updates.push(`role = $${updates.length + 1}`);
      values.push(role);
    }
    
    // Add updated_at
    const now = new Date();
    updates.push(`updated_at = $${updates.length + 1}`);
    values.push(now);
    
    // Add id parameter
    values.push(id);
    
    // Execute update
    const result = await query(
      `UPDATE users
       SET ${updates.join(', ')}
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    delete user.password; // Don't expose password hash
    return user;
  } catch (error) {
    console.error('Error in user.update:', error);
    throw new Error(`Failed to update user: ${error.message}`);
  }
};

/**
 * Change user password
 * @param {number} id - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} - True if password changed successfully
 */
const changePassword = async (id, currentPassword, newPassword) => {
  try {
    // Get user with password
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const user = result.rows[0];
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }
    
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    // Update password
    await query(
      `UPDATE users
       SET password = $1, updated_at = $2
       WHERE id = $3`,
      [passwordHash, new Date(), id]
    );
    
    return true;
  } catch (error) {
    console.error('Error in user.changePassword:', error);
    throw new Error(`Failed to change password: ${error.message}`);
  }
};

/**
 * Authenticate a user
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise<Object|null>} - User object if authenticated, null otherwise
 */
const authenticate = async (username, password) => {
  try {
    // Get user with password
    const user = await findByUsername(username);
    
    if (!user) {
      return null;
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    
    // Return user without password
    delete user.password;
    return user;
  } catch (error) {
    console.error('Error in user.authenticate:', error);
    throw new Error(`Authentication failed: ${error.message}`);
  }
};

module.exports = {
  findById,
  findByUsername,
  findByEmail,
  create,
  update,
  changePassword,
  authenticate
};