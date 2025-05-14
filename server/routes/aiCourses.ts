import express from "express";
import { z } from "zod";
import { storage } from "../storage";
import { logger } from "../utils/logger";
import { isAuthenticated } from "../replitAuth";
import { 
  hasAccessToCourse, 
  hasAccessToLesson, 
  getAccessibleCourses 
} from "../utils/subscriptionAccess";

const router = express.Router();

// Input validation schemas
const lessonProgressSchema = z.object({
  status: z.enum(["started", "in_progress", "completed"]),
  progress: z.number().min(0).max(100).optional(),
  timeSpent: z.number().min(0).optional(),
  lastPosition: z.number().min(0).optional(),
});

const quizSubmissionSchema = z.object({
  answers: z.record(z.number()),
});

const codeFeedbackSchema = z.object({
  code: z.string(),
});

// Get all AI courses
router.get("/", async (req, res) => {
  try {
    const courses = await storage.getAiCourses();
    res.json(courses);
  } catch (error: any) {
    logger.error("Error fetching AI courses", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch AI courses",
    });
  }
});

// Get AI course categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await storage.getAiCourseCategories();
    res.json(categories);
  } catch (error: any) {
    logger.error("Error fetching AI course categories", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch AI course categories",
    });
  }
});

// Get specific AI course
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid course ID",
      });
    }
    
    const course = await storage.getAiCourse(courseId);
    
    if (!course) {
      return res.status(404).json({
        error: "Not Found",
        message: "Course not found",
      });
    }
    
    // Check if the user has access to this course
    const hasAccess = await hasAccessToCourse(userId, courseId);
    const hasFreeAccess = !hasAccess; // Used to determine which lessons to show

    // Get course modules and lessons
    const modules = await storage.getAiCourseModules(courseId);
    
    // For each module, get its lessons
    const modulesWithLessons = await Promise.all(
      modules.map(async (module) => {
        const lessons = await storage.getAiCourseLessons(module.id);
        
        // If user doesn't have full access, determine which lessons they can access
        if (hasFreeAccess) {
          const accessibleLessons = await Promise.all(
            lessons.map(async (lesson) => {
              const canAccess = await hasAccessToLesson(userId, courseId, module.id, lesson.id);
              return {
                ...lesson,
                isAccessible: canAccess,
              };
            })
          );
          
          return {
            ...module,
            lessons: accessibleLessons,
          };
        }
        
        // If user has full access, mark all lessons as accessible
        return {
          ...module,
          lessons: lessons.map(lesson => ({
            ...lesson,
            isAccessible: true,
          })),
        };
      })
    );
    
    res.json({
      ...course,
      modules: modulesWithLessons,
      hasFullAccess: hasAccess,
    });
  } catch (error: any) {
    logger.error("Error fetching AI course", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch AI course",
    });
  }
});

// Get specific lesson
router.get("/lessons/:id", isAuthenticated, async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (isNaN(lessonId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid lesson ID",
      });
    }
    
    const lesson = await storage.getAiCourseLesson(lessonId);
    
    if (!lesson) {
      return res.status(404).json({
        error: "Not Found",
        message: "Lesson not found",
      });
    }
    // Get the module this lesson belongs to
    const module = await storage.getAiCourseModuleByLessonId(lessonId);
    
    if (!module) {
      return res.status(404).json({
        error: "Not Found",
        message: "Lesson module not found",
      });
    }
    
    // Get the course this module belongs to
    const course = await storage.getAiCourse(module.courseId);
    
    if (!course) {
      return res.status(404).json({
        error: "Not Found",
        message: "Course not found",
      });
    }
    
    // Check if the user has access to this lesson
    const hasAccess = await hasAccessToLesson(userId, module.courseId, module.id, lessonId);
    
    if (!hasAccess) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You don't have access to this lesson. Please upgrade your subscription to access this content.",
        requiresSubscription: true,
        courseId: module.courseId,
        subscriptionInfo: {
          url: "/pricing",
        },
      });
    }
    
    res.json({
      ...lesson,
      courseId: module.courseId,
      moduleId: module.id,
    });
  } catch (error: any) {
    logger.error("Error fetching lesson", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch lesson",
    });
  }
});

// Get lesson quizzes
router.get("/lessons/:id/quizzes", isAuthenticated, async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (isNaN(lessonId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid lesson ID",
      });
    }
    
    // Get the module this lesson belongs to
    const module = await storage.getAiCourseModuleByLessonId(lessonId);
    
    if (!module) {
      return res.status(404).json({
        error: "Not Found",
        message: "Lesson module not found",
      });
    }
    
    // Check if the user has access to this lesson
    const hasAccess = await hasAccessToLesson(userId, module.courseId, module.id, lessonId);
    
    if (!hasAccess) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You don't have access to this lesson's quizzes. Please upgrade your subscription to access this content.",
        requiresSubscription: true,
        courseId: module.courseId,
        subscriptionInfo: {
          url: "/pricing",
        },
      });
    }
    
    // Get quizzes for the lesson
    const quizzes = await storage.getAiCourseQuizzes(lessonId);
    
    res.json(quizzes);
  } catch (error: any) {
    logger.error("Error fetching lesson quizzes", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch lesson quizzes",
    });
  }
});

// Get user's course enrollments
router.get("/enrollments", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.claims.sub;
    
    const enrollments = await storage.getUserAiCourseEnrollments(userId);
    
    res.json(enrollments);
  } catch (error: any) {
    logger.error("Error fetching user enrollments", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch user enrollments",
    });
  }
});

// Get course progress for a user
router.get("/:id/progress", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.claims.sub;
    const courseId = parseInt(req.params.id);
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid course ID",
      });
    }
    
    // Check if user is enrolled
    const enrollment = await storage.getUserCourseEnrollment(userId, courseId);
    
    if (!enrollment) {
      return res.status(404).json({
        error: "Not Found",
        message: "User is not enrolled in this course",
      });
    }
    
    // Get lesson progress
    const lessonProgress = await storage.getUserLessonProgress(userId, courseId);
    
    // Calculate overall progress
    const course = await storage.getAiCourse(courseId);
    const modules = await storage.getAiCourseModules(courseId);
    
    let totalLessons = 0;
    for (const module of modules) {
      const lessons = await storage.getAiCourseLessons(module.id);
      totalLessons += lessons.length;
    }
    
    const completedLessons = lessonProgress.filter(p => p.status === "completed").length;
    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    res.json({
      enrollment,
      lessonProgress,
      overallProgress,
    });
  } catch (error: any) {
    logger.error("Error fetching course progress", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch course progress",
    });
  }
});

// Enroll in a course
router.post("/:id/enroll", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.claims.sub;
    const courseId = parseInt(req.params.id);
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid course ID",
      });
    }
    
    // Check if already enrolled
    const existingEnrollment = await storage.getUserCourseEnrollment(userId, courseId);
    
    if (existingEnrollment) {
      return res.status(409).json({
        error: "Conflict",
        message: "User is already enrolled in this course",
      });
    }
    
    // Create enrollment
    const enrollment = await storage.createAiCourseEnrollment({
      userId,
      courseId,
      enrollmentDate: new Date(),
      status: "active",
      completionStatus: null,
      completionDate: null,
      lastAccessDate: new Date(),
    });
    
    res.status(201).json(enrollment);
  } catch (error: any) {
    logger.error("Error enrolling in course", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to enroll in course",
    });
  }
});

// Update lesson progress
router.post("/lessons/:id/progress", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.claims.sub;
    const lessonId = parseInt(req.params.id);
    
    if (isNaN(lessonId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid lesson ID",
      });
    }
    
    // Validate input
    const validationResult = lessonProgressSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid progress data",
        details: validationResult.error.format(),
      });
    }
    
    const data = validationResult.data;
    
    // Get the lesson to find its courseId
    const lesson = await storage.getAiCourseLesson(lessonId);
    
    if (!lesson) {
      return res.status(404).json({
        error: "Not Found",
        message: "Lesson not found",
      });
    }
    
    // Get the module to find its courseId
    const module = await storage.getAiCourseModule(lesson.moduleId);
    
    if (!module) {
      return res.status(404).json({
        error: "Not Found",
        message: "Module not found",
      });
    }
    
    const courseId = module.courseId;
    
    // Check if user is enrolled
    const enrollment = await storage.getUserCourseEnrollment(userId, courseId);
    
    if (!enrollment) {
      return res.status(403).json({
        error: "Forbidden",
        message: "User is not enrolled in this course",
      });
    }
    
    // Update or create progress
    const existingProgress = await storage.getLessonProgress(userId, lessonId);
    
    let progress;
    
    if (existingProgress) {
      progress = await storage.updateLessonProgress(userId, lessonId, {
        status: data.status,
        progress: data.progress,
        timeSpent: data.timeSpent,
        lastPosition: data.lastPosition,
        lastUpdated: new Date(),
      });
    } else {
      progress = await storage.createLessonProgress({
        userId,
        lessonId,
        status: data.status,
        progress: data.progress || 0,
        timeSpent: data.timeSpent || 0,
        lastPosition: data.lastPosition || 0,
        createdAt: new Date(),
        lastUpdated: new Date(),
      });
    }
    
    // Update enrollment lastAccessDate
    await storage.updateAiCourseEnrollment(enrollment.id, {
      lastAccessDate: new Date(),
    });
    
    // If completed, check if all lessons are completed to update course completion status
    if (data.status === "completed") {
      // Get all lessons in the course
      const modules = await storage.getAiCourseModules(courseId);
      
      let allLessons = [];
      for (const module of modules) {
        const lessons = await storage.getAiCourseLessons(module.id);
        allLessons = [...allLessons, ...lessons];
      }
      
      // Get progress for all lessons
      const allProgress = await Promise.all(
        allLessons.map(lesson => storage.getLessonProgress(userId, lesson.id))
      );
      
      // Check if all lessons are completed
      const allCompleted = allProgress.every(p => p && p.status === "completed");
      
      if (allCompleted) {
        await storage.updateAiCourseEnrollment(enrollment.id, {
          completionStatus: "completed",
          completionDate: new Date(),
        });
      }
    }
    
    res.json(progress);
  } catch (error: any) {
    logger.error("Error updating lesson progress", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update lesson progress",
    });
  }
});

// Complete a lesson
router.post("/lessons/:id/complete", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.claims.sub;
    const lessonId = parseInt(req.params.id);
    
    if (isNaN(lessonId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid lesson ID",
      });
    }
    
    // Get the lesson to find its courseId
    const lesson = await storage.getAiCourseLesson(lessonId);
    
    if (!lesson) {
      return res.status(404).json({
        error: "Not Found",
        message: "Lesson not found",
      });
    }
    
    // Get the module to find its courseId
    const module = await storage.getAiCourseModule(lesson.moduleId);
    
    if (!module) {
      return res.status(404).json({
        error: "Not Found",
        message: "Module not found",
      });
    }
    
    const courseId = module.courseId;
    
    // Check if user is enrolled
    const enrollment = await storage.getUserCourseEnrollment(userId, courseId);
    
    if (!enrollment) {
      return res.status(403).json({
        error: "Forbidden",
        message: "User is not enrolled in this course",
      });
    }
    
    // Update or create progress with completed status
    const existingProgress = await storage.getLessonProgress(userId, lessonId);
    
    let progress;
    
    if (existingProgress) {
      progress = await storage.updateLessonProgress(userId, lessonId, {
        status: "completed",
        progress: 100,
        lastUpdated: new Date(),
      });
    } else {
      progress = await storage.createLessonProgress({
        userId,
        lessonId,
        status: "completed",
        progress: 100,
        timeSpent: 0,
        lastPosition: 0,
        createdAt: new Date(),
        lastUpdated: new Date(),
      });
    }
    
    // Update enrollment lastAccessDate
    await storage.updateAiCourseEnrollment(enrollment.id, {
      lastAccessDate: new Date(),
    });
    
    // Check if all lessons are completed to update course completion status
    const modules = await storage.getAiCourseModules(courseId);
    
    let allLessons = [];
    for (const moduleItem of modules) {
      const lessons = await storage.getAiCourseLessons(moduleItem.id);
      allLessons = [...allLessons, ...lessons];
    }
    
    // Get progress for all lessons
    const allProgress = await Promise.all(
      allLessons.map(lesson => storage.getLessonProgress(userId, lesson.id))
    );
    
    // Check if all lessons are completed
    const allCompleted = allProgress.every(p => p && p.status === "completed");
    
    if (allCompleted) {
      await storage.updateAiCourseEnrollment(enrollment.id, {
        completionStatus: "completed",
        completionDate: new Date(),
      });
    }
    
    res.json(progress);
  } catch (error: any) {
    logger.error("Error completing lesson", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to complete lesson",
    });
  }
});

// Check quiz answers
router.post("/quizzes/:id/check", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.claims.sub;
    const quizId = parseInt(req.params.id);
    
    if (isNaN(quizId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid quiz ID",
      });
    }
    
    // Validate input
    const validationResult = quizSubmissionSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid quiz submission",
        details: validationResult.error.format(),
      });
    }
    
    const data = validationResult.data;
    
    // Get the quiz
    const quiz = await storage.getAiCourseQuiz(quizId);
    
    if (!quiz) {
      return res.status(404).json({
        error: "Not Found",
        message: "Quiz not found",
      });
    }
    
    // Check answer
    const userAnswer = data.answers[quizId];
    const isCorrect = userAnswer === quiz.correctOption;
    
    // Store the quiz attempt
    await storage.createAiQuizAttempt({
      userId,
      quizId,
      answer: userAnswer,
      correct: isCorrect,
      attemptedAt: new Date(),
    });
    
    // Generate feedback based on answer
    let feedback = "";
    
    if (isCorrect) {
      feedback = quiz.correctFeedback || "Correct! You got the right answer.";
    } else {
      feedback = quiz.incorrectFeedback || 
        `Incorrect. The correct answer is: ${quiz.options[quiz.correctOption]}`;
    }
    
    res.json({
      correct: isCorrect,
      feedback,
    });
  } catch (error: any) {
    logger.error("Error checking quiz answer", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to check quiz answer",
    });
  }
});

// Get AI feedback on code
router.post("/lessons/:id/code-feedback", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.claims.sub;
    const lessonId = parseInt(req.params.id);
    
    if (isNaN(lessonId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid lesson ID",
      });
    }
    
    // Validate input
    const validationResult = codeFeedbackSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid code submission",
        details: validationResult.error.format(),
      });
    }
    
    const data = validationResult.data;
    
    // Get the lesson to find its courseId
    const lesson = await storage.getAiCourseLesson(lessonId);
    
    if (!lesson) {
      return res.status(404).json({
        error: "Not Found",
        message: "Lesson not found",
      });
    }
    
    // Get the module to find its courseId
    const module = await storage.getAiCourseModule(lesson.moduleId);
    
    if (!module) {
      return res.status(404).json({
        error: "Not Found",
        message: "Module not found",
      });
    }
    
    const courseId = module.courseId;
    
    // Check if user is enrolled
    const enrollment = await storage.getUserCourseEnrollment(userId, courseId);
    
    if (!enrollment) {
      return res.status(403).json({
        error: "Forbidden",
        message: "User is not enrolled in this course",
      });
    }
    
    // In a real implementation, send the code to an AI service for analysis
    // Here we'll generate some sample feedback
    
    // Store the code submission
    await storage.createAiCodeSubmission({
      userId,
      lessonId,
      code: data.code,
      submittedAt: new Date(),
    });
    
    // Example feedback patterns
    const feedbackPatterns = [
      "Your solution is good! Consider adding error handling for edge cases.",
      "Great work! You might want to add comments to explain your logic.",
      "Your code works, but there's an opportunity to make it more efficient by using a different approach.",
      "Good job! Some variables could be renamed for better clarity.",
      "This solution works, but consider refactoring to make it more maintainable."
    ];
    
    // Randomly select a feedback pattern
    const feedback = feedbackPatterns[Math.floor(Math.random() * feedbackPatterns.length)];
    
    res.json({
      feedback,
    });
  } catch (error: any) {
    logger.error("Error generating code feedback", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to generate code feedback",
    });
  }
});

export default router;