import { db } from '../db';
import { userCourseEnrollments, userLessonCompletions } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

/**
 * Service for managing course enrollments and user progress
 */
export const enrollmentService = {
  /**
   * Enroll a user in a course
   */
  async enrollUserInCourse(userId: string, courseId: number) {
    // Check if the user is already enrolled
    const existingEnrollment = await this.checkEnrollment(userId, courseId);
    
    if (existingEnrollment) {
      return existingEnrollment;
    }
    
    // Create new enrollment
    const [enrollment] = await db.insert(userCourseEnrollments)
      .values({
        userId: parseInt(userId),
        courseId,
        enrolledAt: new Date(),
        lastAccessedAt: new Date(),
        progress: 0
      })
      .returning()
      .execute();
    
    return enrollment;
  },
  
  /**
   * Check if a user is enrolled in a course
   */
  async checkEnrollment(userId: string, courseId: number) {
    const [enrollment] = await db.select()
      .from(userCourseEnrollments)
      .where(
        and(
          eq(userCourseEnrollments.userId, parseInt(userId)),
          eq(userCourseEnrollments.courseId, courseId)
        )
      )
      .execute();
    
    return enrollment;
  },
  
  /**
   * Get all courses a user is enrolled in
   */
  async getUserEnrollments(userId: string) {
    return await db.select()
      .from(userCourseEnrollments)
      .where(eq(userCourseEnrollments.userId, parseInt(userId)))
      .orderBy(userCourseEnrollments.enrolledAt)
      .execute();
  },
  
  /**
   * Update a user's progress in a lesson
   */
  async updateLessonProgress(userId: string, lessonId: number, progressData: {
    completed?: boolean;
    timeSpentMinutes?: number;
    score?: number;
  }) {
    // If the lesson is completed, record it
    if (progressData.completed) {
      // Check if we already have a completion record
      const [existingCompletion] = await db.select()
        .from(userLessonCompletions)
        .where(
          and(
            eq(userLessonCompletions.userId, parseInt(userId)),
            eq(userLessonCompletions.lessonId, lessonId)
          )
        )
        .execute();
      
      if (!existingCompletion) {
        // Create a new completion record
        await db.insert(userLessonCompletions)
          .values({
            userId: parseInt(userId),
            lessonId,
            timeSpentMinutes: progressData.timeSpentMinutes || 0,
            completedAt: new Date()
          })
          .execute();
      }
    }
    
    // Update the user's course progress
    const lessonQuery = `
      SELECT course_id FROM course_modules 
      JOIN lessons ON lessons.module_id = course_modules.id
      WHERE lessons.id = $1
    `;
    
    const result = await db.execute(sql`
      SELECT cm.course_id 
      FROM course_modules cm
      JOIN lessons l ON l.module_id = cm.id
      WHERE l.id = ${lessonId}
    `);
    
    const courseId = result.rows && result.rows.length > 0 ? result.rows[0].course_id : null;
    
    if (courseId) {
      // Recalculate course progress
      await this.getCourseProgress(userId, courseId);
    }
    
    return {
      lessonId,
      userId: parseInt(userId),
      completed: progressData.completed || false,
      timeSpentMinutes: progressData.timeSpentMinutes || 0,
      score: progressData.score || 0,
      updatedAt: new Date()
    };
  },
  
  /**
   * Get a user's progress for a specific lesson
   */
  async getLessonProgress(userId: string, lessonId: number) {
    const [completion] = await db.select()
      .from(userLessonCompletions)
      .where(
        and(
          eq(userLessonCompletions.userId, parseInt(userId)),
          eq(userLessonCompletions.lessonId, lessonId)
        )
      )
      .execute();
    
    return {
      lessonId,
      userId: parseInt(userId),
      completed: !!completion,
      timeSpentMinutes: completion?.timeSpentMinutes || 0,
      completedAt: completion?.completedAt || null
    };
  },
  
  /**
   * Get a user's progress for all lessons in a course
   */
  async getCourseProgress(userId: string, courseId: number) {
    // Execute queries to get lesson counts
    const allLessonsResult = await db.execute(sql`
      SELECT l.id
      FROM lessons l
      JOIN course_modules m ON l.module_id = m.id
      WHERE m.course_id = ${courseId}
    `);
    
    const completedLessonsResult = await db.execute(sql`
      SELECT c.lesson_id
      FROM user_lesson_completions c
      JOIN lessons l ON c.lesson_id = l.id
      JOIN course_modules m ON l.module_id = m.id
      WHERE m.course_id = ${courseId} AND c.user_id = ${parseInt(userId)}
    `);
    
    const totalLessons = allLessonsResult.rows?.length || 0;
    const completedLessons = completedLessonsResult.rows?.length || 0;
    
    // Calculate completion percentage
    const progress = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100) 
      : 0;
    
    // Update enrollment with latest progress
    if (totalLessons > 0) {
      await db.update(userCourseEnrollments)
        .set({
          progress,
          lastAccessedAt: new Date()
        })
        .where(
          and(
            eq(userCourseEnrollments.userId, parseInt(userId)),
            eq(userCourseEnrollments.courseId, courseId)
          )
        )
        .execute();
    }
    
    return {
      totalLessons,
      completedLessons,
      progress
    };
  }
};