/**
 * Authentication Middleware
 * 
 * Provides middleware for authenticating and authorizing users
 */

const jwt = require('jsonwebtoken');
const User = require('../models/user');

// JWT secret key (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Middleware to authenticate users via JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user from database (excluding password)
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      console.error('JWT verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

/**
 * Middleware to ensure user has admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const adminMiddleware = (req, res, next) => {
  // User should be set by the authMiddleware
  if (!req.user) {
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
 * Middleware to handle optional authentication
 * If token is present and valid, sets req.user, otherwise continues
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token, continue
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next(); // No token, continue
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user from database (excluding password)
      const user = await User.findById(decoded.userId);
      
      if (user) {
        // Add user to request if found
        req.user = user;
      }
      
      next();
    } catch (error) {
      // Token invalid but we still continue as this is optional auth
      console.error('JWT verification error in optional auth:', error);
      next();
    }
  } catch (error) {
    console.error('Optional authentication error:', error);
    next();
  }
};

// Generate JWT token for a user
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  optionalAuthMiddleware,
  generateToken
};