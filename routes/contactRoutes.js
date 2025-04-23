/**
 * Contact API Routes
 * 
 * This module defines routes for handling contact form submissions,
 * management, and retrieval. It includes rate limiting to prevent abuse.
 */

const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { validateContactRequest } = require('../middlewares/validator');
const { contactLimiter, apiLimiter } = require('../middlewares/rateLimiter');

/**
 * @route   POST /api/contact
 * @desc    Submit a contact form
 * @access  Public (rate limited)
 * 
 * Request body:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "phone": "1234567890" (optional),
 *   "subject": "Service Inquiry",
 *   "message": "I would like to know more about...",
 *   "companyName": "Acme Corp" (optional)
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
router.post('/', contactLimiter, validateContactRequest, contactController.submitContact);

/**
 * @route   GET /api/contact
 * @desc    Get all contact submissions (with pagination and filtering)
 * @access  Admin
 * 
 * Query Parameters:
 * - page (default: 1)
 * - limit (default: 10)
 * - status (optional: 'pending', 'in_progress', 'completed', 'rejected')
 * - sortBy (default: 'created_at')
 * - sortOrder (default: 'desc')
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
 *         "phone": "1234567890",
 *         "subject": "Service Inquiry",
 *         "message": "I would like to know more about...",
 *         "company_name": "Acme Corp",
 *         "status": "pending",
 *         "created_at": "2025-04-23T12:34:56.789Z",
 *         "updated_at": "2025-04-23T12:34:56.789Z"
 *       },
 *       ...
 *     ],
 *     "pagination": {
 *       "total": 45,
 *       "totalPages": 5,
 *       "currentPage": 1,
 *       "limit": 10,
 *       "hasNextPage": true,
 *       "hasPreviousPage": false
 *     }
 *   }
 * }
 */
router.get('/', apiLimiter, contactController.getAllContacts);

/**
 * @route   GET /api/contact/counts
 * @desc    Get contact submission counts by status
 * @access  Admin
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "total": 45,
 *     "statusCounts": {
 *       "pending": 20,
 *       "in_progress": 15,
 *       "completed": 5,
 *       "rejected": 5
 *     }
 *   }
 * }
 */
router.get('/counts', apiLimiter, contactController.getContactCounts);

/**
 * @route   GET /api/contact/:id
 * @desc    Get a specific contact submission by ID
 * @access  Admin
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 123,
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "phone": "1234567890",
 *     "subject": "Service Inquiry",
 *     "message": "I would like to know more about...",
 *     "company_name": "Acme Corp",
 *     "status": "pending",
 *     "ip_address": "192.168.1.1",
 *     "user_agent": "Mozilla/5.0...",
 *     "created_at": "2025-04-23T12:34:56.789Z",
 *     "updated_at": "2025-04-23T12:34:56.789Z"
 *   }
 * }
 */
router.get('/:id', apiLimiter, contactController.getContactById);

/**
 * @route   PATCH /api/contact/:id/status
 * @desc    Update contact submission status
 * @access  Admin
 * 
 * Request body:
 * {
 *   "status": "in_progress",
 *   "notes": "Assigned to sales team" (optional)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 123,
 *     "status": "in_progress",
 *     "updated_at": "2025-04-23T13:45:12.345Z"
 *   },
 *   "message": "Contact submission status updated successfully"
 * }
 */
router.patch('/:id/status', apiLimiter, contactController.updateContactStatus);

/**
 * @route   DELETE /api/contact/:id
 * @desc    Delete a contact submission
 * @access  Admin
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 123
 *   },
 *   "message": "Contact submission deleted successfully"
 * }
 */
router.delete('/:id', apiLimiter, contactController.deleteContact);

module.exports = router;