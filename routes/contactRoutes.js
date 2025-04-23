/**
 * Contact Routes
 * 
 * API routes for contact form functionality
 */

const express = require('express');
const { body } = require('express-validator');
const contactController = require('../controllers/contactController');
const router = express.Router();

// Auth middleware for admin-only routes
const authMiddleware = require('../middlewares/auth');
const adminOnly = authMiddleware.adminOnly;

// Middleware for rate limiting contact form submissions
const rateLimiter = require('../middlewares/rateLimiter');
const contactRateLimit = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // limit each IP to 5 requests per window
  message: {
    success: false,
    message: 'Too many contact submissions, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * POST /api/contact
 * Submit a contact form
 */
router.post('/', 
  contactRateLimit,
  [
    body('name').notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email').notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Email must be valid'),
    body('subject').optional()
      .isLength({ max: 200 }).withMessage('Subject cannot exceed 200 characters'),
    body('message').notEmpty().withMessage('Message is required')
      .isLength({ min: 10, max: 5000 }).withMessage('Message must be between 10 and 5000 characters')
  ],
  contactController.submitContact
);

/**
 * GET /api/contact
 * Get all contact submissions (admin only)
 */
router.get('/', adminOnly, contactController.getAllContacts);

/**
 * GET /api/contact/:id
 * Get a single contact submission by ID (admin only)
 */
router.get('/:id', adminOnly, contactController.getContactById);

/**
 * PATCH /api/contact/:id/status
 * Update a contact submission's status (admin only)
 */
router.patch('/:id/status', 
  adminOnly,
  [
    body('status').notEmpty().withMessage('Status is required')
      .isIn(['new', 'in_progress', 'completed', 'spam']).withMessage('Invalid status value')
  ],
  contactController.updateContactStatus
);

/**
 * DELETE /api/contact/:id
 * Delete a contact submission (admin only)
 */
router.delete('/:id', adminOnly, contactController.deleteContact);

module.exports = router;