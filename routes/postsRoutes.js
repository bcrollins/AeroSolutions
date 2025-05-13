/**
 * Posts Routes
 * 
 * This module defines the routes for blog posts, including CRUD operations,
 * searching, filtering, and specialized endpoints for car events and AI Q&A.
 */

const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');
const authMiddleware = require('../server/middlewares/auth');
const { body, query, param } = require('express-validator');
const validateRequest = require('../server/middlewares/validate');

// Get all posts with optional filtering
router.get('/posts', 
  validateRequest([
    query('category').optional().isString(),
    query('postType').optional().isIn(['regular', 'car_event', 'ai_qa']),
    query('tag').optional().isString(),
    query('featured').optional().isBoolean(),
    query('premium').optional().isBoolean(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
    query('sort').optional().isIn(['newest', 'oldest', 'popular'])
  ]),
  postsController.getAllPosts
);

// Search posts
router.get('/posts/search',
  validateRequest([
    query('q').notEmpty().withMessage('Search query is required'),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ]),
  postsController.searchPosts
);

// Get related posts
router.get('/posts/related',
  validateRequest([
    query('category').optional().isString(),
    query('postType').optional().isString(),
    query('tag').optional().isString(),
    query('exclude').optional().isInt(),
    query('limit').optional().isInt({ min: 1, max: 10 })
  ]),
  postsController.getRelatedPosts
);

// Get upcoming car events
router.get('/posts/events/upcoming',
  validateRequest([
    query('limit').optional().isInt({ min: 1, max: 20 })
  ]),
  postsController.getUpcomingEvents
);

// Get a single post by slug
router.get('/posts/:slug',
  validateRequest([
    param('slug').isString().notEmpty()
  ]),
  postsController.getPostBySlug
);

// Create a new post (admin only)
router.post('/posts',
  authMiddleware.requireAuth,
  authMiddleware.requireAdmin,
  validateRequest([
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('slug').optional().isString(),
    body('postType').optional().isIn(['regular', 'car_event', 'ai_qa']),
    body('category').optional().isString(),
    body('tags').optional().isArray(),
    body('imageUrl').optional().isURL(),
    body('featuredPost').optional().isBoolean(),
    body('premium').optional().isBoolean(),
    body('eventDate').optional().isISO8601(),
    body('eventLocation').optional().isString(),
    body('eventOrganizer').optional().isString(),
    body('question').optional().isString(),
    body('generateWithAI').optional().isBoolean()
  ]),
  postsController.createPost
);

// Update a post (admin only)
router.put('/posts/:id',
  authMiddleware.requireAuth,
  authMiddleware.requireAdmin,
  validateRequest([
    param('id').isInt().withMessage('Valid post ID is required'),
    body('title').optional().isString(),
    body('content').optional().isString(),
    body('slug').optional().isString(),
    body('postType').optional().isIn(['regular', 'car_event', 'ai_qa']),
    body('category').optional().isString(),
    body('tags').optional().isArray(),
    body('imageUrl').optional().isURL(),
    body('featuredPost').optional().isBoolean(),
    body('premium').optional().isBoolean(),
    body('eventDate').optional().isISO8601(),
    body('eventLocation').optional().isString(),
    body('eventOrganizer').optional().isString(),
    body('question').optional().isString()
  ]),
  postsController.updatePost
);

// Delete a post (admin only)
router.delete('/posts/:id',
  authMiddleware.requireAuth,
  authMiddleware.requireAdmin,
  validateRequest([
    param('id').isInt().withMessage('Valid post ID is required')
  ]),
  postsController.deletePost
);

// Update post likes
router.post('/posts/:id/likes',
  validateRequest([
    param('id').isInt().withMessage('Valid post ID is required'),
    body('action').isIn(['increment', 'decrement']).withMessage('Action must be either "increment" or "decrement"')
  ]),
  postsController.updateLikes
);

module.exports = router;