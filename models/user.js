/**
 * User Model
 * 
 * Handles user-related database operations
 */

const bcrypt = require('bcrypt');
const { query } = require('../config/database');

// Number of salt rounds for password hashing
const SALT_ROUNDS = 10;

/**
 * Find a user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} - User object or null if not found
 */
const findById = async (id) => {
  try {
    const result = await query(
      'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in user.findById:', error);
    throw new Error(`Database error: ${error.message}`);
  }
};

/**
 * Find a user by username
 * @param {string} username - Username to find
 * @returns {Promise<Object|null>} - User object or null if not found
 */
const findByUsername = async (username) => {
  try {
    const result = await query(
      'SELECT id, username, email, password, role, created_at, updated_at FROM users WHERE username = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in user.findByUsername:', error);
    throw new Error(`Database error: ${error.message}`);
  }
};

/**
 * Find a user by email
 * @param {string} email - Email to find
 * @returns {Promise<Object|null>} - User object or null if not found
 */
const findByEmail = async (email) => {
  try {
    const result = await query(
      'SELECT id, username, email, password, role, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in user.findByEmail:', error);
    throw new Error(`Database error: ${error.message}`);
  }
};

/**
 * Create a new user
 * @param {Object} userData - User data
 * @param {string} userData.username - Username
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Plain text password
 * @param {string} [userData.role='user'] - User role
 * @returns {Promise<Object>} - Created user object
 */
const create = async (userData) => {
  try {
    // Check if username already exists
    const existingUsername = await findByUsername(userData.username);
    if (existingUsername) {
      throw new Error('Username already exists');
    }
    
    // Check if email already exists
    const existingEmail = await findByEmail(userData.email);
    if (existingEmail) {
      throw new Error('Email already exists');
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
    
    // Insert new user
    const result = await query(
      `INSERT INTO users (username, email, password, role, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW()) 
       RETURNING id, username, email, role, created_at, updated_at`,
      [
        userData.username,
        userData.email,
        hashedPassword,
        userData.role || 'user'
      ]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in user.create:', error);
    throw new Error(error.message);
  }
};

/**
 * Update a user
 * @param {number} id - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} - Updated user object
 */
const update = async (id, userData) => {
  try {
    // Start building query
    let updateQuery = 'UPDATE users SET updated_at = NOW()';
    const queryParams = [];
    let paramCounter = 1;
    
    // Add fields to update
    if (userData.username) {
      updateQuery += `, username = $${paramCounter++}`;
      queryParams.push(userData.username);
    }
    
    if (userData.email) {
      updateQuery += `, email = $${paramCounter++}`;
      queryParams.push(userData.email);
    }
    
    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
      updateQuery += `, password = $${paramCounter++}`;
      queryParams.push(hashedPassword);
    }
    
    if (userData.role) {
      updateQuery += `, role = $${paramCounter++}`;
      queryParams.push(userData.role);
    }
    
    // Finish query
    updateQuery += ` WHERE id = $${paramCounter} RETURNING id, username, email, role, created_at, updated_at`;
    queryParams.push(id);
    
    // Execute query
    const result = await query(updateQuery, queryParams);
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in user.update:', error);
    throw new Error(`Update failed: ${error.message}`);
  }
};

/**
 * Delete a user
 * @param {number} id - User ID
 * @returns {Promise<boolean>} - Success indicator
 */
const remove = async (id) => {
  try {
    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error in user.remove:', error);
    throw new Error(`Delete failed: ${error.message}`);
  }
};

/**
 * Authenticate a user
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise<Object|null>} - Authenticated user or null
 */
const authenticate = async (username, password) => {
  try {
    // Find user by username
    const user = await findByUsername(username);
    
    if (!user) {
      return null;
    }
    
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return null;
    }
    
    // Remove password from returned object
    const { password: _, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  } catch (error) {
    console.error('Error in user.authenticate:', error);
    throw new Error(`Authentication error: ${error.message}`);
  }
};

/**
 * Get all users (admin only)
 * @param {Object} options - Query options
 * @param {number} [options.limit=100] - Maximum number of users to return
 * @param {number} [options.offset=0] - Offset for pagination
 * @param {string} [options.sortBy='id'] - Sort field
 * @param {string} [options.sortOrder='ASC'] - Sort direction
 * @returns {Promise<Array>} - Array of users
 */
const findAll = async (options = {}) => {
  try {
    // Set defaults
    const limit = options.limit || 100;
    const offset = options.offset || 0;
    const sortBy = options.sortBy || 'id';
    const sortOrder = options.sortOrder || 'ASC';
    
    // Validate sort field to prevent SQL injection
    const allowedSortFields = ['id', 'username', 'email', 'role', 'created_at', 'updated_at'];
    if (!allowedSortFields.includes(sortBy)) {
      throw new Error('Invalid sort field');
    }
    
    // Validate sort order to prevent SQL injection
    if (!['ASC', 'DESC'].includes(sortOrder)) {
      throw new Error('Invalid sort order');
    }
    
    // Execute query
    const result = await query(
      `SELECT id, username, email, role, created_at, updated_at 
       FROM users 
       ORDER BY ${sortBy} ${sortOrder} 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error in user.findAll:', error);
    throw new Error(`Query failed: ${error.message}`);
  }
};

module.exports = {
  findById,
  findByUsername,
  findByEmail,
  create,
  update,
  remove,
  authenticate,
  findAll
};