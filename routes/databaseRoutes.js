/**
 * Database Routes
 * 
 * Routes for database-related functionality
 */

const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// Public test route
router.get('/test', databaseController.testConnection);

// Admin routes (require authentication and admin role)
router.get('/tables', authMiddleware, adminMiddleware, databaseController.getTables);
router.get('/tables/:tableName/columns', authMiddleware, adminMiddleware, databaseController.getTableColumns);
router.get('/status', authMiddleware, adminMiddleware, databaseController.getStatus);

module.exports = router;