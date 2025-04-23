/**
 * Contact Routes
 * 
 * API routes for contact form functionality
 */

const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const limiter = require('../middlewares/rateLimiter');

/**
 * @route   POST /api/contact
 * @desc    Submit a contact form
 * @access  Public
 */
router.post(
  '/',
  limiter.default,
  contactController.contactValidationRules,
  contactController.submitContact
);

/**
 * @route   GET /api/contact
 * @desc    Get all contact submissions
 * @access  Admin
 */
router.get(
  '/',
  limiter.default,
  contactController.getAllContacts
);

/**
 * @route   GET /api/contact/counts
 * @desc    Get contact counts by status
 * @access  Admin
 */
router.get(
  '/counts',
  limiter.default,
  contactController.getContactCounts
);

/**
 * @route   GET /api/contact/:id
 * @desc    Get a contact submission by ID
 * @access  Admin
 */
router.get(
  '/:id',
  limiter.default,
  contactController.getContactById
);

/**
 * @route   PATCH /api/contact/:id/status
 * @desc    Update a contact submission's status
 * @access  Admin
 */
router.patch(
  '/:id/status',
  limiter.default,
  contactController.updateContactStatus
);

/**
 * @route   DELETE /api/contact/:id
 * @desc    Delete a contact submission
 * @access  Admin
 */
router.delete(
  '/:id',
  limiter.default,
  contactController.deleteContact
);

module.exports = router;