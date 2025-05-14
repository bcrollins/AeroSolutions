import express from 'express';
import { z } from 'zod';
import { db } from '../db';
import { isAuthenticated } from '../replitAuth';
import { eq, and, desc, sql } from 'drizzle-orm';
import {
  aiCourses,
  aiCourseModules,
  aiCourseLessons,
  aiCourseEnrollments,
  aiLessonProgress,
  aiCourseCategories
} from '@shared/schema';

const router = express.Router();

// Get all AI courses
router.get('/api/ai-courses', async (req, res) => {
  try {
    const courses = await db.select().from(aiCourses).orderBy(desc(aiCourses.createdAt));
    res.json(courses);
  } catch (error: any) {
    console.error('Error fetching AI courses:', error);
    res.status(500).json({ message: 'Failed to fetch AI courses' });
  }
});

// Get all course categories
router.get('/api/ai-course-categories', async (req, res) => {
  try {
    const categories = await db.select().from(aiCourseCategories);
    res.json(categories);
  } catch (error: any) {
    console.error('Error fetching AI course categories:', error);
    res.status(500).json({ message: 'Failed to fetch course categories' });
  }
});

// Get specific AI course with modules and lessons
router.get('/api/ai-courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const courseId = parseInt(id);

    if (isNaN(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    // Get the course
    const [course] = await db
      .select()
      .from(aiCourses)
      .where(eq(aiCourses.id, courseId));

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get modules for this course
    const modules = await db
      .select()
      .from(aiCourseModules)
      .where(eq(aiCourseModules.courseId, courseId))
      .orderBy(aiCourseModules.order);

    // Get lessons for each module
    const modulesWithLessons = await Promise.all(
      modules.map(async (module) => {
        const lessons = await db
          .select()
          .from(aiCourseLessons)
          .where(eq(aiCourseLessons.moduleId, module.id))
          .orderBy(aiCourseLessons.order);

        return {
          ...module,
          lessons,
        };
      })
    );

    // Get category if available
    let category = null;
    if (course.categoryId) {
      const [courseCategory] = await db
        .select()
        .from(aiCourseCategories)
        .where(eq(aiCourseCategories.id, course.categoryId));
      category = courseCategory;
    }

    // Update course view count
    await db
      .update(aiCourses)
      .set({ viewCount: (course.viewCount || 0) + 1 })
      .where(eq(aiCourses.id, courseId));

    // Return course with modules and lessons
    res.json({
      ...course,
      category,
      modules: modulesWithLessons,
    });
  } catch (error: any) {
    console.error('Error fetching AI course:', error);
    res.status(500).json({ message: 'Failed to fetch course' });
  }
});

// Enroll in a course
router.post('/api/ai-courses/:id/enroll', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const courseId = parseInt(id);
    const userId = req.user.claims.sub;

    if (isNaN(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    // Check if course exists
    const [course] = await db
      .select()
      .from(aiCourses)
      .where(eq(aiCourses.id, courseId));

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
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
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Create enrollment
    const [enrollment] = await db
      .insert(aiCourseEnrollments)
      .values({
        userId,
        courseId,
        enrolledAt: new Date(),
        status: 'active',
      })
      .returning();

    // Update course enrollment count
    await db
      .update(aiCourses)
      .set({ enrollmentCount: sql`${aiCourses.enrollmentCount} + 1` })
      .where(eq(aiCourses.id, courseId));

    // Initialize progress records for all lessons
    const modules = await db
      .select()
      .from(aiCourseModules)
      .where(eq(aiCourseModules.courseId, courseId));

    for (const module of modules) {
      const lessons = await db
        .select()
        .from(aiCourseLessons)
        .where(eq(aiCourseLessons.moduleId, module.id));

      for (const lesson of lessons) {
        await db
          .insert(aiLessonProgress)
          .values({
            userId,
            courseId,
            moduleId: module.id,
            lessonId: lesson.id,
            startedAt: new Date(),
            progressPercentage: 0,
            completed: false,
          })
          .onConflictDoNothing();
      }
    }

    res.status(201).json({
      message: 'Successfully enrolled in course',
      enrollment,
    });
  } catch (error: any) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ message: 'Failed to enroll in course' });
  }
});

// Get user enrollments
router.get('/api/user/enrollments', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    const enrollments = await db
      .select({
        enrollment: aiCourseEnrollments,
        course: aiCourses,
      })
      .from(aiCourseEnrollments)
      .innerJoin(aiCourses, eq(aiCourseEnrollments.courseId, aiCourses.id))
      .where(eq(aiCourseEnrollments.userId, userId))
      .orderBy(desc(aiCourseEnrollments.enrolledAt));

    // Format the results
    const formattedEnrollments = enrollments.map(({ enrollment, course }) => ({
      ...enrollment,
      course,
    }));

    res.json(formattedEnrollments);
  } catch (error: any) {
    console.error('Error fetching user enrollments:', error);
    res.status(500).json({ message: 'Failed to fetch enrollments' });
  }
});

// Get course progress for a user
router.get('/api/course/:id/progress', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const courseId = parseInt(id);
    const userId = req.user.claims.sub;

    if (isNaN(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    // Check if enrolled
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
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }

    // Get all progress entries for this course
    const progressEntries = await db
      .select()
      .from(aiLessonProgress)
      .where(
        and(
          eq(aiLessonProgress.userId, userId),
          eq(aiLessonProgress.courseId, courseId)
        )
      );

    // Get course modules and lessons
    const modules = await db
      .select()
      .from(aiCourseModules)
      .where(eq(aiCourseModules.courseId, courseId))
      .orderBy(aiCourseModules.order);

    const modulesWithProgress = await Promise.all(
      modules.map(async (module) => {
        const lessons = await db
          .select()
          .from(aiCourseLessons)
          .where(eq(aiCourseLessons.moduleId, module.id))
          .orderBy(aiCourseLessons.order);

        const lessonsWithProgress = lessons.map((lesson) => {
          const progress = progressEntries.find(
            (entry) => entry.lessonId === lesson.id
          );

          return {
            ...lesson,
            progress: progress || {
              progressPercentage: 0,
              completed: false,
            },
          };
        });

        // Calculate module progress
        const totalLessons = lessonsWithProgress.length;
        const completedLessons = lessonsWithProgress.filter(
          (lesson) => lesson.progress.completed
        ).length;
        const moduleProgressPercentage = totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

        return {
          ...module,
          lessons: lessonsWithProgress,
          progress: {
            progressPercentage: moduleProgressPercentage,
            completedLessons,
            totalLessons,
          },
        };
      })
    );

    // Calculate overall course progress
    const totalLessons = progressEntries.length;
    const completedLessons = progressEntries.filter(
      (entry) => entry.completed
    ).length;
    const overallProgressPercentage = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    res.json({
      courseId,
      userId,
      enrollmentId: enrollment.id,
      modules: modulesWithProgress,
      overallProgress: {
        progressPercentage: overallProgressPercentage,
        completedLessons,
        totalLessons,
      },
      lastUpdated: new Date(),
    });
  } catch (error: any) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ message: 'Failed to fetch course progress' });
  }
});

// Update lesson progress
router.post('/api/lessons/:id/progress', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const lessonId = parseInt(id);
    const userId = req.user.claims.sub;
    const { completed, progressPercentage } = req.body;

    if (isNaN(lessonId)) {
      return res.status(400).json({ message: 'Invalid lesson ID' });
    }

    // Get the lesson to find its course
    const [lesson] = await db
      .select()
      .from(aiCourseLessons)
      .where(eq(aiCourseLessons.id, lessonId));

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Get module to find course ID
    const [module] = await db
      .select()
      .from(aiCourseModules)
      .where(eq(aiCourseModules.id, lesson.moduleId));

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const courseId = module.courseId;

    // Check if enrolled in this course
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
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    // Get existing progress or create new
    const [existingProgress] = await db
      .select()
      .from(aiLessonProgress)
      .where(
        and(
          eq(aiLessonProgress.userId, userId),
          eq(aiLessonProgress.lessonId, lessonId)
        )
      );

    if (existingProgress) {
      // Update existing progress
      const [updatedProgress] = await db
        .update(aiLessonProgress)
        .set({
          progressPercentage: progressPercentage || existingProgress.progressPercentage,
          completed: completed !== undefined ? completed : existingProgress.completed,
          completedAt: completed ? new Date() : existingProgress.completedAt,
          updatedAt: new Date(),
        })
        .where(eq(aiLessonProgress.id, existingProgress.id))
        .returning();

      res.json(updatedProgress);
    } else {
      // Create new progress entry
      const [newProgress] = await db
        .insert(aiLessonProgress)
        .values({
          userId,
          courseId,
          moduleId: lesson.moduleId,
          lessonId,
          startedAt: new Date(),
          progressPercentage: progressPercentage || 0,
          completed: completed || false,
          completedAt: completed ? new Date() : null,
        })
        .returning();

      res.status(201).json(newProgress);
    }
  } catch (error: any) {
    console.error('Error updating lesson progress:', error);
    res.status(500).json({ message: 'Failed to update progress' });
  }
});

export default router;