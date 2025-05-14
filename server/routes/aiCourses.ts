import express from "express";
import { db } from "../db";
import { aiCourses, aiCourseCategories, aiCourseModules, aiCourseLessons } from "@shared/schema";
import { eq, like, and, or, desc, sql } from "drizzle-orm";
import { logger } from "../utils/logger";

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

export default router;