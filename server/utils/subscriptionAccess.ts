import { storage } from '../storage';
import * as stripeService from './stripeService';
import { logger } from './logger';

// Define subscription tiers and their access levels
export enum SubscriptionTier {
  NONE = 'none',
  BASIC = 'basic',
  PRO = 'pro', 
  ENTERPRISE = 'enterprise'
}

// Map subscription plan IDs to tiers
const subscriptionTierMap: Record<number, SubscriptionTier> = {
  1: SubscriptionTier.BASIC,     // Basic plan ID
  2: SubscriptionTier.PRO,       // Pro plan ID
  3: SubscriptionTier.ENTERPRISE // Enterprise plan ID
};

// Course access configuration by tier
interface CourseAccessConfig {
  [key: string]: {
    minimumTier: SubscriptionTier;
    includeFreeSample?: boolean;
    freeSampleLessons?: number;
  };
}

// Default course access configuration
// This can be extended in the future with more specific configurations
const courseAccessConfig: CourseAccessConfig = {
  default: {
    minimumTier: SubscriptionTier.BASIC,
    includeFreeSample: true,
    freeSampleLessons: 1
  },
  beginner: {
    minimumTier: SubscriptionTier.BASIC,
    includeFreeSample: true,
    freeSampleLessons: 2
  },
  intermediate: {
    minimumTier: SubscriptionTier.PRO,
    includeFreeSample: true,
    freeSampleLessons: 1
  },
  advanced: {
    minimumTier: SubscriptionTier.ENTERPRISE,
    includeFreeSample: true,
    freeSampleLessons: 1
  }
};

/**
 * Get the subscription tier for a user
 * @param userId - User ID to check
 * @returns The user's subscription tier
 */
export async function getUserSubscriptionTier(userId: string | number): Promise<SubscriptionTier> {
  try {
    // Get the user's subscription from the Stripe service
    const subscriptionData = await stripeService.getUserSubscription(userId);
    
    if (!subscriptionData || 
        !subscriptionData.subscription || 
        subscriptionData.subscription.status !== 'active') {
      return SubscriptionTier.NONE;
    }
    
    // Get the plan ID from the subscription data
    const planId = subscriptionData.plan?.id;
    
    if (!planId || !subscriptionTierMap[planId]) {
      return SubscriptionTier.NONE;
    }
    
    return subscriptionTierMap[planId];
  } catch (error) {
    logger.error('Error getting user subscription tier', { error, userId });
    return SubscriptionTier.NONE;
  }
}

/**
 * Check if a user has access to a course
 * @param userId - User ID to check
 * @param courseId - Course ID to check access for
 * @returns Boolean indicating if the user has access
 */
export async function hasAccessToCourse(userId: string | number, courseId: number): Promise<boolean> {
  try {
    // Get the user's subscription tier
    const userTier = await getUserSubscriptionTier(userId);
    
    // Get the course details
    const course = await storage.getCourseById(courseId);
    
    if (!course) {
      return false;
    }
    
    // Determine which access configuration to use based on course difficulty
    const accessConfig = courseAccessConfig[course.difficulty?.toLowerCase()] || courseAccessConfig.default;
    
    // Compare user tier to required tier
    const tierValues = Object.values(SubscriptionTier);
    const userTierIndex = tierValues.indexOf(userTier);
    const requiredTierIndex = tierValues.indexOf(accessConfig.minimumTier);
    
    return userTierIndex >= requiredTierIndex;
  } catch (error) {
    logger.error('Error checking course access', { error, userId, courseId });
    return false;
  }
}

/**
 * Check if a user has access to a specific lesson
 * @param userId - User ID to check
 * @param courseId - Course ID to check
 * @param lessonId - Lesson ID to check
 * @returns Boolean indicating if the user has access to this lesson
 */
export async function hasAccessToLesson(
  userId: string | number, 
  courseId: number, 
  moduleId: number,
  lessonId: number
): Promise<boolean> {
  try {
    // First check if user has full access to the course
    const hasFullAccess = await hasAccessToCourse(userId, courseId);
    
    if (hasFullAccess) {
      return true;
    }
    
    // If they don't have full access, check if this lesson is in the free sample
    const course = await storage.getCourseById(courseId);
    
    if (!course) {
      return false;
    }
    
    // Get the access configuration
    const accessConfig = courseAccessConfig[course.difficulty?.toLowerCase()] || courseAccessConfig.default;
    
    // Only proceed if free samples are allowed
    if (!accessConfig.includeFreeSample) {
      return false;
    }
    
    // Get the module
    const module = course.modules.find(m => m.id === moduleId);
    
    if (!module) {
      return false;
    }
    
    // Get the lesson
    const lesson = module.lessons.find(l => l.id === lessonId);
    
    if (!lesson) {
      return false;
    }
    
    // Check if this is one of the free sample lessons (assumes lessons are ordered)
    const freeSampleCount = accessConfig.freeSampleLessons || 0;
    
    // Get all lessons in this course in order
    let allLessons: { moduleId: number; lessonId: number; lessonOrder: number }[] = [];
    
    course.modules.forEach(m => {
      m.lessons.forEach(l => {
        allLessons.push({
          moduleId: m.id,
          lessonId: l.id,
          lessonOrder: l.order
        });
      });
    });
    
    // Sort lessons by their order
    allLessons.sort((a, b) => a.lessonOrder - b.lessonOrder);
    
    // Check if this lesson is among the first N free sample lessons
    const lessonIndex = allLessons.findIndex(l => 
      l.moduleId === moduleId && l.lessonId === lessonId
    );
    
    return lessonIndex < freeSampleCount;
  } catch (error) {
    logger.error('Error checking lesson access', { error, userId, courseId, moduleId, lessonId });
    return false;
  }
}

/**
 * Get a list of courses a user has access to
 * @param userId - User ID to check
 * @returns Array of course IDs the user has access to
 */
export async function getAccessibleCourses(userId: string | number): Promise<number[]> {
  try {
    // Get the user's subscription tier
    const userTier = await getUserSubscriptionTier(userId);
    
    // Get all courses
    const courses = await storage.getAllCourses();
    
    // Filter courses based on the user's subscription tier
    const accessibleCourses = courses.filter(course => {
      const accessConfig = courseAccessConfig[course.difficulty?.toLowerCase()] || courseAccessConfig.default;
      
      const tierValues = Object.values(SubscriptionTier);
      const userTierIndex = tierValues.indexOf(userTier);
      const requiredTierIndex = tierValues.indexOf(accessConfig.minimumTier);
      
      return userTierIndex >= requiredTierIndex;
    });
    
    // Return the IDs of accessible courses
    return accessibleCourses.map(course => course.id);
  } catch (error) {
    logger.error('Error getting accessible courses', { error, userId });
    return [];
  }
}