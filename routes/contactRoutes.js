/**
 * Contact Routes
 * 
 * This module defines routes for contact form submission.
 */

const express = require('express');
const router = express.Router();

// Controller
const contactController = require('../controllers/contactController');

// Middleware
const { contactLimiter } = require('../middlewares/rateLimiter');
const { validateContactRequest } = require('../middlewares/validator');

/**
 * @route   POST /api/contact
 * @desc    Submit a contact form
 * @access  Public (rate limited)
 * 
 * Request body:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "phone": "555-123-4567",        (optional)
 *   "subject": "Service Inquiry",
 *   "message": "I would like more information about your services",
 *   "company": "Acme Inc."          (optional)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Contact form submitted successfully",
 *   "data": {
 *     "id": 1,
 *     "createdAt": "2025-04-23T12:34:56.789Z"
 *   }
 * }
 */
router.post('/', 
  contactLimiter,
  validateContactRequest,
  contactController.submitContact
);

/**
 * @route   GET /api/contact
 * @desc    Get all contact submissions (admin only)
 * @access  Admin
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "name": "John Doe",
 *       "email": "john@example.com",
 *       "phone": "555-123-4567",
 *       "subject": "Service Inquiry",
 *       "message": "I would like more information about your services",
 *       "company_name": "Acme Inc.",
 *       "created_at": "2025-04-23T12:34:56.789Z"
 *     },
 *     ...
 *   ]
 * }
 */
router.get('/', contactController.getContacts);

module.exports = router;