import { 
  users, type User, type InsertUser,
  contactSubmissions, type Contact, type InsertContact,
  clientPreviews, type ClientPreview, type InsertClientPreview,
  subscriptionPlans, type SubscriptionPlan, type InsertSubscriptionPlan,
  userSubscriptions, type UserSubscription, type InsertUserSubscription,
  marketplaceItems, type MarketplaceItem, type InsertMarketplaceItem,
  marketplaceOrders, type MarketplaceOrder, type InsertMarketplaceOrder,
  advertisements, type Advertisement, type InsertAdvertisement,
  userSessions, contentViewMetrics, feedback,
  type UserSession, type ContentViewMetric, type Feedback,
  type InsertUserSession, type InsertContentViewMetric, type InsertFeedback,
  posts, mockupRequests, mockupEngagement, marketplaceServiceEngagement,
  type MockupRequest, type InsertMockupRequest, type MockupEngagement, type InsertMockupEngagement,
  type MarketplaceServiceEngagement,
  generatedMockups, type GeneratedMockup, type InsertGeneratedMockup,
  priceRecommendations, subscriptionPriceHistory,
  type PriceRecommendation, type InsertPriceRecommendation,
  type PriceHistory, type InsertPriceHistory,
  logs, bug_reports, platform_compatibility_issues,
  type Log, type InsertLog, 
  type BugReport, type InsertBugReport,
  type PlatformCompatibilityIssue, type InsertPlatformCompatibilityIssue,
  aiProducts, aiProductUsage,
  type AiProduct, type InsertAiProduct,
  type AiProductUsage, type InsertAiProductUsage,
  // New imports for member dashboard
  courses, courseModules, lessons, quizQuestions, courseResources,
  userCourseEnrollments, userLessonCompletions, userQuizAttempts, courseRatings,
  forumThreads, forumReplies, mediaResources,
  // AI Course Platform imports
  aiCourses, aiCourseCategories, aiCourseModules, aiCourseLessons,
  type Course, type InsertCourse, 
  type CourseModule, type InsertCourseModule,
  type Lesson, type InsertLesson,
  type QuizQuestion, type InsertQuizQuestion,
  type CourseResource, type InsertCourseResource,
  type UserCourseEnrollment, type InsertUserCourseEnrollment,
  type UserLessonCompletion, type InsertUserLessonCompletion, 
  type UserQuizAttempt, type InsertUserQuizAttempt,
  type CourseRating, type InsertCourseRating,
  type ForumThread, type InsertForumThread,
  type ForumReply, type InsertForumReply,
  type MediaResource, type InsertMediaResource,
  // Analytics imports
  pageViews, analyticsEvents, subscriptionAnalytics, subscriptionEvents,
  type PageView, type InsertPageView,
  type AnalyticsEvent, type InsertAnalyticsEvent,
  type SubscriptionAnalytic, type InsertSubscriptionAnalytic,
  type SubscriptionEvent, type InsertSubscriptionEvent
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, lt, sql, desc, asc, ilike, or, isNull } from "drizzle-orm";

// Extend the interface with needed CRUD methods
export interface IStorage {
  // User methods for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: InsertUser): Promise<User>;
  
  // Dashboard methods
  getUserEnrollments(userId: string): Promise<any[]>;
  getUserBadges(userId: string): Promise<any[]>;
  getRecommendedCourses(userId: string): Promise<any[]>;
  
  // Additional user methods
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined>;
  updateUserVerification(userId: string, verified: boolean): Promise<User>;
  updateStripeCustomerId(userId: string, stripeCustomerId: string): Promise<User>;
  updateUserStripeInfo(userId: string, data: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User>;
  
  // Subscription event methods
  createSubscriptionEvent(data: InsertSubscriptionEvent): Promise<SubscriptionEvent>;
  getSubscriptionEventsByUser(userId: string, limit?: number): Promise<SubscriptionEvent[]>;
  getSubscriptionEventsByType(eventType: string, startDate: Date, endDate: Date, limit?: number): Promise<SubscriptionEvent[]>;
  getSubscriptionConversionRate(startDate: Date, endDate: Date): Promise<number>;
  getSubscriptionChurnRate(startDate: Date, endDate: Date): Promise<number>;

  // Product and subscription methods
  getActiveAiProducts(): Promise<AiProduct[]>;
  getAiProduct(id: number): Promise<AiProduct | undefined>;
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getUserSubscription(userId: string): Promise<UserSubscription | undefined>;
  canAccessProduct(userId: string, productId: number): Promise<boolean>;
  getSubscriptionPlanById(planId: number): Promise<SubscriptionPlan | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async upsertUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  // Additional user methods
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, stripeCustomerId));
    return user;
  }
  
  async updateUserVerification(userId: string, verified: boolean): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        verified,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }
  
  async updateStripeCustomerId(userId: string, stripeCustomerId: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        stripeCustomerId,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }
  
  async updateUserStripeInfo(userId: string, data: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }
  
  // Subscription event methods
  async createSubscriptionEvent(data: InsertSubscriptionEvent): Promise<SubscriptionEvent> {
    const [event] = await db
      .insert(subscriptionEvents)
      .values({
        ...data,
        createdAt: new Date()
      })
      .returning();
    return event;
  }
  
  async getSubscriptionEventsByUser(userId: string, limit: number = 10): Promise<SubscriptionEvent[]> {
    return db
      .select()
      .from(subscriptionEvents)
      .where(eq(subscriptionEvents.userId, userId))
      .orderBy(desc(subscriptionEvents.createdAt))
      .limit(limit);
  }
  
  async getSubscriptionEventsByType(eventType: string, startDate: Date, endDate: Date, limit: number = 100): Promise<SubscriptionEvent[]> {
    return db
      .select()
      .from(subscriptionEvents)
      .where(
        and(
          eq(subscriptionEvents.eventType, eventType),
          gt(subscriptionEvents.createdAt, startDate),
          lt(subscriptionEvents.createdAt, endDate)
        )
      )
      .orderBy(desc(subscriptionEvents.createdAt))
      .limit(limit || 100);
  }
  
  async getSubscriptionConversionRate(startDate: Date, endDate: Date): Promise<number> {
    try {
      // Count distinct users who viewed pricing page
      const pricingPageViews = await db
        .select({ count: sql<number>`count(distinct "userId")` })
        .from(pageViews)
        .where(
          and(
            eq(pageViews.path, '/pricing'),
            gt(pageViews.timestamp, startDate),
            lt(pageViews.timestamp, endDate)
          )
        );
        
      // Count distinct users who subscribed in the date range
      const newSubscriptions = await db
        .select({ count: sql<number>`count(distinct "userId")` })
        .from(userSubscriptions)
        .where(
          and(
            gt(userSubscriptions.createdAt, startDate),
            lt(userSubscriptions.createdAt, endDate),
            eq(userSubscriptions.status, 'active')
          )
        );
      
      if (pricingPageViews[0].count === 0) {
        return 0;
      }
      
      return (newSubscriptions[0].count / pricingPageViews[0].count);
    } catch (error) {
      console.error("Error getting subscription conversion rate:", error);
      throw error;
    }
  }
  
  // Dashboard methods implementation
  async getUserEnrollments(userId: string): Promise<any[]> {
    try {
      // Get all enrollments with course details and progress
      const enrollments = await db
        .select({
          enrollment: userCourseEnrollments,
          course: aiCourses
        })
        .from(userCourseEnrollments)
        .innerJoin(aiCourses, eq(userCourseEnrollments.courseId, aiCourses.id))
        .where(eq(userCourseEnrollments.userId, userId))
        .orderBy(desc(userCourseEnrollments.updatedAt));

      // Format the result for the client
      return enrollments.map(item => ({
        id: item.enrollment.id,
        courseId: item.course.id,
        title: item.course.title,
        description: item.course.description,
        thumbnail: item.course.thumbnail,
        progress: item.enrollment.progress,
        lastAccessedAt: item.enrollment.updatedAt,
        currentLessonId: item.enrollment.currentLessonId,
        enrolledAt: item.enrollment.createdAt
      }));
    } catch (error) {
      console.error('Error fetching user enrollments:', error);
      return [];
    }
  }

  async getUserBadges(userId: string): Promise<any[]> {
    try {
      // In a real app, we'd query from a badges table
      // For now, we'll generate badges based on course completions
      const completedLessons = await db
        .select()
        .from(userLessonCompletions)
        .where(eq(userLessonCompletions.userId, userId));
      
      // Get courses the user has significant progress in
      const enrollments = await db
        .select({
          enrollment: userCourseEnrollments,
          course: aiCourses
        })
        .from(userCourseEnrollments)
        .innerJoin(aiCourses, eq(userCourseEnrollments.courseId, aiCourses.id))
        .where(and(
          eq(userCourseEnrollments.userId, userId),
          gt(userCourseEnrollments.progress, 50) // More than 50% progress
        ));

      // Generate achievement badges based on course progress
      const badges = enrollments.map((item, index) => ({
        id: index + 1,
        name: item.enrollment.progress >= 100 
          ? `${item.course.title} Master` 
          : `${item.course.title} Explorer`,
        description: item.enrollment.progress >= 100
          ? `Completed the entire ${item.course.title} course!`
          : `Made significant progress in ${item.course.title}`,
        iconUrl: `/badges/${item.enrollment.progress >= 100 ? 'completion' : 'progress'}.svg`,
        earnedAt: item.enrollment.updatedAt.toISOString(),
        category: item.enrollment.progress >= 100 ? 'completion' : 'progress'
      }));

      // Add a badge for number of lessons completed
      if (completedLessons.length > 0) {
        badges.push({
          id: badges.length + 1,
          name: 'Dedicated Learner',
          description: `Completed ${completedLessons.length} lessons across all courses`,
          iconUrl: '/badges/lessons.svg',
          earnedAt: new Date().toISOString(),
          category: 'milestone'
        });
      }

      return badges;
    } catch (error) {
      console.error('Error generating user badges:', error);
      return [];
    }
  }

  async getRecommendedCourses(userId: string): Promise<any[]> {
    try {
      // Get user's enrolled courses
      const enrolledCourseIds = await db
        .select({ id: userCourseEnrollments.courseId })
        .from(userCourseEnrollments)
        .where(eq(userCourseEnrollments.userId, userId));
      
      // Get categories of courses the user is enrolled in
      const enrolledCourses = await db
        .select()
        .from(aiCourses)
        .where(
          eq(aiCourses.id, enrolledCourseIds[0]?.id || 0)
        );
      
      const enrolledCategories = [...new Set(enrolledCourses.map(c => c.categoryId))];
      
      // Find courses in the same categories that the user is not enrolled in
      const recommendations = await db
        .select({
          course: aiCourses,
          category: aiCourseCategories
        })
        .from(aiCourses)
        .innerJoin(aiCourseCategories, eq(aiCourses.categoryId, aiCourseCategories.id))
        .where(
          and(
            eq(aiCourses.categoryId, enrolledCategories[0] || 0),
            isNull(aiCourses.id) // simplified condition
          )
        )
        .limit(6);
      
      // If we don't have enough recommendations, add popular courses
      if (recommendations.length < 3) {
        const popularCourses = await db
          .select({
            course: aiCourses,
            category: aiCourseCategories
          })
          .from(aiCourses)
          .innerJoin(aiCourseCategories, eq(aiCourses.categoryId, aiCourseCategories.id))
          .where(
            isNull(aiCourses.id) // simplified condition
          )
          // Simplified order by
          .orderBy(desc(aiCourses.createdAt))
          .limit(6 - recommendations.length);
        
        recommendations.push(...popularCourses);
      }
      
      // Format the recommendations
      return recommendations.map(item => ({
        id: item.course.id,
        title: item.course.title,
        description: item.course.description,
        thumbnail: item.course.thumbnail,
        duration: item.course.duration,
        difficulty: item.course.difficulty,
        reasonForRecommendation: `Based on your interest in ${item.category.name}`
      }));
    } catch (error) {
      console.error('Error generating course recommendations:', error);
      return [];
    }
  }
  
  // Add other methods from the original implementation
  // that you need to carry over...
  
  async getSubscriptionChurnRate(startDate: Date, endDate: Date): Promise<number> {
    try {
      // Count distinct users who had subscriptions that ended in the date range
      const currentTime = new Date();
      
      // Get count of subscriptions that ended or were canceled in the date range
      const churnedSubscriptions = await db
        .select({ count: sql<number>`count(distinct "userId")` })
        .from(userSubscriptions)
        .where(
          and(
            or(
              and(
                gt(userSubscriptions.endDate, startDate),
                lt(userSubscriptions.endDate, endDate)
              ),
              and(
                gt(userSubscriptions.canceledAt, startDate),
                lt(userSubscriptions.canceledAt, endDate)
              )
            ),
            eq(userSubscriptions.status, 'canceled')
          )
        );
        
      // Get count of active subscriptions at the start of the date range
      const totalSubscriptions = await db
        .select({ count: sql<number>`count(distinct "userId")` })
        .from(userSubscriptions)
        .where(
          lt(userSubscriptions.createdAt, startDate)
        );
      
      if (totalSubscriptions[0].count === 0) {
        return 0;
      }
      
      return (churnedSubscriptions[0].count / totalSubscriptions[0].count);
    } catch (error) {
      console.error("Error getting subscription conversion rate:", error);
      throw error;
    }
  }
  
  // AI Product methods implementation
  async getActiveAiProducts(): Promise<AiProduct[]> {
    try {
      return db
        .select()
        .from(aiProducts)
        .where(eq(aiProducts.active, true))
        .orderBy(asc(aiProducts.name));
    } catch (error) {
      console.error("Error getting active AI products:", error);
      return [];
    }
  }
  
  async getAiProduct(id: number): Promise<AiProduct | undefined> {
    try {
      const [product] = await db
        .select()
        .from(aiProducts)
        .where(eq(aiProducts.id, id));
      return product;
    } catch (error) {
      console.error(`Error getting AI product with id ${id}:`, error);
      return undefined;
    }
  }
  
  // Subscription methods implementation
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      return db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.active, true))
        .orderBy(asc(subscriptionPlans.price));
    } catch (error) {
      console.error("Error getting subscription plans:", error);
      return [];
    }
  }
  
  async getUserSubscription(userId: string): Promise<UserSubscription | undefined> {
    try {
      const [subscription] = await db
        .select()
        .from(userSubscriptions)
        .where(
          and(
            eq(userSubscriptions.userId, userId),
            eq(userSubscriptions.status, 'active')
          )
        )
        .orderBy(desc(userSubscriptions.createdAt))
        .limit(1);
      return subscription;
    } catch (error) {
      console.error(`Error getting subscription for user ${userId}:`, error);
      return undefined;
    }
  }
  
  async canAccessProduct(userId: string, productId: number): Promise<boolean> {
    try {
      // Get the product to check required plan
      const product = await this.getAiProduct(productId);
      if (!product) return false;
      
      // If product is free, user can access
      if (product.requiredPlan === 'free' || !product.requiredPlan) return true;
      
      // Get user's active subscription
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) return false;
      
      // Get subscription plan
      const plan = await this.getSubscriptionPlanById(subscription.planId);
      if (!plan) return false;
      
      // Simple access checking logic
      // In a real system, this would be more sophisticated with plan tiers
      return plan.name === product.requiredPlan || plan.price >= 49; // Pro plan or higher
    } catch (error) {
      console.error(`Error checking product access for user ${userId} and product ${productId}:`, error);
      return false;
    }
  }
  
  async getSubscriptionPlanById(planId: number): Promise<SubscriptionPlan | undefined> {
    try {
      const [plan] = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, planId));
      return plan;
    } catch (error) {
      console.error(`Error getting subscription plan with id ${planId}:`, error);
      return undefined;
    }
  }
}

// Create a new instance of DatabaseStorage
export const storage = new DatabaseStorage();