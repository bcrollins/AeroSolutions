/**
 * Contact Form Routes
 * 
 * This module defines routes for contact form operations.
 */

const express = require('express');
const router = express.Router();

// Controller
const contactController = require('../controllers/contactController');

// Middleware
const { contactLimiter } = require('../middlewares/rateLimiter');
const { validateContactRequest } = require('../middlewares/validator');

/**
 * @route   POST /api/contact/submit
 * @desc    Submit a contact form
 * @access  Public (rate limited)
 * 
 * Request body:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "phone": "+1 555-1234",         (optional)
 *   "subject": "Service Inquiry",
 *   "message": "I'd like to inquire about your services...",
 *   "company": "Acme Corp"          (optional)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 123,
 *     "message": "Contact form submitted successfully",
 *     "timestamp": "2025-04-23T12:34:56.789Z"
 *   }
 * }
 */
router.post('/submit',
  contactLimiter,
  validateContactRequest,
  contactController.submitContact
);

/**
 * @route   GET /api/contact/list
 * @desc    Get list of contact submissions (admin only)
 * @access  Admin
 * 
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "contacts": [...],
 *     "pagination": {
 *       "total": 100,
 *       "page": 1,
 *       "limit": 20,
 *       "pages": 5,
 *       "hasMore": true
 *     }
 *   }
 * }
 */
router.get('/list', contactController.getContacts);

/**
 * @route   GET /api/contact/:id
 * @desc    Get a specific contact submission (admin only)
 * @access  Admin
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 123,
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     ...
 *   }
 * }
 */
router.get('/:id', contactController.getContactById);

module.exports = router;