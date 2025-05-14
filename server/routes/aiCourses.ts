import express from "express";
import { db } from "../db";
import { 
  aiCourses, 
  aiCourseCategories, 
  aiCourseModules, 
  aiCourseLessons, 
  aiCourseEnrollments,
  aiLessonProgress
} from "@shared/schema";
import { eq, like, and, or, desc, sql } from "drizzle-orm";
import { logger } from "../utils/logger";
import { isAuthenticated } from "../replitAuth";

const router = express.Router();

/**
 * Get all course categories
 */
router.get("/categories", async (req, res) => {
  try {
    const categories = await db.select().from(aiCourseCategories);
    res.json(categories);
  } catch (error) {
    logger.error("Error fetching course categories:", error);
    res.status(500).json({ message: "Failed to fetch course categories" });
  }
});

/**
 * Get all courses with optional filtering
 */
router.get("/", async (req, res) => {
  try {
    const { difficulty, categoryId, search, page = 1, limit = 10 } = req.query;
    
    // Build filter conditions
    const conditions = [];
    
    if (difficulty && difficulty !== 'all') {
      conditions.push(eq(aiCourses.difficulty, difficulty as string));
    }
    
    if (categoryId && categoryId !== 'all') {
      conditions.push(eq(aiCourses.categoryId, Number(categoryId)));
    }
    
    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          like(aiCourses.title, searchTerm),
          like(aiCourses.description, searchTerm)
        )
      );
    }
    
    // Only include published courses
    conditions.push(eq(aiCourses.isPublished, true));
    
    // Calculate pagination
    const offset = (Number(page) - 1) * Number(limit);
    
    // Execute query with filters
    let query = db.select().from(aiCourses);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const courses = await query
      .orderBy(desc(aiCourses.enrollmentCount))
      .limit(Number(limit))
      .offset(offset);
    
    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(aiCourses)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    const totalCount = countResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / Number(limit));
    
    res.json({
      courses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalCount,
        totalPages
      }
    });
  } catch (error) {
    logger.error("Error fetching courses:", error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
});

/**
 * Get details of a specific course by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const courseId = Number(req.params.id);
    
    // Get course details
    const [course] = await db
      .select()
      .from(aiCourses)
      .where(eq(aiCourses.id, courseId));
    
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    
    // Get course modules
    const modules = await db
      .select()
      .from(aiCourseModules)
      .where(eq(aiCourseModules.courseId, courseId))
      .orderBy(aiCourseModules.position);
    
    // Get lessons for each module
    const moduleIds = modules.map(module => module.id);
    const lessons = moduleIds.length > 0 
      ? await db
          .select()
          .from(aiCourseLessons)
          .where(sql`${aiCourseLessons.moduleId} IN (${moduleIds})`)
          .orderBy(aiCourseLessons.position)
      : [];
    
    // Organize lessons by module
    const modulesWithLessons = modules.map(module => ({
      ...module,
      lessons: lessons.filter(lesson => lesson.moduleId === module.id)
    }));
    
    res.json({
      ...course,
      modules: modulesWithLessons
    });
  } catch (error) {
    logger.error(`Error fetching course ${req.params.id}:`, error);
    res.status(500).json({ message: "Failed to fetch course details" });
  }
});

/**
 * Enroll a user in a course
 */
router.post("/:id/enroll", isAuthenticated, async (req, res) => {
  try {
    const courseId = Number(req.params.id);
    const userId = req.user.claims.sub;
    
    // Check if course exists
    const [course] = await db
      .select()
      .from(aiCourses)
      .where(eq(aiCourses.id, courseId));
    
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    
    // Check if user is already enrolled
    const [existingEnrollment] = await db
      .select()
      .from(aiCourseEnrollments)
      .where(
        and(
          eq(aiCourseEnrollments.userId, userId),
          eq(aiCourseEnrollments.courseId, courseId)
        )
      );
    
    if (existingEnrollment) {
      return res.status(409).json({ 
        message: "You are already enrolled in this course",
        enrollment: existingEnrollment
      });
    }
    
    // Create new enrollment
    const [enrollment] = await db
      .insert(aiCourseEnrollments)
      .values({
        userId,
        courseId,
        enrollmentDate: new Date(),
        completionStatus: "in_progress",
        progressPercentage: 0
      })
      .returning();
    
    // Increment enrollment count for the course
    await db
      .update(aiCourses)
      .set({ 
        enrollmentCount: sql`${aiCourses.enrollmentCount} + 1` 
      })
      .where(eq(aiCourses.id, courseId));
    
    res.status(201).json({ 
      message: "Successfully enrolled in the course",
      enrollment 
    });
  } catch (error) {
    logger.error(`Error enrolling in course ${req.params.id}:`, error);
    res.status(500).json({ message: "Failed to enroll in the course" });
  }
});

/**
 * Get all enrollments for current user
 */
router.get("/enrollments", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.claims.sub;
    
    const enrollments = await db
      .select({
        id: aiCourseEnrollments.id,
        courseId: aiCourseEnrollments.courseId,
        enrollmentDate: aiCourseEnrollments.enrollmentDate,
        completionStatus: aiCourseEnrollments.completionStatus,
        progressPercentage: aiCourseEnrollments.progressPercentage,
        title: aiCourses.title,
        thumbnail: aiCourses.thumbnail,
        difficulty: aiCourses.difficulty
      })
      .from(aiCourseEnrollments)
      .innerJoin(aiCourses, eq(aiCourseEnrollments.courseId, aiCourses.id))
      .where(eq(aiCourseEnrollments.userId, userId))
      .orderBy(desc(aiCourseEnrollments.enrollmentDate));
    
    res.json(enrollments);
  } catch (error) {
    logger.error("Error fetching user enrollments:", error);
    res.status(500).json({ message: "Failed to fetch enrollments" });
  }
});

/**
 * Get course progress for a specific course
 */
router.get("/:id/progress", isAuthenticated, async (req, res) => {
  try {
    const courseId = Number(req.params.id);
    const userId = req.user.claims.sub;
    
    // Check if user is enrolled in the course
    const [enrollment] = await db
      .select()
      .from(aiCourseEnrollments)
      .where(
        and(
          eq(aiCourseEnrollments.userId, userId),
          eq(aiCourseEnrollments.courseId, courseId)
        )
      );
    
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }
    
    // Get modules for this course
    const modules = await db
      .select()
      .from(aiCourseModules)
      .where(eq(aiCourseModules.courseId, courseId))
      .orderBy(aiCourseModules.position);
    
    // Get all lessons for these modules
    const moduleIds = modules.map(module => module.id);
    const lessons = moduleIds.length > 0
      ? await db
          .select()
          .from(aiCourseLessons)
          .where(sql`${aiCourseLessons.moduleId} IN (${moduleIds})`)
          .orderBy(aiCourseLessons.position)
      : [];
    
    // Get lesson progress for this user
    const lessonIds = lessons.map(lesson => lesson.id);
    const progress = lessonIds.length > 0
      ? await db
          .select()
          .from(aiLessonProgress)
          .where(
            and(
              eq(aiLessonProgress.userId, userId),
              sql`${aiLessonProgress.lessonId} IN (${lessonIds})`
            )
          )
      : [];
    
    // Calculate overall progress
    const totalLessons = lessons.length;
    const completedLessons = progress.filter(p => p.completed).length;
    const progressPercentage = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;
    
    // Organize modules with lessons and their progress
    const modulesWithProgress = modules.map(module => {
      const moduleLessons = lessons.filter(lesson => lesson.moduleId === module.id);
      const moduleLessonsWithProgress = moduleLessons.map(lesson => {
        const lessonProgress = progress.find(p => p.lessonId === lesson.id);
        return {
          id: lesson.id,
          title: lesson.title,
          duration: lesson.duration,
          position: lesson.position,
          progress: lessonProgress || {
            completed: false,
            progressPercentage: 0,
            lastAccessed: null
          }
        };
      });
      
      return {
        id: module.id,
        title: module.title,
        description: module.description,
        position: module.position,
        lessons: moduleLessonsWithProgress
      };
    });
    
    res.json({
      enrollment,
      modules: modulesWithProgress,
      overallProgress: {
        totalLessons,
        completedLessons,
        progressPercentage
      }
    });
  } catch (error) {
    logger.error(`Error fetching progress for course ${req.params.id}:`, error);
    res.status(500).json({ message: "Failed to fetch course progress" });
  }
});

/**
 * Update lesson progress
 */
router.post("/lessons/:id/progress", isAuthenticated, async (req, res) => {
  try {
    const lessonId = Number(req.params.id);
    const userId = req.user.claims.sub;
    const { completed, progressPercentage } = req.body;
    
    // Check if lesson exists
    const [lesson] = await db
      .select()
      .from(aiCourseLessons)
      .where(eq(aiCourseLessons.id, lessonId));
    
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    
    // Get module and course info
    const [module] = await db
      .select()
      .from(aiCourseModules)
      .where(eq(aiCourseModules.id, lesson.moduleId));
    
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }
    
    // Check if user is enrolled in the course
    const [enrollment] = await db
      .select()
      .from(aiCourseEnrollments)
      .where(
        and(
          eq(aiCourseEnrollments.userId, userId),
          eq(aiCourseEnrollments.courseId, module.courseId)
        )
      );
    
    if (!enrollment) {
      return res.status(403).json({ message: "You are not enrolled in this course" });
    }
    
    // Check if progress record exists
    const [existingProgress] = await db
      .select()
      .from(aiLessonProgress)
      .where(
        and(
          eq(aiLessonProgress.userId, userId),
          eq(aiLessonProgress.lessonId, lessonId)
        )
      );
    
    let progress;
    
    if (existingProgress) {
      // Update existing progress
      [progress] = await db
        .update(aiLessonProgress)
        .set({
          completed: completed ?? existingProgress.completed,
          progressPercentage: progressPercentage ?? existingProgress.progressPercentage,
          lastAccessed: new Date()
        })
        .where(eq(aiLessonProgress.id, existingProgress.id))
        .returning();
    } else {
      // Create new progress record
      [progress] = await db
        .insert(aiLessonProgress)
        .values({
          userId,
          lessonId,
          completed: completed ?? false,
          progressPercentage: progressPercentage ?? 0,
          lastAccessed: new Date()
        })
        .returning();
    }
    
    // Update overall course progress in enrollments
    // Get all lessons for this course
    const [courseModules] = await db
      .select({ id: aiCourseModules.id })
      .from(aiCourseModules)
      .where(eq(aiCourseModules.courseId, module.courseId));
    
    const courseLessons = await db
      .select({ id: aiCourseLessons.id })
      .from(aiCourseLessons)
      .where(eq(aiCourseLessons.moduleId, courseModules.id));
    
    const courseLessonIds = courseLessons.map(l => l.id);
    
    const lessonProgress = courseLessonIds.length > 0
      ? await db
          .select()
          .from(aiLessonProgress)
          .where(
            and(
              eq(aiLessonProgress.userId, userId),
              sql`${aiLessonProgress.lessonId} IN (${courseLessonIds})`
            )
          )
      : [];
    
    const totalLessons = courseLessons.length;
    const completedLessons = lessonProgress.filter(p => p.completed).length;
    const courseProgressPercentage = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;
    
    // Update enrollment progress
    await db
      .update(aiCourseEnrollments)
      .set({
        progressPercentage: courseProgressPercentage,
        completionStatus: courseProgressPercentage === 100 ? "completed" : "in_progress",
        completionDate: courseProgressPercentage === 100 ? new Date() : null
      })
      .where(eq(aiCourseEnrollments.id, enrollment.id));
    
    res.json({
      message: "Progress updated successfully",
      progress
    });
  } catch (error) {
    logger.error(`Error updating progress for lesson ${req.params.id}:`, error);
    res.status(500).json({ message: "Failed to update lesson progress" });
  }
});

export default router;