/**
 * Contact Routes
 * 
 * This module defines routes for contact form submissions.
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
 * @desc    Submit contact form
 * @access  Public (rate limited)
 * 
 * Request body:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "phone": "555-123-4567", (optional)
 *   "subject": "General Inquiry",
 *   "message": "I would like to learn more about your services...",
 *   "companyName": "Acme Corp" (optional)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Contact form submitted successfully",
 *   "data": {
 *     "id": 123,
 *     "timestamp": "2025-04-23T12:34:56.789Z"
 *   }
 * }
 */
router.post('/', 
  contactLimiter,
  validateContactRequest,
  contactController.submitContact
);

module.exports = router;