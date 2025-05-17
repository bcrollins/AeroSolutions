import express from 'express';
import { enrollmentController } from '../../controllers/enrollmentController';
import { isAuthenticated } from '../../replitAuth';

const router = express.Router();

// All enrollment routes require authentication
router.use(isAuthenticated);

// Enroll in a course
router.post('/courses/:courseId/enroll', enrollmentController.enrollInCourse);

// Get all enrolled courses for the current user
router.get('/enrollments', enrollmentController.getEnrolledCourses);

// Check enrollment status for a specific course
router.get('/courses/:courseId/enrollment', enrollmentController.checkEnrollment);

// Get course progress for a specific course
router.get('/courses/:courseId/progress', enrollmentController.getCourseProgress);

// Update lesson progress
router.post('/lessons/:lessonId/progress', enrollmentController.updateLessonProgress);

export default router;