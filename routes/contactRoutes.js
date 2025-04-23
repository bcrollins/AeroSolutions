/**
 * Contact Routes
 * 
 * API routes for contact form functionality
 */

const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const rateLimiter = require('../middlewares/rateLimiter');

/**
 * @route POST /api/contact
 * @desc Submit contact form
 * @access Public
 */
router.post('/', rateLimiter.standard, contactController.submitContact);

/**
 * @route GET /api/contact
 * @desc Get all contact submissions
 * @access Admin
 */
router.get('/', rateLimiter.api, contactController.getAllContacts);

/**
 * @route GET /api/contact/counts
 * @desc Get contact submission counts by status
 * @access Admin
 */
router.get('/counts', rateLimiter.api, contactController.getContactCounts);

/**
 * @route GET /api/contact/:id
 * @desc Get contact submission by ID
 * @access Admin
 */
router.get('/:id', rateLimiter.api, contactController.getContactById);

/**
 * @route PATCH /api/contact/:id
 * @desc Update contact submission status
 * @access Admin
 */
router.patch('/:id', rateLimiter.api, contactController.updateContactStatus);

/**
 * @route DELETE /api/contact/:id
 * @desc Delete contact submission
 * @access Admin
 */
router.delete('/:id', rateLimiter.api, contactController.deleteContact);

module.exports = router;