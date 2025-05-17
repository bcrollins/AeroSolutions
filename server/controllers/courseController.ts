import { Request, Response } from 'express';
import { courseService } from '../services/courseService';

/**
 * Controller for course-related routes
 */
export const courseController = {
  /**
   * Get all courses
   */
  async getAllCourses(req: Request, res: Response) {
    try {
      const courses = await courseService.getAllCourses();
      res.json(courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ message: 'Failed to fetch courses' });
    }
  },

  /**
   * Get a specific course by ID
   */
  async getCourseById(req: Request, res: Response) {
    try {
      const courseId = parseInt(req.params.id);
      
      if (isNaN(courseId)) {
        return res.status(400).json({ message: 'Invalid course ID' });
      }
      
      const course = await courseService.getCourseById(courseId);
      
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      // Get modules for the course
      const modules = await courseService.getCourseModules(courseId);
      
      // Get lessons for each module
      const modulesWithLessons = await Promise.all(
        modules.map(async (module) => {
          const lessons = await courseService.getModuleLessons(module.id);
          return {
            ...module,
            lessons
          };
        })
      );
      
      // Return course with modules and lessons
      res.json({
        ...course,
        modules: modulesWithLessons
      });
    } catch (error) {
      console.error('Error fetching course:', error);
      res.status(500).json({ message: 'Failed to fetch course' });
    }
  },

  /**
   * Get a specific lesson by ID
   */
  async getLessonById(req: Request, res: Response) {
    try {
      const lessonId = parseInt(req.params.id);
      
      if (isNaN(lessonId)) {
        return res.status(400).json({ message: 'Invalid lesson ID' });
      }
      
      const lesson = await courseService.getLessonById(lessonId);
      
      if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found' });
      }
      
      res.json(lesson);
    } catch (error) {
      console.error('Error fetching lesson:', error);
      res.status(500).json({ message: 'Failed to fetch lesson' });
    }
  },

  /**
   * Search courses
   */
  async searchCourses(req: Request, res: Response) {
    try {
      const term = req.query.term as string;
      
      if (!term) {
        return res.status(400).json({ message: 'Search term is required' });
      }
      
      const courses = await courseService.searchCourses(term);
      res.json(courses);
    } catch (error) {
      console.error('Error searching courses:', error);
      res.status(500).json({ message: 'Failed to search courses' });
    }
  }
};