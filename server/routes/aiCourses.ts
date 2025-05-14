import { Router } from "express";
import { db } from "../db";
import { 
  aiCourses, 
  aiCourseCategories,
  aiCourseModules,
  aiCourseLessons,
  aiCourseEnrollments,
  aiLessonProgress,
  aiCourseCertifications,
  aiCourseForums,
  aiForumPosts,
  insertAiCourseSchema,
  insertAiCourseCategorySchema,
  insertAiCourseModuleSchema,
  insertAiCourseLessonSchema
} from "@shared/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { isAuthenticated } from "../replitAuth";
import { z } from "zod";

const router = Router();

// Get all courses
router.get("/api/ai-courses", async (req, res) => {
  try {
    const courses = await db.select().from(aiCourses)
      .where(eq(aiCourses.isPublished, true))
      .orderBy(desc(aiCourses.createdAt));
    return res.json(courses);
  } catch (error) {
    console.error("Error fetching AI courses:", error);
    return res.status(500).json({ message: "Failed to fetch AI courses" });
  }
});

// Get course by ID
router.get("/api/ai-courses/:id", async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    if (isNaN(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const [course] = await db.select().from(aiCourses)
      .where(eq(aiCourses.id, courseId));

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Get modules for this course
    const modules = await db.select().from(aiCourseModules)
      .where(eq(aiCourseModules.courseId, courseId))
      .orderBy(asc(aiCourseModules.position));

    // Get lessons for each module
    const moduleIds = modules.map(module => module.id);
    const lessons = await db.select().from(aiCourseLessons)
      .where(
        moduleIds.length > 0 
          ? aiCourseLessons.moduleId.in(moduleIds)
          : undefined
      )
      .orderBy(asc(aiCourseLessons.position));

    // Create course details with modules and lessons
    const result = {
      ...course,
      modules: modules.map(module => ({
        ...module,
        lessons: lessons.filter(lesson => lesson.moduleId === module.id)
      }))
    };

    return res.json(result);
  } catch (error) {
    console.error("Error fetching AI course details:", error);
    return res.status(500).json({ message: "Failed to fetch course details" });
  }
});

// Get course categories
router.get("/api/ai-course-categories", async (req, res) => {
  try {
    const categories = await db.select().from(aiCourseCategories);
    return res.json(categories);
  } catch (error) {
    console.error("Error fetching course categories:", error);
    return res.status(500).json({ message: "Failed to fetch course categories" });
  }
});

// Get courses by category
router.get("/api/ai-courses/category/:categoryId", async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const courses = await db.select().from(aiCourses)
      .where(
        and(
          eq(aiCourses.categoryId, categoryId),
          eq(aiCourses.isPublished, true)
        )
      )
      .orderBy(desc(aiCourses.createdAt));

    return res.json(courses);
  } catch (error) {
    console.error("Error fetching courses by category:", error);
    return res.status(500).json({ message: "Failed to fetch courses by category" });
  }
});

// AUTHENTICATED ROUTES

// Enroll in a course
router.post("/api/ai-courses/:id/enroll", isAuthenticated, async (req: any, res) => {
  try {
    const courseId = parseInt(req.params.id);
    if (isNaN(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const userId = req.user.claims.sub;

    // Check if already enrolled
    const [existingEnrollment] = await db.select().from(aiCourseEnrollments)
      .where(
        and(
          eq(aiCourseEnrollments.userId, userId),
          eq(aiCourseEnrollments.courseId, courseId)
        )
      );

    if (existingEnrollment) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    // Create enrollment
    const [enrollment] = await db.insert(aiCourseEnrollments)
      .values({
        userId: userId,
        courseId: courseId,
        status: "active",
        progressPercentage: 0
      })
      .returning();

    // Update course enrollment count
    await db.update(aiCourses)
      .set({
        enrollmentCount: aiCourses.enrollmentCount + 1
      })
      .where(eq(aiCourses.id, courseId));

    return res.json(enrollment);
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return res.status(500).json({ message: "Failed to enroll in course" });
  }
});

// Get user enrollments
router.get("/api/user/enrollments", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    const enrollments = await db.select({
      enrollment: aiCourseEnrollments,
      course: aiCourses
    })
    .from(aiCourseEnrollments)
    .innerJoin(aiCourses, eq(aiCourseEnrollments.courseId, aiCourses.id))
    .where(eq(aiCourseEnrollments.userId, userId));

    const formattedEnrollments = enrollments.map(({ enrollment, course }) => ({
      ...enrollment,
      course
    }));

    return res.json(formattedEnrollments);
  } catch (error) {
    console.error("Error fetching user enrollments:", error);
    return res.status(500).json({ message: "Failed to fetch enrollments" });
  }
});

// Update lesson progress
router.post("/api/lessons/:id/progress", isAuthenticated, async (req: any, res) => {
  try {
    const lessonId = parseInt(req.params.id);
    if (isNaN(lessonId)) {
      return res.status(400).json({ message: "Invalid lesson ID" });
    }

    const userId = req.user.claims.sub;
    const { completed, progressPercentage, timeSpent } = req.body;

    // Find existing progress or create new
    const [existingProgress] = await db.select().from(aiLessonProgress)
      .where(
        and(
          eq(aiLessonProgress.userId, userId),
          eq(aiLessonProgress.lessonId, lessonId)
        )
      );

    let progress;

    if (existingProgress) {
      // Update existing progress
      [progress] = await db.update(aiLessonProgress)
        .set({
          completed: completed ?? existingProgress.completed,
          completedAt: completed ? new Date() : existingProgress.completedAt,
          progressPercentage: progressPercentage ?? existingProgress.progressPercentage,
          timeSpent: (timeSpent ?? 0) + (existingProgress.timeSpent ?? 0),
          lastAccessedAt: new Date()
        })
        .where(
          and(
            eq(aiLessonProgress.userId, userId),
            eq(aiLessonProgress.lessonId, lessonId)
          )
        )
        .returning();
    } else {
      // Create new progress
      [progress] = await db.insert(aiLessonProgress)
        .values({
          userId,
          lessonId,
          completed: completed ?? false,
          completedAt: completed ? new Date() : null,
          progressPercentage: progressPercentage ?? 0,
          timeSpent: timeSpent ?? 0
        })
        .returning();
    }

    // Update course enrollment progress if this completes a lesson
    if (completed) {
      // Get the module and course for this lesson
      const [lesson] = await db.select().from(aiCourseLessons)
        .where(eq(aiCourseLessons.id, lessonId));
      
      if (lesson) {
        const [module] = await db.select().from(aiCourseModules)
          .where(eq(aiCourseModules.id, lesson.moduleId));
        
        if (module) {
          // Get all lessons in the course
          const modules = await db.select().from(aiCourseModules)
            .where(eq(aiCourseModules.courseId, module.courseId));
          
          const moduleIds = modules.map(m => m.id);
          const lessons = await db.select().from(aiCourseLessons)
            .where(aiCourseLessons.moduleId.in(moduleIds));
          
          // Get completed lessons
          const completedLessons = await db.select().from(aiLessonProgress)
            .where(
              and(
                eq(aiLessonProgress.userId, userId),
                aiLessonProgress.lessonId.in(lessons.map(l => l.id)),
                eq(aiLessonProgress.completed, true)
              )
            );
          
          // Calculate progress percentage
          const totalLessons = lessons.length;
          const completedCount = completedLessons.length;
          const progressPercentage = Math.round((completedCount / totalLessons) * 100);
          
          // Update enrollment progress
          await db.update(aiCourseEnrollments)
            .set({
              progressPercentage,
              completedAt: progressPercentage === 100 ? new Date() : null,
              status: progressPercentage === 100 ? 'completed' : 'active',
              lastAccessedAt: new Date()
            })
            .where(
              and(
                eq(aiCourseEnrollments.userId, userId),
                eq(aiCourseEnrollments.courseId, module.courseId)
              )
            );
          
          // If course is completed, generate certificate
          if (progressPercentage === 100) {
            const [existingCertificate] = await db.select().from(aiCourseCertifications)
              .where(
                and(
                  eq(aiCourseCertifications.userId, userId),
                  eq(aiCourseCertifications.courseId, module.courseId)
                )
              );
            
            if (!existingCertificate) {
              // Generate a unique certification number
              const certNumber = `CERT-${module.courseId}-${userId}-${Date.now()}`;
              
              await db.insert(aiCourseCertifications)
                .values({
                  userId,
                  courseId: module.courseId,
                  certificationNumber: certNumber,
                  issueDate: new Date(),
                  expiryDate: null, // No expiry
                  verified: true
                });
            }
          }
        }
      }
    }

    return res.json(progress);
  } catch (error) {
    console.error("Error updating lesson progress:", error);
    return res.status(500).json({ message: "Failed to update lesson progress" });
  }
});

// Get lesson progress for a user
router.get("/api/course/:courseId/progress", isAuthenticated, async (req: any, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const userId = req.user.claims.sub;

    // Get modules for this course
    const modules = await db.select().from(aiCourseModules)
      .where(eq(aiCourseModules.courseId, courseId));
    
    const moduleIds = modules.map(module => module.id);
    
    // Get lessons for these modules
    const lessons = await db.select().from(aiCourseLessons)
      .where(
        moduleIds.length > 0 
          ? aiCourseLessons.moduleId.in(moduleIds)
          : undefined
      );
    
    // Get progress for these lessons
    const progress = await db.select().from(aiLessonProgress)
      .where(
        and(
          eq(aiLessonProgress.userId, userId),
          lessons.length > 0 
            ? aiLessonProgress.lessonId.in(lessons.map(lesson => lesson.id))
            : undefined
        )
      );
    
    // Create a map of lesson progress
    const progressMap = progress.reduce((map, item) => {
      map[item.lessonId] = item;
      return map;
    }, {} as Record<number, typeof progress[0]>);
    
    // Create course progress details
    const result = {
      courseId,
      modules: modules.map(module => ({
        ...module,
        lessons: lessons
          .filter(lesson => lesson.moduleId === module.id)
          .map(lesson => ({
            ...lesson,
            progress: progressMap[lesson.id] || null
          }))
      })),
      overallProgress: {
        totalLessons: lessons.length,
        completedLessons: progress.filter(p => p.completed).length,
        progressPercentage: lessons.length > 0 
          ? Math.round((progress.filter(p => p.completed).length / lessons.length) * 100)
          : 0
      }
    };

    return res.json(result);
  } catch (error) {
    console.error("Error fetching course progress:", error);
    return res.status(500).json({ message: "Failed to fetch course progress" });
  }
});

// FORUM ROUTES

// Get forums for a course
router.get("/api/course/:courseId/forums", async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const forums = await db.select().from(aiCourseForums)
      .where(eq(aiCourseForums.courseId, courseId))
      .orderBy(desc(aiCourseForums.updatedAt));
    
    return res.json(forums);
  } catch (error) {
    console.error("Error fetching course forums:", error);
    return res.status(500).json({ message: "Failed to fetch course forums" });
  }
});

// Get posts for a forum
router.get("/api/forum/:forumId/posts", async (req, res) => {
  try {
    const forumId = parseInt(req.params.forumId);
    if (isNaN(forumId)) {
      return res.status(400).json({ message: "Invalid forum ID" });
    }

    const posts = await db.select({
      post: aiForumPosts,
      username: { firstName: "users.first_name", lastName: "users.last_name" }
    })
    .from(aiForumPosts)
    .leftJoin("users", eq("users.id", aiForumPosts.userId))
    .where(eq(aiForumPosts.forumId, forumId))
    .orderBy(desc(aiForumPosts.createdAt));
    
    return res.json(posts);
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    return res.status(500).json({ message: "Failed to fetch forum posts" });
  }
});

// Create a post in a forum
router.post("/api/forum/:forumId/posts", isAuthenticated, async (req: any, res) => {
  try {
    const forumId = parseInt(req.params.forumId);
    if (isNaN(forumId)) {
      return res.status(400).json({ message: "Invalid forum ID" });
    }

    const userId = req.user.claims.sub;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const [post] = await db.insert(aiForumPosts)
      .values({
        forumId,
        userId,
        content,
        isPinned: false
      })
      .returning();
    
    // Update forum updated_at
    await db.update(aiCourseForums)
      .set({ updatedAt: new Date() })
      .where(eq(aiCourseForums.id, forumId));
    
    return res.json(post);
  } catch (error) {
    console.error("Error creating forum post:", error);
    return res.status(500).json({ message: "Failed to create forum post" });
  }
});

export default router;