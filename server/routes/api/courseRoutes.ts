import express from 'express';
import { courseController } from '../../controllers/courseController';
import { isAuthenticated } from '../../replitAuth';

const router = express.Router();

// Get all courses (public route)
router.get('/courses', courseController.getAllCourses);

// Get a specific course by ID (requires authentication)
router.get('/courses/:id', isAuthenticated, courseController.getCourseById);

// Get a specific lesson by ID (requires authentication)
router.get('/lessons/:id', isAuthenticated, courseController.getLessonById);

// Search courses (public route)
router.get('/courses/search', courseController.searchCourses);

export default router;