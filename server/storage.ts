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
  // Community forum imports
  forumLikes, forumNotifications, userForumActivity,
  type ForumLike, type InsertForumLike, 
  type ForumNotification, type InsertForumNotification,
  type UserForumActivity, type InsertUserForumActivity,
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
  // Certificate imports
  courseCertificates,
  type CourseCertificate, type InsertCourseCertificate,
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
  
  // Certificate methods
  createCourseCertificate(data: InsertCourseCertificate): Promise<CourseCertificate>;
  getCertificateById(id: number): Promise<CourseCertificate | undefined>;
  getCertificateByCertificateNumber(certificateNumber: string): Promise<CourseCertificate | undefined>;
  getUserCertificates(userId: string, limit?: number, offset?: number): Promise<{ certificates: CourseCertificate[], total: number }>;
  getCourseCertificates(courseId: number, limit?: number, offset?: number): Promise<{ certificates: CourseCertificate[], total: number }>;
  updateCertificate(id: number, data: Partial<CourseCertificate>): Promise<CourseCertificate | undefined>;
  markCertificateAsShared(id: number, platform: 'linkedin' | 'twitter'): Promise<CourseCertificate | undefined>;
  verifyCertificate(certificateNumber: string): Promise<{ isValid: boolean; certificate?: CourseCertificate; user?: User; course?: AiProduct; }>;
  
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
  
  // Certificate methods implementation
  async createCourseCertificate(data: InsertCourseCertificate): Promise<CourseCertificate> {
    // Generate a unique certificate number (UUID format with RLX prefix)
    const certificateNumber = `RLX-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
    
    const [certificate] = await db
      .insert(courseCertificates)
      .values({
        ...data,
        certificateNumber,
        verificationStatus: "valid"
      })
      .returning();
      
    return certificate;
  }
  
  async getCertificateById(id: number): Promise<CourseCertificate | undefined> {
    const [certificate] = await db
      .select()
      .from(courseCertificates)
      .where(eq(courseCertificates.id, id));
      
    return certificate;
  }
  
  async getCertificateByCertificateNumber(certificateNumber: string): Promise<CourseCertificate | undefined> {
    const [certificate] = await db
      .select()
      .from(courseCertificates)
      .where(eq(courseCertificates.certificateNumber, certificateNumber));
      
    return certificate;
  }
  
  async getUserCertificates(userId: string, limit = 20, offset = 0): Promise<{ certificates: CourseCertificate[], total: number }> {
    const certificates = await db
      .select()
      .from(courseCertificates)
      .where(eq(courseCertificates.userId, userId))
      .orderBy(desc(courseCertificates.issueDate))
      .limit(limit)
      .offset(offset);
      
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(courseCertificates)
      .where(eq(courseCertificates.userId, userId));
      
    return { 
      certificates, 
      total: Number(count) 
    };
  }
  
  async getCourseCertificates(courseId: number, limit = 20, offset = 0): Promise<{ certificates: CourseCertificate[], total: number }> {
    const certificates = await db
      .select()
      .from(courseCertificates)
      .where(eq(courseCertificates.courseId, courseId))
      .orderBy(desc(courseCertificates.issueDate))
      .limit(limit)
      .offset(offset);
      
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(courseCertificates)
      .where(eq(courseCertificates.courseId, courseId));
      
    return { 
      certificates, 
      total: Number(count) 
    };
  }
  
  async updateCertificate(id: number, data: Partial<CourseCertificate>): Promise<CourseCertificate | undefined> {
    const [updatedCertificate] = await db
      .update(courseCertificates)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(courseCertificates.id, id))
      .returning();
      
    return updatedCertificate;
  }
  
  async markCertificateAsShared(id: number, platform: 'linkedin' | 'twitter'): Promise<CourseCertificate | undefined> {
    const updateData = platform === 'linkedin' 
      ? { sharedToLinkedIn: true } 
      : { sharedToTwitter: true };
      
    return this.updateCertificate(id, updateData);
  }
  
  async verifyCertificate(certificateNumber: string): Promise<{ 
    isValid: boolean; 
    certificate?: CourseCertificate;
    user?: User;
    course?: AiProduct; 
  }> {
    const certificate = await this.getCertificateByCertificateNumber(certificateNumber);
    
    if (!certificate) {
      return { isValid: false };
    }
    
    // Check if certificate is valid
    if (certificate.verificationStatus !== 'valid') {
      return { isValid: false, certificate };
    }
    
    // Check if certificate is expired
    if (certificate.expiryDate && new Date(certificate.expiryDate) < new Date()) {
      return { isValid: false, certificate };
    }
    
    // Get additional info for display
    const user = await this.getUser(certificate.userId);
    const course = await this.getAiProduct(certificate.courseId);
    
    return {
      isValid: true,
      certificate,
      user,
      course
    };
  }
  
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

  // COMMUNITY FORUM METHODS

  // Thread methods
  async getForumThreads(
    page = 1,
    limit = 10,
    filters?: {
      courseId?: number;
      category?: string;
      userId?: number;
      search?: string;
      approved?: boolean;
    }
  ): Promise<{ threads: ForumThread[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      let query = db.select().from(forumThreads);

      // Apply filters if provided
      if (filters) {
        const conditions = [];
        
        if (filters.courseId !== undefined) {
          conditions.push(eq(forumThreads.courseId, filters.courseId));
        }
        
        if (filters.category) {
          conditions.push(eq(forumThreads.category, filters.category));
        }
        
        if (filters.userId) {
          conditions.push(eq(forumThreads.userId, filters.userId));
        }
        
        if (filters.search) {
          conditions.push(
            or(
              ilike(forumThreads.title, `%${filters.search}%`),
              ilike(forumThreads.content, `%${filters.search}%`)
            )
          );
        }
        
        if (filters.approved !== undefined) {
          conditions.push(eq(forumThreads.isApproved, filters.approved));
        }
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
      }

      // First get the total count for pagination
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(query.as('filtered_threads'));
      
      const total = countResult[0]?.count || 0;

      // Then get the actual threads with pagination
      const threads = await query
        .orderBy(desc(forumThreads.isPinned), desc(forumThreads.lastReplyAt), desc(forumThreads.createdAt))
        .limit(limit)
        .offset(offset);

      return { threads, total };
    } catch (error) {
      console.error('Error getting forum threads:', error);
      return { threads: [], total: 0 };
    }
  }

  async getForumThreadById(threadId: number): Promise<ForumThread | undefined> {
    try {
      const [thread] = await db
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.id, threadId));
      
      // Increment view counter
      if (thread) {
        await db
          .update(forumThreads)
          .set({ views: thread.views + 1 })
          .where(eq(forumThreads.id, threadId));
      }
      
      return thread;
    } catch (error) {
      console.error(`Error getting forum thread ${threadId}:`, error);
      return undefined;
    }
  }

  async createForumThread(threadData: InsertForumThread): Promise<ForumThread | undefined> {
    try {
      const [newThread] = await db
        .insert(forumThreads)
        .values(threadData)
        .returning();
      
      // Update user forum activity
      await this.updateUserForumActivity(threadData.userId);
      
      return newThread;
    } catch (error) {
      console.error('Error creating forum thread:', error);
      return undefined;
    }
  }

  async moderateThread(
    threadId: number,
    moderation: {
      isApproved: boolean;
      isRejected: boolean;
      moderationNotes?: string;
      moderatedBy: number;
    }
  ): Promise<ForumThread | undefined> {
    try {
      const [updatedThread] = await db
        .update(forumThreads)
        .set({
          isApproved: moderation.isApproved,
          isRejected: moderation.isRejected,
          moderationNotes: moderation.moderationNotes,
          moderatedBy: moderation.moderatedBy,
          moderatedAt: new Date(),
        })
        .where(eq(forumThreads.id, threadId))
        .returning();
      
      return updatedThread;
    } catch (error) {
      console.error(`Error moderating thread ${threadId}:`, error);
      return undefined;
    }
  }

  // Reply methods
  async getForumReplies(
    threadId: number,
    page = 1,
    limit = 20,
    includeUnapproved = false
  ): Promise<{ replies: ForumReply[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      
      // Build query with conditions
      let query = db.select().from(forumReplies).where(eq(forumReplies.threadId, threadId));
      
      // Only include approved replies unless specified
      if (!includeUnapproved) {
        query = query.where(eq(forumReplies.isApproved, true));
      }

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(query.as('filtered_replies'));
      
      const total = countResult[0]?.count || 0;

      // Get the paginated replies
      const replies = await query
        .orderBy(desc(forumReplies.isAcceptedAnswer), asc(forumReplies.createdAt))
        .limit(limit)
        .offset(offset);

      return { replies, total };
    } catch (error) {
      console.error(`Error getting replies for thread ${threadId}:`, error);
      return { replies: [], total: 0 };
    }
  }

  async createForumReply(replyData: InsertForumReply): Promise<ForumReply | undefined> {
    try {
      const [newReply] = await db
        .insert(forumReplies)
        .values(replyData)
        .returning();
      
      // Update the thread's last reply timestamp
      await db
        .update(forumThreads)
        .set({ lastReplyAt: new Date() })
        .where(eq(forumThreads.id, replyData.threadId));
      
      // Update user forum activity
      await this.updateUserForumActivity(replyData.userId);
      
      // Create notification for thread owner
      const [thread] = await db
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.id, replyData.threadId));
      
      if (thread && thread.userId !== replyData.userId) {
        await this.createForumNotification({
          userId: thread.userId,
          threadId: thread.id,
          replyId: newReply.id,
          type: 'reply',
          message: `Someone replied to your thread "${thread.title}"`,
        });
      }
      
      // Create notification for parent reply author if this is a nested reply
      if (replyData.parentReplyId) {
        const [parentReply] = await db
          .select()
          .from(forumReplies)
          .where(eq(forumReplies.id, replyData.parentReplyId));
        
        if (parentReply && parentReply.userId !== replyData.userId) {
          await this.createForumNotification({
            userId: parentReply.userId,
            threadId: replyData.threadId,
            replyId: newReply.id,
            type: 'reply',
            message: 'Someone replied to your comment',
          });
        }
      }
      
      return newReply;
    } catch (error) {
      console.error('Error creating forum reply:', error);
      return undefined;
    }
  }

  async moderateReply(
    replyId: number,
    moderation: {
      isApproved: boolean;
      isRejected: boolean;
      moderationNotes?: string;
      moderatedBy: number;
    }
  ): Promise<ForumReply | undefined> {
    try {
      const [updatedReply] = await db
        .update(forumReplies)
        .set({
          isApproved: moderation.isApproved,
          isRejected: moderation.isRejected,
          moderationNotes: moderation.moderationNotes,
          moderatedBy: moderation.moderatedBy,
          moderatedAt: new Date(),
        })
        .where(eq(forumReplies.id, replyId))
        .returning();
      
      return updatedReply;
    } catch (error) {
      console.error(`Error moderating reply ${replyId}:`, error);
      return undefined;
    }
  }

  // Likes and activity
  async likeForumContent(likeData: InsertForumLike): Promise<ForumLike | undefined> {
    try {
      // Check if like already exists
      const [existingLike] = await db
        .select()
        .from(forumLikes)
        .where(
          and(
            eq(forumLikes.userId, likeData.userId),
            likeData.threadId ? eq(forumLikes.threadId, likeData.threadId) : isNull(forumLikes.threadId),
            likeData.replyId ? eq(forumLikes.replyId, likeData.replyId) : isNull(forumLikes.replyId)
          )
        );
      
      if (existingLike) {
        // Unlike if already liked
        await db
          .delete(forumLikes)
          .where(eq(forumLikes.id, existingLike.id));
        return undefined;
      }
      
      // Create new like
      const [newLike] = await db
        .insert(forumLikes)
        .values(likeData)
        .returning();
      
      // Increment likes received in user activity
      let contentOwnerId: number | undefined;
      
      if (likeData.threadId) {
        const [thread] = await db
          .select()
          .from(forumThreads)
          .where(eq(forumThreads.id, likeData.threadId));
        contentOwnerId = thread?.userId;
      } else if (likeData.replyId) {
        const [reply] = await db
          .select()
          .from(forumReplies)
          .where(eq(forumReplies.id, likeData.replyId));
        contentOwnerId = reply?.userId;
      }
      
      if (contentOwnerId && contentOwnerId !== likeData.userId) {
        await this.incrementUserForumLikes(contentOwnerId);
        
        // Create notification for content owner
        if (likeData.threadId) {
          const [thread] = await db
            .select()
            .from(forumThreads)
            .where(eq(forumThreads.id, likeData.threadId));
          
          await this.createForumNotification({
            userId: contentOwnerId,
            threadId: likeData.threadId,
            type: 'like',
            message: `Someone liked your thread "${thread?.title}"`,
          });
        } else if (likeData.replyId) {
          const [reply] = await db
            .select()
            .from(forumReplies)
            .where(eq(forumReplies.id, likeData.replyId));
          
          await this.createForumNotification({
            userId: contentOwnerId,
            threadId: reply?.threadId,
            replyId: likeData.replyId,
            type: 'like',
            message: 'Someone liked your reply',
          });
        }
      }
      
      return newLike;
    } catch (error) {
      console.error('Error liking forum content:', error);
      return undefined;
    }
  }

  async updateUserForumActivity(userId: number): Promise<UserForumActivity | undefined> {
    try {
      // Get thread and reply counts
      const threadCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(forumThreads)
        .where(eq(forumThreads.userId, userId));
      
      const replyCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(forumReplies)
        .where(eq(forumReplies.userId, userId));
      
      const acceptedAnswersResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(forumReplies)
        .where(
          and(
            eq(forumReplies.userId, userId),
            eq(forumReplies.isAcceptedAnswer, true)
          )
        );
      
      const threadCount = threadCountResult[0]?.count || 0;
      const replyCount = replyCountResult[0]?.count || 0;
      const acceptedAnswers = acceptedAnswersResult[0]?.count || 0;
      
      // Check if user activity record exists
      const [existingActivity] = await db
        .select()
        .from(userForumActivity)
        .where(eq(userForumActivity.userId, userId));
      
      if (existingActivity) {
        // Update existing record
        const [updatedActivity] = await db
          .update(userForumActivity)
          .set({
            threadCount,
            replyCount,
            acceptedAnswers,
            lastActive: new Date(),
          })
          .where(eq(userForumActivity.userId, userId))
          .returning();
        
        return updatedActivity;
      } else {
        // Create new record
        const [newActivity] = await db
          .insert(userForumActivity)
          .values({
            userId,
            threadCount,
            replyCount,
            acceptedAnswers,
          })
          .returning();
        
        return newActivity;
      }
    } catch (error) {
      console.error(`Error updating forum activity for user ${userId}:`, error);
      return undefined;
    }
  }

  async incrementUserForumLikes(userId: number): Promise<void> {
    try {
      // Check if user activity record exists
      const [existingActivity] = await db
        .select()
        .from(userForumActivity)
        .where(eq(userForumActivity.userId, userId));
      
      if (existingActivity) {
        // Increment likes
        await db
          .update(userForumActivity)
          .set({
            likesReceived: existingActivity.likesReceived + 1,
            lastActive: new Date(),
          })
          .where(eq(userForumActivity.userId, userId));
      } else {
        // Create new record with 1 like
        await db
          .insert(userForumActivity)
          .values({
            userId,
            likesReceived: 1,
          });
      }
    } catch (error) {
      console.error(`Error incrementing forum likes for user ${userId}:`, error);
    }
  }

  // Notifications methods
  async createForumNotification(notificationData: InsertForumNotification): Promise<ForumNotification | undefined> {
    try {
      const [notification] = await db
        .insert(forumNotifications)
        .values(notificationData)
        .returning();
      
      return notification;
    } catch (error) {
      console.error('Error creating forum notification:', error);
      return undefined;
    }
  }

  async getUserNotifications(
    userId: number,
    page = 1,
    limit = 10,
    unreadOnly = false
  ): Promise<{ notifications: ForumNotification[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      
      // Build query with conditions
      let query = db.select().from(forumNotifications).where(eq(forumNotifications.userId, userId));
      
      if (unreadOnly) {
        query = query.where(eq(forumNotifications.isRead, false));
      }

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(query.as('filtered_notifications'));
      
      const total = countResult[0]?.count || 0;

      // Get the paginated notifications
      const notifications = await query
        .orderBy(desc(forumNotifications.createdAt))
        .limit(limit)
        .offset(offset);

      return { notifications, total };
    } catch (error) {
      console.error(`Error getting notifications for user ${userId}:`, error);
      return { notifications: [], total: 0 };
    }
  }

  async markNotificationsAsRead(userId: number, notificationIds?: number[]): Promise<number> {
    try {
      let query = db
        .update(forumNotifications)
        .set({ isRead: true })
        .where(eq(forumNotifications.userId, userId));
      
      if (notificationIds && notificationIds.length > 0) {
        const idConditions = notificationIds.map(id => eq(forumNotifications.id, id));
        query = query.where(or(...idConditions));
      }
      
      const result = await query;
      return result.rowCount || 0;
    } catch (error) {
      console.error(`Error marking notifications as read for user ${userId}:`, error);
      return 0;
    }
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    try {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(forumNotifications)
        .where(
          and(
            eq(forumNotifications.userId, userId),
            eq(forumNotifications.isRead, false)
          )
        );
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error(`Error getting unread notification count for user ${userId}:`, error);
      return 0;
    }
  }

  // Top Contributors / Leaderboard
  async getTopContributors(limit = 10): Promise<UserForumActivity[]> {
    try {
      // Get users with the most activity (weighted combination of metrics)
      const topContributors = await db
        .select()
        .from(userForumActivity)
        .orderBy(
          sql`(thread_count * 2 + reply_count + accepted_answers * 3 + likes_received) DESC`
        )
        .limit(limit);
      
      return topContributors;
    } catch (error) {
      console.error('Error getting top contributors:', error);
      return [];
    }
  }
}

// Create a new instance of DatabaseStorage
export const storage = new DatabaseStorage();