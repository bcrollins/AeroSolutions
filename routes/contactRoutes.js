/**
 * Contact Routes
 * 
 * Routes for contact form functionality
 */

const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { validateContactRequest } = require('../middlewares/validator');
const { contactLimiter, apiLimiter } = require('../middlewares/rateLimiter');

/**
 * @route POST /api/contact
 * @desc Submit a contact form
 * @access Public
 */
router.post(
  '/', 
  contactLimiter, 
  validateContactRequest, 
  contactController.submitContact
);

/**
 * @route GET /api/contact
 * @desc Get all contact submissions
 * @access Admin only
 */
router.get(
  '/', 
  apiLimiter, 
  contactController.getAllContacts
);

/**
 * @route GET /api/contact/counts
 * @desc Get contact submission counts by status
 * @access Admin only
 */
router.get(
  '/counts', 
  apiLimiter, 
  contactController.getContactCounts
);

/**
 * @route GET /api/contact/:id
 * @desc Get contact submission by ID
 * @access Admin only
 */
router.get(
  '/:id', 
  apiLimiter, 
  contactController.getContactById
);

/**
 * @route PATCH /api/contact/:id
 * @desc Update contact submission status
 * @access Admin only
 */
router.patch(
  '/:id', 
  apiLimiter, 
  contactController.updateContactStatus
);

/**
 * @route DELETE /api/contact/:id
 * @desc Delete contact submission
 * @access Admin only
 */
router.delete(
  '/:id', 
  apiLimiter, 
  contactController.deleteContact
);

module.exports = router;