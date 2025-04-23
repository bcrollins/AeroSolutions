/**
 * Contact Routes
 * 
 * Routes for contact-related functionality
 */

const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// Public routes
router.post('/submit', contactController.submitContact);

// Admin routes (require authentication and admin role)
router.get('/', authMiddleware, adminMiddleware, contactController.getAllContacts);
router.get('/:id', authMiddleware, adminMiddleware, contactController.getContactById);
router.put('/:id/status', authMiddleware, adminMiddleware, contactController.updateContactStatus);
router.delete('/:id', authMiddleware, adminMiddleware, contactController.deleteContact);

module.exports = router;