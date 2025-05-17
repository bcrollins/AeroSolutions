import { Request, Response } from 'express';
import { enrollmentService } from '../services/enrollmentService';
import { courseService } from '../services/courseService';

/**
 * Controller for handling course enrollment operations
 */
export const enrollmentController = {
  /**
   * Enroll the current user in a course
   */
  async enrollInCourse(req: Request, res: Response) {
    try {
      const courseId = parseInt(req.params.courseId);
      
      if (isNaN(courseId)) {
        return res.status(400).json({ message: 'Invalid course ID' });
      }
      
      // Get user ID from authenticated session
      const userId = req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Check if course exists
      const course = await courseService.getCourseById(courseId);
      
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      // Enroll user in course
      const enrollment = await enrollmentService.enrollUserInCourse(userId, courseId);
      
      res.status(201).json({
        message: 'Successfully enrolled in course',
        enrollment
      });
    } catch (error) {
      console.error('Error enrolling in course:', error);
      res.status(500).json({ message: 'Failed to enroll in course' });
    }
  },

  /**
   * Get all courses the current user is enrolled in
   */
  async getEnrolledCourses(req: Request, res: Response) {
    try {
      // Get user ID from authenticated session
      const userId = req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Get user enrollments
      const enrollments = await enrollmentService.getUserEnrollments(userId);
      
      // For each enrollment, get the course details
      const enrolledCourses = await Promise.all(
        enrollments.map(async (enrollment) => {
          const course = await courseService.getCourseById(enrollment.courseId);
          return {
            ...enrollment,
            course
          };
        })
      );
      
      res.json(enrolledCourses);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      res.status(500).json({ message: 'Failed to fetch enrolled courses' });
    }
  },

  /**
   * Check if the current user is enrolled in a specific course
   */
  async checkEnrollment(req: Request, res: Response) {
    try {
      const courseId = parseInt(req.params.courseId);
      
      if (isNaN(courseId)) {
        return res.status(400).json({ message: 'Invalid course ID' });
      }
      
      // Get user ID from authenticated session
      const userId = req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Check enrollment
      const enrollment = await enrollmentService.checkEnrollment(userId, courseId);
      
      res.json({
        isEnrolled: !!enrollment,
        enrollment
      });
    } catch (error) {
      console.error('Error checking enrollment:', error);
      res.status(500).json({ message: 'Failed to check enrollment status' });
    }
  },

  /**
   * Get the current user's progress in a course
   */
  async getCourseProgress(req: Request, res: Response) {
    try {
      const courseId = parseInt(req.params.courseId);
      
      if (isNaN(courseId)) {
        return res.status(400).json({ message: 'Invalid course ID' });
      }
      
      // Get user ID from authenticated session
      const userId = req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Check if user is enrolled
      const enrollment = await enrollmentService.checkEnrollment(userId, courseId);
      
      if (!enrollment) {
        return res.status(403).json({ message: 'User is not enrolled in this course' });
      }
      
      // Get course progress
      const progress = await enrollmentService.getCourseProgress(userId, courseId);
      
      res.json({
        ...progress,
        enrollment
      });
    } catch (error) {
      console.error('Error fetching course progress:', error);
      res.status(500).json({ message: 'Failed to fetch course progress' });
    }
  },

  /**
   * Update progress for a specific lesson
   */
  async updateLessonProgress(req: Request, res: Response) {
    try {
      const lessonId = parseInt(req.params.lessonId);
      
      if (isNaN(lessonId)) {
        return res.status(400).json({ message: 'Invalid lesson ID' });
      }
      
      // Get user ID from authenticated session
      const userId = req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Validate request body
      const { completed, timeSpentMinutes, score } = req.body;
      
      // Update lesson progress
      const progress = await enrollmentService.updateLessonProgress(userId, lessonId, {
        completed,
        timeSpentMinutes,
        score
      });
      
      res.json({
        message: 'Progress updated successfully',
        progress
      });
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      res.status(500).json({ message: 'Failed to update lesson progress' });
    }
  }
};