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
const { apiLimiter, sensitiveOperationsLimiter } = require('../middlewares/rateLimiter');
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
 *   "phone": "555-123-4567",       (optional)
 *   "subject": "Service Inquiry",
 *   "message": "I'm interested in your services...",
 *   "company": "Acme Inc."         (optional)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 123,
 *     "timestamp": "2025-04-23T12:34:56.789Z"
 *   },
 *   "message": "Contact form submitted successfully"
 * }
 */
router.post('/',
  apiLimiter,
  validateContactRequest,
  contactController.submitContact
);

/**
 * @route   GET /api/contact
 * @desc    Get all contact submissions (paginated)
 * @access  Admin
 * 
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 50)
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "contacts": [
 *       {
 *         "id": 123,
 *         "name": "John Doe",
 *         "email": "john@example.com",
 *         "subject": "Service Inquiry",
 *         "created_at": "2025-04-23T12:34:56.789Z"
 *       },
 *       ...
 *     ],
 *     "pagination": {
 *       "page": 1,
 *       "limit": 10,
 *       "totalItems": 45,
 *       "totalPages": 5
 *     }
 *   }
 * }
 */
router.get('/',
  sensitiveOperationsLimiter,
  // Authentication middleware would go here
  contactController.getContacts
);

/**
 * @route   GET /api/contact/:id
 * @desc    Get a specific contact submission by ID
 * @access  Admin
 * 
 * Path parameters:
 * - id: Contact ID
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 123,
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "phone": "555-123-4567",
 *     "subject": "Service Inquiry",
 *     "message": "I'm interested in your services...",
 *     "company_name": "Acme Inc.",
 *     "created_at": "2025-04-23T12:34:56.789Z",
 *     ...
 *   }
 * }
 */
router.get('/:id',
  sensitiveOperationsLimiter,
  // Authentication middleware would go here
  contactController.getContactById
);

module.exports = router;