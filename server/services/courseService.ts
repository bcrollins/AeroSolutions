import { db } from '../db';
import { courses, courseModules, lessons } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Service for course-related data operations
 */
export const courseService = {
  /**
   * Get all published courses
   */
  async getAllCourses() {
    return await db.select().from(courses).where(eq(courses.status, 'published'));
  },

  /**
   * Get a specific course by ID
   */
  async getCourseById(courseId: number) {
    const [course] = await db.select().from(courses).where(eq(courses.id, courseId));
    return course;
  },

  /**
   * Get all modules for a specific course
   */
  async getCourseModules(courseId: number) {
    return await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, courseId))
      .orderBy(courseModules.orderIndex);
  },

  /**
   * Get a specific module by ID
   */
  async getModuleById(moduleId: number) {
    const [module] = await db.select().from(courseModules).where(eq(courseModules.id, moduleId));
    return module;
  },

  /**
   * Get all lessons for a specific module
   */
  async getModuleLessons(moduleId: number) {
    return await db
      .select()
      .from(lessons)
      .where(eq(lessons.moduleId, moduleId))
      .orderBy(lessons.orderIndex);
  },

  /**
   * Get a specific lesson by ID
   */
  async getLessonById(lessonId: number) {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
    return lesson;
  },

  /**
   * Search courses by title or category
   */
  async searchCourses(term: string) {
    return await db
      .select()
      .from(courses)
      .where(
        eq(courses.status, 'published')
      )
      .where(
        sql`lower(${courses.title}) LIKE lower(${'%' + term + '%'}) OR 
            lower(${courses.category}) LIKE lower(${'%' + term + '%'}) OR
            lower(${courses.description}) LIKE lower(${'%' + term + '%'})`
      );
  }
};