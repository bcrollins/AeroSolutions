/**
 * Authentication Middleware
 * 
 * Middleware for handling user authentication and authorization
 */

const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');

// JWT secret key from environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

/**
 * Verify JWT token from Authorization header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.isAuthenticated = false;
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Set user on request
    if (decoded.userId) {
      const user = await UserModel.findById(decoded.userId);
      
      if (user) {
        req.user = user;
        req.isAuthenticated = true;
      } else {
        req.isAuthenticated = false;
      }
    } else {
      req.isAuthenticated = false;
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    req.isAuthenticated = false;
    next();
  }
};

/**
 * Require authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated || !req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  next();
};

/**
 * Require admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const adminOnly = (req, res, next) => {
  if (!req.isAuthenticated || !req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  
  next();
};

/**
 * Generate JWT token for a user
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );
};

module.exports = {
  verifyToken,
  requireAuth,
  adminOnly,
  generateToken
};