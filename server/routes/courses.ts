import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { logger } from '../utils/logger';
import { isAuthenticated } from '../middlewares/auth';
import { z } from 'zod';
import { validateRequest } from '../middlewares/validate';
import { 
  insertCourseSchema, 
  insertCourseModuleSchema, 
  insertLessonSchema,
  insertQuizQuestionSchema,
  insertCourseResourceSchema,
  insertUserCourseEnrollmentSchema,
  insertUserLessonCompletionSchema,
  insertUserQuizAttemptSchema,
  insertCourseRatingSchema
} from '@shared/schema';

const router = Router();

// Validation schemas
const courseIdParam = z.object({
  id: z.coerce.number()
});

const moduleIdParam = z.object({
  id: z.coerce.number()
});

const lessonIdParam = z.object({
  id: z.coerce.number()
});

const courseProgressParams = z.object({
  courseId: z.coerce.number(),
  progress: z.number().int().min(0).max(100),
  currentLessonId: z.number().int().optional()
});

/**
 * @route GET /api/courses
 * @desc Get all available courses
 * @access Public (with subscription level filtering)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { level, category, featured, limit } = req.query;
    let courses;
    
    if (featured === 'true') {
      courses = await storage.getFeaturedCourses(limit ? parseInt(limit as string) : undefined);
    } else if (category) {
      courses = await storage.getCoursesByCategory(
        category as string,
        limit ? parseInt(limit as string) : undefined
      );
    } else if (level) {
      courses = await storage.getCoursesBySubscriptionLevel(
        level as string,
        limit ? parseInt(limit as string) : undefined
      );
    } else {
      courses = await storage.getAllCourses(limit ? parseInt(limit as string) : undefined);
    }
    
    res.json(courses);
  } catch (error) {
    logger.error('Error fetching courses', { error });
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

/**
 * @route GET /api/courses/:id
 * @desc Get course details by ID
 * @access Public
 */
router.get('/:id', validateRequest({ params: courseIdParam }), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const course = await storage.getCourseById(parseInt(id));
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Get course modules
    const modules = await storage.getCourseModules(course.id);
    
    // Get course resources
    const resources = await storage.getCourseResources(course.id);
    
    // Get course ratings
    const ratings = await storage.getCourseRatings(course.id);
    
    // Calculate average rating
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
      : 0;
    
    res.json({
      ...course,
      modules,
      resources,
      ratings,
      avgRating
    });
  } catch (error) {
    logger.error('Error fetching course details', { error, courseId: req.params.id });
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
});

/**
 * @route GET /api/courses/:id/modules
 * @desc Get modules for a specific course
 * @access Public
 */
router.get('/:id/modules', validateRequest({ params: courseIdParam }), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const modules = await storage.getCourseModules(parseInt(id));
    res.json(modules);
  } catch (error) {
    logger.error('Error fetching course modules', { error, courseId: req.params.id });
    res.status(500).json({ error: 'Failed to fetch course modules' });
  }
});

/**
 * @route GET /api/courses/:id/lessons
 * @desc Get all lessons for a course
 * @access Public
 */
router.get('/:id/lessons', validateRequest({ params: courseIdParam }), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lessons = await storage.getLessonsByCourseId(parseInt(id));
    res.json(lessons);
  } catch (error) {
    logger.error('Error fetching course lessons', { error, courseId: req.params.id });
    res.status(500).json({ error: 'Failed to fetch course lessons' });
  }
});

/**
 * @route GET /api/courses/modules/:id/lessons
 * @desc Get lessons for a specific module
 * @access Public
 */
router.get('/modules/:id/lessons', validateRequest({ params: moduleIdParam }), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lessons = await storage.getLessonsByModuleId(parseInt(id));
    res.json(lessons);
  } catch (error) {
    logger.error('Error fetching module lessons', { error, moduleId: req.params.id });
    res.status(500).json({ error: 'Failed to fetch module lessons' });
  }
});

/**
 * @route GET /api/courses/lessons/:id
 * @desc Get lesson details by ID
 * @access Public
 */
router.get('/lessons/:id', validateRequest({ params: lessonIdParam }), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lesson = await storage.getLessonById(parseInt(id));
    
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    // If lesson has a quiz, get the questions
    let questions = [];
    if (lesson.hasQuiz) {
      questions = await storage.getQuizQuestionsByLessonId(lesson.id);
    }
    
    res.json({
      ...lesson,
      questions: lesson.hasQuiz ? questions : []
    });
  } catch (error) {
    logger.error('Error fetching lesson details', { error, lessonId: req.params.id });
    res.status(500).json({ error: 'Failed to fetch lesson details' });
  }
});

/**
 * @route GET /api/courses/:id/resources
 * @desc Get resources for a specific course
 * @access Public
 */
router.get('/:id/resources', validateRequest({ params: courseIdParam }), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resources = await storage.getCourseResources(parseInt(id));
    res.json(resources);
  } catch (error) {
    logger.error('Error fetching course resources', { error, courseId: req.params.id });
    res.status(500).json({ error: 'Failed to fetch course resources' });
  }
});

/**
 * @route POST /api/courses/:id/enroll
 * @desc Enroll a user in a course
 * @access Private
 */
router.post('/:id/enroll', isAuthenticated, validateRequest({ params: courseIdParam }), async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    // Check if user is already enrolled
    const existingEnrollment = await storage.getUserEnrollmentForCourse(userId, courseId);
    
    if (existingEnrollment) {
      return res.status(400).json({ error: 'User is already enrolled in this course' });
    }
    
    // Get the course to check if it exists and get subscription level
    const course = await storage.getCourseById(courseId);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Check if user has an active subscription with required level
    const userSubscription = await storage.getUserActiveSubscription(userId);
    
    if (!userSubscription) {
      return res.status(403).json({ error: 'Active subscription required for course enrollment' });
    }
    
    // Get subscription plan to check level
    const plan = await storage.getSubscriptionPlanById(userSubscription.planId);
    
    if (!plan) {
      return res.status(500).json({ error: 'Subscription plan not found' });
    }
    
    // Check if subscription level is sufficient for course
    const subscriptionLevels = {
      'starter': 1,
      'professional': 2,
      'enterprise': 3
    };
    
    const userLevel = subscriptionLevels[plan.name.toLowerCase()] || 0;
    const requiredLevel = subscriptionLevels[course.requiredSubscriptionLevel.toLowerCase()] || 0;
    
    if (userLevel < requiredLevel) {
      return res.status(403).json({ 
        error: 'Subscription level insufficient', 
        requiredLevel: course.requiredSubscriptionLevel,
        currentLevel: plan.name
      });
    }
    
    // Create enrollment
    const enrollmentData = {
      userId,
      courseId,
      enrolledAt: new Date(),
      progress: 0
    };
    
    const enrollment = await storage.enrollUserInCourse(enrollmentData);
    
    res.status(201).json(enrollment);
  } catch (error) {
    logger.error('Error enrolling in course', { error, courseId: req.params.id, userId: (req.user as any).id });
    res.status(500).json({ error: 'Failed to enroll in course' });
  }
});

/**
 * @route GET /api/courses/user/enrollments
 * @desc Get all courses a user is enrolled in
 * @access Private
 */
router.get('/user/enrollments', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const enrollments = await storage.getUserCourseEnrollments(userId);
    
    // Fetch course details for each enrollment
    const enrollmentsWithDetails = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await storage.getCourseById(enrollment.courseId);
        const currentLesson = enrollment.currentLessonId 
          ? await storage.getLessonById(enrollment.currentLessonId)
          : null;
        
        return {
          ...enrollment,
          course,
          currentLesson
        };
      })
    );
    
    res.json(enrollmentsWithDetails);
  } catch (error) {
    logger.error('Error fetching user enrollments', { error, userId: (req.user as any).id });
    res.status(500).json({ error: 'Failed to fetch user enrollments' });
  }
});

/**
 * @route PUT /api/courses/:id/progress
 * @desc Update a user's progress in a course
 * @access Private
 */
router.put('/:id/progress', isAuthenticated, validateRequest({ 
  params: courseIdParam,
  body: courseProgressParams
}), async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id);
    const userId = (req.user as any).id;
    const { progress, currentLessonId } = req.body;
    
    // Check if user is enrolled in the course
    const enrollment = await storage.getUserEnrollmentForCourse(userId, courseId);
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    // Update progress
    const updatedEnrollment = await storage.updateUserCourseProgress(
      userId, 
      courseId, 
      progress, 
      currentLessonId
    );
    
    res.json(updatedEnrollment);
  } catch (error) {
    logger.error('Error updating course progress', { 
      error, 
      courseId: req.params.id, 
      userId: (req.user as any).id 
    });
    res.status(500).json({ error: 'Failed to update course progress' });
  }
});

/**
 * @route POST /api/courses/lessons/:id/complete
 * @desc Mark a lesson as completed
 * @access Private
 */
router.post('/lessons/:id/complete', isAuthenticated, validateRequest({ 
  params: lessonIdParam,
  body: z.object({
    timeSpentMinutes: z.number().int().min(0)
  })
}), async (req: Request, res: Response) => {
  try {
    const lessonId = parseInt(req.params.id);
    const userId = (req.user as any).id;
    const { timeSpentMinutes } = req.body;
    
    // Get the lesson to find its course
    const lesson = await storage.getLessonById(lessonId);
    
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    // Check if user is enrolled in the course
    const module = await storage.getCourseModules(lesson.moduleId);
    
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    const enrollment = await storage.getUserEnrollmentForCourse(userId, module[0].courseId);
    
    if (!enrollment) {
      return res.status(403).json({ error: 'User is not enrolled in this course' });
    }
    
    // Create lesson completion
    const completionData = {
      userId,
      lessonId,
      completedAt: new Date(),
      timeSpentMinutes
    };
    
    const completion = await storage.markLessonCompleted(completionData);
    
    // Recalculate course progress
    const allLessons = await storage.getLessonsByCourseId(module[0].courseId);
    const completedLessons = await storage.getUserLessonCompletions(userId, module[0].courseId);
    
    const progress = Math.round((completedLessons.length / allLessons.length) * 100);
    
    // Update course progress
    await storage.updateUserCourseProgress(userId, module[0].courseId, progress, lessonId);
    
    res.status(201).json({
      completion,
      progress
    });
  } catch (error) {
    logger.error('Error completing lesson', { 
      error, 
      lessonId: req.params.id, 
      userId: (req.user as any).id 
    });
    res.status(500).json({ error: 'Failed to complete lesson' });
  }
});

/**
 * @route POST /api/courses/lessons/:id/quiz-attempt
 * @desc Submit a quiz attempt
 * @access Private
 */
router.post('/lessons/:id/quiz-attempt', isAuthenticated, validateRequest({ 
  params: lessonIdParam,
  body: z.object({
    score: z.number().int().min(0).max(100),
    correctAnswers: z.number().int().min(0),
    totalQuestions: z.number().int().min(1),
    timeSpentMinutes: z.number().int().min(0)
  })
}), async (req: Request, res: Response) => {
  try {
    const lessonId = parseInt(req.params.id);
    const userId = (req.user as any).id;
    const { score, correctAnswers, totalQuestions, timeSpentMinutes } = req.body;
    
    // Get the lesson to find its course
    const lesson = await storage.getLessonById(lessonId);
    
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    if (!lesson.hasQuiz) {
      return res.status(400).json({ error: 'This lesson does not have a quiz' });
    }
    
    // Submit quiz attempt
    const attemptData = {
      userId,
      lessonId,
      score,
      correctAnswers,
      totalQuestions,
      completedAt: new Date(),
      timeSpentMinutes
    };
    
    const attempt = await storage.submitQuizAttempt(attemptData);
    
    res.status(201).json(attempt);
  } catch (error) {
    logger.error('Error submitting quiz attempt', { 
      error, 
      lessonId: req.params.id, 
      userId: (req.user as any).id 
    });
    res.status(500).json({ error: 'Failed to submit quiz attempt' });
  }
});

/**
 * @route POST /api/courses/:id/rate
 * @desc Rate a course
 * @access Private
 */
router.post('/:id/rate', isAuthenticated, validateRequest({ 
  params: courseIdParam,
  body: z.object({
    rating: z.number().int().min(1).max(5),
    review: z.string().optional()
  })
}), async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id);
    const userId = (req.user as any).id;
    const { rating, review } = req.body;
    
    // Check if user is enrolled in the course
    const enrollment = await storage.getUserEnrollmentForCourse(userId, courseId);
    
    if (!enrollment) {
      return res.status(403).json({ error: 'User is not enrolled in this course' });
    }
    
    // Check if user has already rated the course
    const existingRating = await storage.getUserCourseRating(userId, courseId);
    
    if (existingRating) {
      return res.status(400).json({ error: 'User has already rated this course' });
    }
    
    // Create rating
    const ratingData = {
      userId,
      courseId,
      rating,
      review
    };
    
    const newRating = await storage.rateCourse(ratingData);
    
    res.status(201).json(newRating);
  } catch (error) {
    logger.error('Error rating course', { 
      error, 
      courseId: req.params.id, 
      userId: (req.user as any).id 
    });
    res.status(500).json({ error: 'Failed to rate course' });
  }
});

export default router;