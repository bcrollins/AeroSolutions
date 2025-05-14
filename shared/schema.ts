import { pgTable, text, serial, integer, boolean, timestamp, decimal, json, foreignKey, varchar, primaryKey, date, real, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
// Define the Json type locally instead of importing from drizzle-orm
type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// Stripe schema for validation
export const stripe = {
  paymentIntent: z.object({
    amount: z.number().positive(),
    metadata: z.record(z.string()).optional(),
  }),
  
  subscription: z.object({
    planId: z.number(),
    interval: z.enum(['monthly', 'annual']),
  }),
  
  cancelSubscription: z.object({
    subscriptionId: z.string(),
    immediate: z.boolean().optional(),
  }),
  
  webhook: z.object({
    id: z.string(),
    object: z.literal('event'),
    api_version: z.string().optional(),
    created: z.number(),
    data: z.object({
      object: z.any(),
    }),
    type: z.string(),
  }),
};

// Goal Type enum for A/B testing
export type ABTestGoalType = 'click' | 'form_submit' | 'page_view' | 'custom';

// Status enum for A/B testing
export type ABTestStatus = 'draft' | 'running' | 'completed' | 'stopped';

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User schema with Stripe integration and Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // Changed from serial to varchar for Replit Auth
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  password: text("password"), // Will be stored as a hashed value, optional for Replit Auth
  role: text("role").default("user").notNull(), // user, admin
  stripeCustomerId: text("stripe_customer_id"),
  businessType: text("business_type"), // Type of business the user is running
  preferences: text("preferences"), // User content preferences for feed personalization
  lastLoginAt: timestamp("last_login_at"),
  verified: boolean("verified").default(false), // Email verification status
  onboardingComplete: boolean("onboarding_complete").default(false), // Track onboarding completion
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
  businessType: true,
  preferences: true,
  profileImageUrl: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;

// Contact submission schema
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactSchema = createInsertSchema(contactSubmissions).pick({
  name: true,
  email: true,
  company: true,
  message: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contactSubmissions.$inferSelect;

// Client Preview schema
export const clientPreviews = pgTable("client_previews", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  clientName: text("client_name").notNull(),
  projectId: integer("project_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertClientPreviewSchema = createInsertSchema(clientPreviews).pick({
  code: true,
  clientName: true,
  projectId: true,
  expiresAt: true,
  isActive: true,
});

export type InsertClientPreview = z.infer<typeof insertClientPreviewSchema>;
export type ClientPreview = typeof clientPreviews.$inferSelect;

// Subscription plans schema
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  interval: text("interval").notNull(), // 'month', 'year'
  features: json("features").$type<string[]>().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  stripePriceId: text("stripe_price_id").notNull(),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).pick({
  name: true,
  description: true,
  price: true,
  interval: true,
  features: true,
  isActive: true,
  stripePriceId: true,
});

export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

// User subscriptions schema
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => subscriptionPlans.id),
  status: text("status").notNull(), // 'active', 'canceled', 'past_due'
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull(),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).pick({
  userId: true,
  planId: true,
  status: true,
  currentPeriodStart: true,
  currentPeriodEnd: true,
  cancelAtPeriodEnd: true,
  stripeSubscriptionId: true,
  stripeCustomerId: true,
});

export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
export type UserSubscription = typeof userSubscriptions.$inferSelect;

// Subscription price history schema
export const subscriptionPriceHistory = pgTable("subscription_price_history", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull().references(() => subscriptionPlans.id, { onDelete: "cascade" }),
  previousPrice: decimal("previous_price", { precision: 10, scale: 2 }).notNull(),
  newPrice: decimal("new_price", { precision: 10, scale: 2 }).notNull(),
  changeReason: text("change_reason").notNull(),
  aiAnalysis: json("ai_analysis").$type<{
    marketFactors: string[];
    competitiveAnalysis: string;
    userImpact: string;
    recommendedAdjustment: number;
    confidence: number;
  }>().notNull(),
  changedByUserId: integer("changed_by_user_id").references(() => users.id),
  isAutomatic: boolean("is_automatic").default(false).notNull(),
  appliedAt: timestamp("applied_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPriceHistorySchema = createInsertSchema(subscriptionPriceHistory).omit({
  id: true,
  createdAt: true
});

export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
export type PriceHistory = typeof subscriptionPriceHistory.$inferSelect;

// Subscription price recommendations schema
export const priceRecommendations = pgTable("price_recommendations", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull().references(() => subscriptionPlans.id, { onDelete: "cascade" }),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
  recommendedPrice: decimal("recommended_price", { precision: 10, scale: 2 }).notNull(),
  percentChange: decimal("percent_change", { precision: 10, scale: 2 }).notNull(),
  analysisData: json("analysis_data").$type<{
    marketTrends: {
      factor: string;
      impact: number;
      description: string;
    }[];
    userMetrics: {
      metric: string;
      value: number;
      impact: string;
    }[];
    competitiveAnalysis: {
      competitor: string;
      price: number;
      features: string[];
      comparison: string;
    }[];
    projectedImpact: {
      revenue: number;
      userRetention: number;
      newSubscriptions: number;
    };
    reasoning: string;
    confidenceScore: number;
  }>().notNull(),
  status: text("status").default("pending").notNull(), // pending, approved, rejected, applied
  reviewedByUserId: integer("reviewed_by_user_id").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

export const insertPriceRecommendationSchema = createInsertSchema(priceRecommendations).omit({
  id: true,
  createdAt: true
});

export type InsertPriceRecommendation = z.infer<typeof insertPriceRecommendationSchema>;
export type PriceRecommendation = typeof priceRecommendations.$inferSelect;

// Marketplace items schema
export const marketplaceItems = pgTable("marketplace_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  category: text("category").notNull(),
  tags: json("tags").$type<string[]>().default([]).notNull(),
  images: json("images").$type<string[]>().default([]).notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  stripeProductId: text("stripe_product_id"),
  stripePriceId: text("stripe_price_id"),
  // SEO fields
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  schemaMarkup: text("schema_markup"), // JSON-LD schema markup for the product
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMarketplaceItemSchema = createInsertSchema(marketplaceItems).pick({
  name: true,
  description: true,
  price: true,
  sellerId: true,
  category: true,
  tags: true,
  images: true,
  isAvailable: true,
  stripeProductId: true,
  stripePriceId: true,
});

export type InsertMarketplaceItem = z.infer<typeof insertMarketplaceItemSchema>;
export type MarketplaceItem = typeof marketplaceItems.$inferSelect;

// Marketplace orders schema
export const marketplaceOrders = pgTable("marketplace_orders", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyer_id").notNull().references(() => users.id),
  itemId: integer("item_id").notNull().references(() => marketplaceItems.id),
  quantity: integer("quantity").default(1).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // 'pending', 'completed', 'cancelled'
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMarketplaceOrderSchema = createInsertSchema(marketplaceOrders).pick({
  buyerId: true,
  itemId: true,
  quantity: true,
  totalPrice: true,
  status: true,
  stripePaymentIntentId: true,
});

export type InsertMarketplaceOrder = z.infer<typeof insertMarketplaceOrderSchema>;
export type MarketplaceOrder = typeof marketplaceOrders.$inferSelect;

// Marketplace Service Engagement schema
export const marketplaceServiceEngagement = pgTable("marketplace_service_engagement", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull().references(() => marketplaceItems.id),
  clicks: integer("clicks").default(0).notNull(),
  inquiries: integer("inquiries").default(0).notNull(),
  conversions: integer("conversions").default(0).notNull(),
  viewDuration: integer("view_duration").default(0).notNull(), // in seconds
  lastEngagedAt: timestamp("last_engaged_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMarketplaceServiceEngagementSchema = createInsertSchema(marketplaceServiceEngagement).pick({
  serviceId: true,
  clicks: true, 
  inquiries: true,
  conversions: true,
  viewDuration: true,
  lastEngagedAt: true,
});

export type InsertMarketplaceServiceEngagement = z.infer<typeof insertMarketplaceServiceEngagementSchema>;
export type MarketplaceServiceEngagement = typeof marketplaceServiceEngagement.$inferSelect;

// Advertisements schema
export const advertisements = pgTable("advertisements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'banner', 'sidebar', 'popup'
  imageUrl: text("image_url").notNull(),
  targetUrl: text("target_url").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(), 
  isActive: boolean("is_active").default(true).notNull(),
  impressions: integer("impressions").default(0).notNull(),
  clicks: integer("clicks").default(0).notNull(),
  position: text("position"), // 'header', 'footer', 'sidebar'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAdvertisementSchema = createInsertSchema(advertisements).pick({
  name: true,
  type: true,
  imageUrl: true,
  targetUrl: true,
  startDate: true,
  endDate: true,
  isActive: true,
  position: true,
});

export type InsertAdvertisement = z.infer<typeof insertAdvertisementSchema>;
export type Advertisement = typeof advertisements.$inferSelect;

// User Sessions Table for Analytics
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  sessionDuration: decimal("session_duration", { precision: 10, scale: 2 }).notNull().default("0"),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  device: text("device"),
  browser: text("browser"),
  ipAddress: text("ip_address"),
  referrer: text("referrer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Content View Metrics Table for Analytics
export const contentViewMetrics = pgTable("content_view_metrics", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull(),
  contentType: text("content_type").notNull(), // blog, page, product, etc.
  contentTitle: text("content_title").notNull(),
  views: integer("views").notNull().default(0),
  uniqueViews: integer("unique_views").notNull().default(0),
  avgTimeOnPage: decimal("avg_time_on_page", { precision: 10, scale: 2 }).notNull().default("0"),
  bounceRate: decimal("bounce_rate", { precision: 10, scale: 2 }).notNull().default("0"),
  conversionRate: decimal("conversion_rate", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User Feedback Table
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  title: text("title"),
  message: text("message").notNull(),
  content: text("content").notNull(),
  source: text("source").default("website").notNull(), // website, email, support, etc.
  category: text("category"), // bug, feature_request, general, etc.
  rating: integer("rating"), // 1-5 rating if applicable
  status: text("status").default("new").notNull(), // new, reviewed, addressed
  // Sentiment analysis fields
  sentimentProcessed: boolean("sentiment_processed").default(false).notNull(),
  sentimentLabel: text("sentiment_label"), // positive, negative, neutral
  sentimentScore: decimal("sentiment_score", { precision: 4, scale: 3 }), // 0-1 confidence score
  sentimentTopics: json("sentiment_topics").$type<string[]>(),
  sentimentUrgency: text("sentiment_urgency"), // low, medium, high
  sentimentRecommendedAction: text("sentiment_recommended_action"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Article Engagement Metrics Table
export const articleEngagement = pgTable("article_engagement", {
  id: serial("id").primaryKey(),
  article_id: integer("article_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  views: integer("views").notNull().default(0),
  shares: integer("shares").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  avgReadTime: decimal("avg_read_time", { precision: 10, scale: 2 }).notNull().default("0"),
  socialShares: json("social_shares").$type<Record<string, number>>().default({}),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create the insert schemas
export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertContentViewMetricSchema = createInsertSchema(contentViewMetrics).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertArticleEngagementSchema = createInsertSchema(articleEngagement).omit({
  id: true,
  createdAt: true
});

// Content compliance scans
export const contentComplianceScans = pgTable("content_compliance_scans", {
  id: serial("id").primaryKey(),
  contentId: text("content_id").notNull(),
  contentType: text("content_type").notNull(), // blog_post, marketplace_item, user_profile, etc.
  contentTitle: text("content_title").notNull(),
  scanStartedAt: timestamp("scan_started_at").defaultNow().notNull(),
  scanCompletedAt: timestamp("scan_completed_at"),
  status: text("status").notNull(), // in_progress, completed, failed
  passedCheck: boolean("passed_check"),
  score: integer("score"), // 0-100
  issueCount: integer("issue_count").default(0),
  categories: text("categories").notNull(), // comma-separated list of categories that were checked
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Content compliance alerts
export const contentComplianceAlerts = pgTable("content_compliance_alerts", {
  id: serial("id").primaryKey(),
  scanId: integer("scan_id").notNull().references(() => contentComplianceScans.id, { onDelete: "cascade" }),
  contentId: text("content_id").notNull(),
  contentType: text("content_type").notNull(),
  contentTitle: text("content_title").notNull(),
  category: text("category").notNull(), // us_law, gdpr, google_guidelines, etc.
  severity: text("severity").notNull(), // info, warning, violation, critical
  description: text("description").notNull(),
  suggestedAction: text("suggested_action").notNull(),
  relatedRegulation: text("related_regulation"),
  excerpt: text("excerpt"),
  status: text("status").default("open").notNull(), // open, resolved, acknowledged, false_positive
  resolvedAt: timestamp("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContentComplianceScanSchema = createInsertSchema(contentComplianceScans).omit({
  id: true,
  scanCompletedAt: true,
  passedCheck: true,
  score: true,
  issueCount: true,
  createdAt: true
});

export const insertContentComplianceAlertSchema = createInsertSchema(contentComplianceAlerts).omit({
  id: true,
  resolvedAt: true,
  resolutionNotes: true,
  createdAt: true
});

export type ContentComplianceScan = typeof contentComplianceScans.$inferSelect;
export type InsertContentComplianceScan = z.infer<typeof insertContentComplianceScanSchema>;

export type ContentComplianceAlert = typeof contentComplianceAlerts.$inferSelect;
export type InsertContentComplianceAlert = z.infer<typeof insertContentComplianceAlertSchema>;

// ROLLINSXBot queries for tracking AI interactions
export const rollinsxQueries = pgTable("rollinsx_queries", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  response: text("response"),
  user_id: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  model_used: text("model_used").default("grok-3-mini").notNull(),
  tokens_used: integer("tokens_used"),
  response_time: integer("response_time"), // in milliseconds
  session_id: text("session_id"),
  containsRecommendation: boolean("contains_recommendation").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertRollinsxQuerySchema = createInsertSchema(rollinsxQueries).omit({
  id: true,
  created_at: true
});

export type RollinsxQuery = typeof rollinsxQueries.$inferSelect;
export type InsertRollinsxQuery = z.infer<typeof insertRollinsxQuerySchema>;

// User data change logs for compliance and audit
export const userDataChangeLogs = pgTable("user_data_change_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  changedByUserId: integer("changed_by_user_id").references(() => users.id),
  changeType: text("change_type").notNull(), // profile-update, email-change, preference-update, etc.
  previousData: json("previous_data").$type<Record<string, any>>(),
  newData: json("new_data").$type<Record<string, any>>().notNull(),
  changeCategory: text("change_category"), // AI-categorized change type
  privacyImpact: text("privacy_impact"), // none, low, medium, high
  riskLevel: text("risk_level"), // low, medium, high
  securityFlags: json("security_flags").$type<string[]>().default([]),
  aiAnalysisNotes: text("ai_analysis_notes"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  regulatoryNotes: text("regulatory_notes"),
  requiresReview: boolean("requires_review").default(false),
  reviewStatus: text("review_status").default("pending"), // pending, approved, rejected
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserDataChangeLogSchema = createInsertSchema(userDataChangeLogs).omit({
  id: true,
  createdAt: true
});

export type UserDataChangeLog = typeof userDataChangeLogs.$inferSelect;
export type InsertUserDataChangeLog = z.infer<typeof insertUserDataChangeLogSchema>;

// Export types
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;

export type ContentViewMetric = typeof contentViewMetrics.$inferSelect;
export type InsertContentViewMetric = z.infer<typeof insertContentViewMetricSchema>;

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export type ArticleEngagement = typeof articleEngagement.$inferSelect;
export type InsertArticleEngagement = z.infer<typeof insertArticleEngagementSchema>;

// Generated content schema for blog posts, industry insights, and email templates
export const contents = pgTable("contents", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // blog_post, industry_insight, email_template
  status: text("status").notNull().default("draft"), // draft, published, archived
  wordCount: integer("word_count").notNull().default(0),
  tags: json("tags").$type<string[]>().default([]),
  authorId: integer("author_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  publishedAt: timestamp("published_at"),
  featuredImage: text("featured_image"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
});

export const insertContentSchema = createInsertSchema(contents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof contents.$inferSelect;

// Posts schema for feed content
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id),
  category: text("category"),
  tags: json("tags").$type<string[]>().default([]),
  imageUrl: text("image_url"),
  status: text("status").default("published").notNull(), // published, draft, archived
  viewCount: integer("view_count").default(0),
  likeCount: integer("like_count").default(0),
  
  // News Hub specific fields
  postType: text("post_type").default("regular").notNull(), // regular, car_event, ai_qa, news
  eventDate: timestamp("event_date"), // For car event articles
  eventLocation: text("event_location"), // For car event articles
  eventOrganizer: text("event_organizer"), // For car event articles
  
  // AI Q&A specific fields
  question: text("question"), // For Q&A posts
  aiGeneratedBy: text("ai_generated_by").default("xai"), // xai, openai, etc.
  readTimeMinutes: integer("read_time_minutes"),
  
  // Content management
  summary: text("summary"), // Short summary/excerpt of the post
  featuredPost: boolean("featured_post").default(false),
  premium: boolean("premium").default(false), // If true, requires subscription to access
  
  // SEO fields
  slug: text("slug").notNull().unique(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  schemaMarkup: text("schema_markup"), // JSON-LD schema markup for the blog post
  canonicalUrl: text("canonical_url"), // For managing duplicate content
  focusKeyword: text("focus_keyword"), // Primary keyword for optimization
  
  // Social sharing
  socialImage: text("social_image"), // Image specifically for social sharing
  twitterCardType: text("twitter_card_type").default("summary_large_image"),
  
  // Timestamps
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPostSchema = createInsertSchema(posts).pick({
  title: true,
  content: true,
  authorId: true,
  category: true,
  tags: true,
  imageUrl: true,
  status: true,
  postType: true,
  eventDate: true,
  eventLocation: true,
  eventOrganizer: true,
  question: true,
  aiGeneratedBy: true,
  readTimeMinutes: true,
  summary: true,
  featuredPost: true,
  premium: true,
  slug: true,
  seoTitle: true,
  seoDescription: true,
  seoKeywords: true,
  schemaMarkup: true,
  canonicalUrl: true,
  focusKeyword: true,
  socialImage: true,
  twitterCardType: true,
  publishedAt: true
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

// Website Performance Metrics schema
export const websiteMetrics = pgTable("website_metrics", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  page_load_time: decimal("page_load_time", { precision: 10, scale: 2 }).notNull(),
  ttfb: decimal("ttfb", { precision: 10, scale: 2 }).notNull(), // Time to First Byte
  fcp: decimal("fcp", { precision: 10, scale: 2 }), // First Contentful Paint
  lcp: decimal("lcp", { precision: 10, scale: 2 }), // Largest Contentful Paint
  cls: decimal("cls", { precision: 10, scale: 4 }), // Cumulative Layout Shift
  bounce_rate: decimal("bounce_rate", { precision: 10, scale: 2 }), // Percentage
  collected_at: timestamp("collected_at").defaultNow().notNull(),
  device_type: text("device_type"), // mobile, desktop, tablet
  browser: text("browser"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWebsiteMetricSchema = createInsertSchema(websiteMetrics).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type WebsiteMetric = typeof websiteMetrics.$inferSelect;
export type InsertWebsiteMetric = z.infer<typeof insertWebsiteMetricSchema>;

// Website Engagement schema for tracking user interactions
export const websiteEngagement = pgTable("website_engagement", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  pageUrl: text("page_url").notNull(),
  path: text("path").notNull(),
  clicks: integer("clicks").default(0).notNull(),
  timeOnPage: decimal("time_on_page", { precision: 10, scale: 2 }).default("0").notNull(), // Seconds
  scrollDepth: decimal("scroll_depth", { precision: 5, scale: 2 }).default("0").notNull(), // Percentage
  interactionCount: integer("interaction_count").default(0).notNull(),
  dateCollected: timestamp("date_collected").defaultNow().notNull(),
  deviceType: text("device_type"), // mobile, desktop, tablet
  browser: text("browser"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWebsiteEngagementSchema = createInsertSchema(websiteEngagement).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type WebsiteEngagement = typeof websiteEngagement.$inferSelect;
export type InsertWebsiteEngagement = z.infer<typeof insertWebsiteEngagementSchema>;

// UI Element Interaction schema to track detailed UI interactions
export const uiElementInteractions = pgTable("ui_element_interactions", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => users.id, { onDelete: "cascade" }),
  pageUrl: text("page_url").notNull(),
  elementId: text("element_id").notNull(), // HTML ID or data attribute
  elementType: text("element_type").notNull(), // button, link, input, etc.
  interactionType: text("interaction_type").notNull(), // click, hover, focus, submit, etc.
  interactionDuration: decimal("interaction_duration", { precision: 10, scale: 2 }).default("0"), // milliseconds
  wasSuccessful: boolean("was_successful").default(true), // Did the interaction complete successfully
  errorMessage: text("error_message"), // If there was an error
  deviceType: text("device_type"), // mobile, desktop, tablet
  browser: text("browser"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUiElementInteractionSchema = createInsertSchema(uiElementInteractions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type UiElementInteraction = typeof uiElementInteractions.$inferSelect;
export type InsertUiElementInteraction = z.infer<typeof insertUiElementInteractionSchema>;

// Website conversions schema for tracking conversion metrics for client websites
export const websiteConversions = pgTable("website_conversions", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  pageUrl: text("page_url").notNull(),
  conversionType: text("conversion_type").notNull(), // form_submission, purchase, signup, etc.
  conversions: integer("conversions").default(0).notNull(),
  conversionValue: decimal("conversion_value", { precision: 10, scale: 2 }).default("0").notNull(),
  bounceRate: decimal("bounce_rate", { precision: 5, scale: 2 }).default("0").notNull(),
  visitToConversion: decimal("visit_to_conversion", { precision: 5, scale: 2 }).default("0").notNull(),
  source: text("source"), // traffic source
  medium: text("medium"), // traffic medium
  campaign: text("campaign"), // campaign identifier
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWebsiteConversionSchema = createInsertSchema(websiteConversions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type WebsiteConversion = typeof websiteConversions.$inferSelect;
export type InsertWebsiteConversion = z.infer<typeof insertWebsiteConversionSchema>;

// User onboarding schema for XAI-enhanced personalized onboarding
export const userOnboarding = pgTable("user_onboarding", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  onboardingStep: integer("onboarding_step").default(1).notNull(), // Current step in the onboarding process
  completedSteps: json("completed_steps").$type<number[]>().default([]).notNull(),
  businessType: text("business_type"), // Type of business or industry
  businessGoals: text("business_goals"), // Marketing, growth, etc.
  personalizedTips: text("personalized_tips"), // AI-generated tips
  preferenceTags: json("preference_tags").$type<string[]>().default([]),
  aiGeneratedProfile: json("ai_generated_profile").$type<Record<string, any>>().default({}),
  lastEngagedAt: timestamp("last_engaged_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserOnboardingSchema = createInsertSchema(userOnboarding).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type UserOnboarding = typeof userOnboarding.$inferSelect;
export type InsertUserOnboarding = z.infer<typeof insertUserOnboardingSchema>;

// Mockup request schema for tracking client mockup generation requests
export const mockupRequests = pgTable("mockup_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  businessType: text("business_type").notNull(),
  businessGoals: text("business_goals"),
  industryCategory: text("industry_category"),
  targetAudience: text("target_audience"),
  designPreferences: text("design_preferences"),
  status: text("status").default("pending").notNull(), // pending, completed, cancelled
  completionTime: decimal("completion_time", { precision: 10, scale: 2 }),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMockupRequestSchema = createInsertSchema(mockupRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type MockupRequest = typeof mockupRequests.$inferSelect;
export type InsertMockupRequest = z.infer<typeof insertMockupRequestSchema>;

// Mockup engagement schema for tracking client mockup views and feedback
export const mockupEngagement = pgTable("mockup_engagement", {
  id: serial("id").primaryKey(),
  mockupId: integer("mockup_id").references(() => mockupRequests.id).notNull(),
  views: integer("views").default(0).notNull(),
  lastViewed: timestamp("last_viewed").defaultNow(),
  feedback: text("feedback"),
  rating: integer("rating"), // 1-5 star rating
  sharedCount: integer("shared_count").default(0),
  engagementSource: text("engagement_source"), // website, email, social, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMockupEngagementSchema = createInsertSchema(mockupEngagement).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type MockupEngagement = typeof mockupEngagement.$inferSelect;
export type InsertMockupEngagement = z.infer<typeof insertMockupEngagementSchema>;

// Generated mockups schema for storing AI-generated mockups
export const generatedMockups = pgTable("generated_mockups", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").references(() => mockupRequests.id).notNull(),
  templateName: text("template_name").notNull(),
  mockupData: json("mockup_data").$type<Record<string, any>>().notNull(), // Stores the template configuration
  thumbnailUrl: text("thumbnail_url"),
  fullPreviewUrl: text("full_preview_url"),
  htmlContent: text("html_content"), // Stores the rendered HTML content
  cssContent: text("css_content"), // Custom CSS if any
  aiAnalysisNotes: text("ai_analysis_notes"), // XAI analysis notes
  industryRelevanceScore: decimal("industry_relevance_score", { precision: 3, scale: 1 }),
  conversionOptimizationScore: decimal("conversion_optimization_score", { precision: 3, scale: 1 }),
  accessToken: text("access_token"), // For secure sharing
  status: text("status").default("active").notNull(), // active, archived, deleted
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGeneratedMockupSchema = createInsertSchema(generatedMockups).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type GeneratedMockup = typeof generatedMockups.$inferSelect;
export type InsertGeneratedMockup = z.infer<typeof insertGeneratedMockupSchema>;

// Email Campaigns schema for tracking client email campaign suggestions and templates
export const emailCampaigns = pgTable("email_campaigns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  campaignType: text("campaign_type").notNull(), // welcome, promotional, newsletter, etc.
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  template: text("template"), // Optional template ID if using a predefined template
  status: text("status").default("draft").notNull(), // draft, scheduled, sent
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  openRate: decimal("open_rate", { precision: 10, scale: 2 }),
  clickRate: decimal("click_rate", { precision: 10, scale: 2 }),
  audienceSize: integer("audience_size"),
  isAiGenerated: boolean("is_ai_generated").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = z.infer<typeof insertEmailCampaignSchema>;

// Social media platforms
export const socialPlatforms = pgTable("social_platforms", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(), // twitter, linkedin, instagram, facebook, etc.
  displayName: varchar("display_name", { length: 100 }).notNull(),
  description: text("description"),
  apiConfig: json("api_config").$type<{
    baseUrl?: string;
    endpoints?: Record<string, string>;
    authType?: string;
    scopes?: string[];
    characterLimit?: number;
  }>().default({}),
  isActive: boolean("is_active").default(true).notNull(),
  icon: varchar("icon", { length: 50 }), // CSS class for platform icon
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSocialPlatformSchema = createInsertSchema(socialPlatforms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SocialPlatform = typeof socialPlatforms.$inferSelect;
export type InsertSocialPlatform = z.infer<typeof insertSocialPlatformSchema>;

// Social media posts schema for automation and scheduling across multiple platforms
export const socialPosts = pgTable("social_posts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(), // Allow longer content for platforms that support it
  platformId: integer("platform_id").notNull().references(() => socialPlatforms.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("draft"), // draft, scheduled, processing, posted, failed, cancelled, missed
  scheduledTime: timestamp("scheduled_time"),
  postedAt: timestamp("posted_at"),
  externalId: text("external_id"), // Platform-specific post ID after posting
  errorMessage: text("error_message"),
  contentSourceId: integer("content_source_id"), // Generic reference to source content (could be article, product, etc.)
  contentSourceType: varchar("content_source_type", { length: 50 }), // Type of source (post, product, etc.)
  mediaUrls: json("media_urls").$type<string[]>().default([]),
  metrics: json("metrics").$type<{
    impressions?: number;
    likes?: number;
    shares?: number;
    comments?: number;
    clicks?: number;
    engagement?: number;
    reach?: number;
    // Platform-specific metrics can be included
    twitter?: {
      retweets?: number;
      quotes?: number;
    };
    linkedin?: {
      reactions?: number;
    };
    instagram?: {
      saves?: number;
    };
  }>().default({}),
  hashTags: json("hash_tags").$type<string[]>().default([]),
  mentions: json("mentions").$type<string[]>().default([]),
  metadata: json("metadata").$type<Record<string, any>>().default({}),
  bufferPostId: text("buffer_post_id"), // For integration with Buffer API
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSocialPostSchema = createInsertSchema(socialPosts).omit({
  id: true,
  externalId: true,
  postedAt: true,
  errorMessage: true,
  metrics: true,
  bufferPostId: true,
  createdAt: true,
  updatedAt: true,
});

export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialPost = z.infer<typeof insertSocialPostSchema>;

// Keep Twitter posts for backward compatibility
export const twitterPosts = pgTable("twitter_posts", {
  id: serial("id").primaryKey(),
  content: varchar("content", { length: 280 }).notNull(),
  status: text("status").notNull().default("draft"), // draft, scheduled, processing, posted, failed, cancelled, missed
  scheduledTime: timestamp("scheduled_time"),
  postedAt: timestamp("posted_at"),
  externalId: text("external_id"), // Twitter post ID after posting
  errorMessage: text("error_message"),
  articleId: integer("article_id").references(() => posts.id, { onDelete: "set null" }),
  mediaUrls: json("media_urls").$type<string[]>().default([]),
  metrics: json("metrics").$type<{
    impressions?: number;
    likes?: number;
    retweets?: number;
    replies?: number;
    clicks?: number;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTwitterPostSchema = createInsertSchema(twitterPosts).omit({
  id: true,
  externalId: true,
  postedAt: true,
  errorMessage: true,
  metrics: true,
  createdAt: true,
  updatedAt: true,
});

export type TwitterPost = typeof twitterPosts.$inferSelect;
export type InsertTwitterPost = z.infer<typeof insertTwitterPostSchema>;

// User activity tracking schema
export const userActivity = pgTable("user_activity", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // pageview, click, project_update, etc.
  detail: text("detail"),
  metadata: json("metadata").$type<Record<string, any>>().default({}),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertUserActivitySchema = createInsertSchema(userActivity).omit({
  id: true,
  timestamp: true,
});

export type UserActivity = typeof userActivity.$inferSelect;
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;

// Page views schema for analytics tracking
export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  sessionId: text("session_id"), // For anonymous tracking
  path: text("path").notNull(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  device: text("device"),
  browser: text("browser"),
  duration: integer("duration").default(0), // Time spent on page in seconds
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPageViewSchema = createInsertSchema(pageViews).omit({
  id: true,
  createdAt: true,
  timestamp: true,
});

export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = z.infer<typeof insertPageViewSchema>;

// Analytics events schema for tracking user actions
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  sessionId: text("session_id"), // For anonymous tracking
  category: text("category").notNull(), // subscription, content, feature, etc.
  action: text("action").notNull(), // view, click, purchase, etc.
  label: text("label"), // More specific information about the action
  value: integer("value"), // Numeric value associated with the event
  path: text("path").notNull(), // Page path where the event occurred
  metadata: json("metadata").$type<Record<string, any>>().default({}),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({
  id: true,
  createdAt: true,
  timestamp: true,
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;

// Subscription analytics schema for tracking subscription metrics
export const subscriptionAnalytics = pgTable("subscription_analytics", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(), // Date of the metrics
  newSubscriptions: integer("new_subscriptions").default(0).notNull(),
  canceledSubscriptions: integer("canceled_subscriptions").default(0).notNull(),
  activeSubscriptions: integer("active_subscriptions").default(0).notNull(),
  trialSubscriptions: integer("trial_subscriptions").default(0).notNull(),
  trialConversions: integer("trial_conversions").default(0).notNull(),
  monthlyRecurringRevenue: decimal("monthly_recurring_revenue", { precision: 10, scale: 2 }).default("0").notNull(),
  annualRecurringRevenue: decimal("annual_recurring_revenue", { precision: 10, scale: 2 }).default("0").notNull(),
  churnRate: decimal("churn_rate", { precision: 10, scale: 2 }).default("0").notNull(),
  planBreakdown: json("plan_breakdown").$type<{
    planId: number;
    planName: string;
    subscribers: number;
    percentageOfTotal: number;
    revenue: number;
  }[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSubscriptionAnalyticsSchema = createInsertSchema(subscriptionAnalytics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SubscriptionAnalytic = typeof subscriptionAnalytics.$inferSelect;
export type InsertSubscriptionAnalytic = z.infer<typeof insertSubscriptionAnalyticsSchema>;

// User retention messages schema
export const userRetentionMessages = pgTable("user_retention_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(), // email, in-app
  content: text("content").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("generated"), // generated, sent, failed
  metadata: json("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserRetentionMessageSchema = createInsertSchema(userRetentionMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserRetentionMessage = typeof userRetentionMessages.$inferSelect;
export type InsertUserRetentionMessage = z.infer<typeof insertUserRetentionMessageSchema>;

// Ad platforms for external integrations
export const adPlatforms = pgTable("ad_platforms", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(), // google_ads, facebook_ads, linkedin_ads, etc.
  displayName: varchar("display_name", { length: 100 }).notNull(),
  description: text("description"),
  apiConfig: json("api_config").$type<{
    baseUrl?: string;
    endpoints?: Record<string, string>;
    authType?: string;
    scopes?: string[];
  }>().default({}),
  isActive: boolean("is_active").default(true).notNull(),
  icon: varchar("icon", { length: 50 }), // CSS class for platform icon
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAdPlatformSchema = createInsertSchema(adPlatforms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AdPlatform = typeof adPlatforms.$inferSelect;
export type InsertAdPlatform = z.infer<typeof insertAdPlatformSchema>;

// Ad campaigns for targeted advertising
export const adCampaigns = pgTable("ad_campaigns", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  objective: varchar("objective", { length: 50 }).notNull(), // awareness, consideration, conversion
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft, active, paused, completed, archived
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  budget: decimal("budget", { precision: 10, scale: 2 }), // Total campaign budget
  dailyBudget: decimal("daily_budget", { precision: 10, scale: 2 }), // Daily spend limit
  targetAudience: json("target_audience").$type<{
    demographics?: {
      ageRange?: string[];
      gender?: string[];
      location?: string[];
      language?: string[];
    };
    interests?: string[];
    behaviors?: string[];
    customAudiences?: string[];
  }>().default({}),
  platformIds: json("platform_ids").$type<number[]>().default([]), // References to ad_platforms
  metrics: json("metrics").$type<{
    impressions?: number;
    clicks?: number;
    conversions?: number;
    ctr?: number; // Click-through rate
    cpc?: number; // Cost per click
    cpm?: number; // Cost per thousand impressions
    roas?: number; // Return on ad spend
    spend?: number; // Total spent so far
  }>().default({}),
  externalIds: json("external_ids").$type<Record<string, string>>().default({}), // Map platform IDs to external campaign IDs
  tags: json("tags").$type<string[]>().default([]),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAdCampaignSchema = createInsertSchema(adCampaigns).omit({
  id: true,
  metrics: true,
  externalIds: true,
  createdAt: true,
  updatedAt: true,
});

export type AdCampaign = typeof adCampaigns.$inferSelect;
export type InsertAdCampaign = z.infer<typeof insertAdCampaignSchema>;

// Ad groups within campaigns
export const adGroups = pgTable("ad_groups", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => adCampaigns.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft, active, paused, archived
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  bidAmount: decimal("bid_amount", { precision: 10, scale: 2 }),
  bidStrategy: varchar("bid_strategy", { length: 50 }), // cpc, cpm, cpa, etc.
  metrics: json("metrics").$type<{
    impressions?: number;
    clicks?: number;
    conversions?: number;
    ctr?: number;
    cpc?: number;
    cpm?: number;
    spend?: number;
  }>().default({}),
  externalIds: json("external_ids").$type<Record<string, string>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAdGroupSchema = createInsertSchema(adGroups).omit({
  id: true,
  metrics: true,
  externalIds: true,
  createdAt: true,
  updatedAt: true,
});

export type AdGroup = typeof adGroups.$inferSelect;
export type InsertAdGroup = z.infer<typeof insertAdGroupSchema>;

// Ads within ad groups
export const adCreatives = pgTable("ad_creatives", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => adGroups.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 30 }).notNull(), // image, video, carousel, text, dynamic
  headline: varchar("headline", { length: 100 }),
  description: text("description"),
  callToAction: varchar("call_to_action", { length: 50 }),
  imageUrls: json("image_urls").$type<string[]>().default([]),
  videoUrl: varchar("video_url", { length: 255 }),
  destinationUrl: varchar("destination_url", { length: 255 }),
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft, active, paused, approved, rejected, archived
  rejectionReason: text("rejection_reason"),
  aiGenerated: boolean("ai_generated").default(false).notNull(),
  aiPrompt: text("ai_prompt"), // Prompt used to generate this ad
  metrics: json("metrics").$type<{
    impressions?: number;
    clicks?: number;
    conversions?: number;
    ctr?: number;
    cpc?: number;
    cpm?: number;
    relevanceScore?: number; // Platform-specific quality score
  }>().default({}),
  externalIds: json("external_ids").$type<Record<string, string>>().default({}),
  performanceRating: integer("performance_rating"), // 1-10 AI-generated rating of ad effectiveness
  abTestGroup: varchar("ab_test_group", { length: 50 }), // For A/B testing different creatives
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAdCreativeSchema = createInsertSchema(adCreatives).omit({
  id: true,
  metrics: true,
  externalIds: true,
  performanceRating: true,
  rejectionReason: true,
  createdAt: true,
  updatedAt: true,
});

export type AdCreative = typeof adCreatives.$inferSelect;
export type InsertAdCreative = z.infer<typeof insertAdCreativeSchema>;

// Ad targeting profiles for reusable audience segments
export const adTargetingProfiles = pgTable("ad_targeting_profiles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  criteria: json("criteria").$type<{
    demographics?: {
      ageRange?: string[];
      gender?: string[];
      location?: string[];
      language?: string[];
      income?: string[];
      education?: string[];
      occupation?: string[];
    };
    interests?: string[];
    behaviors?: string[];
    keywords?: string[];
    lookalikes?: string[];
    excludedAudiences?: string[];
    platforms?: string[];
    devices?: string[];
  }>().default({}),
  size: integer("size"), // Estimated audience size
  lastUsed: timestamp("last_used"),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAdTargetingProfileSchema = createInsertSchema(adTargetingProfiles).omit({
  id: true,
  size: true,
  lastUsed: true,
  createdAt: true,
  updatedAt: true,
});

export type AdTargetingProfile = typeof adTargetingProfiles.$inferSelect;
export type InsertAdTargetingProfile = z.infer<typeof insertAdTargetingProfileSchema>;

// In-app notifications schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // system, retention, marketing, etc.
  title: varchar("title", { length: 100 }),
  content: text("content").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("unread"), // unread, read, dismissed
  metadata: json("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  readAt: true,
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Achievement definition schema
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull().unique(), // first_mockup_viewed, profile_completed, etc.
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 50 }),
  points: integer("points").default(10).notNull(),
  criteria: json("criteria").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User achievements schema
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // Matches achievements.type
  title: varchar("title", { length: 100 }).notNull(),
  content: text("content").notNull(), // Personalized achievement message
  status: varchar("status", { length: 20 }).notNull().default("unread"), // unread, read, dismissed
  metadata: json("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  createdAt: true,
  readAt: true,
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

// System logs table for monitoring and bug detection
export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  level: text("level").notNull(), // error, warn, info, debug
  message: text("message").notNull(),
  source: text("source"), // Component or file that generated the log
  context: json("context"), // Additional contextual data
  stackTrace: text("stack_trace"),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  sessionId: text("session_id"),
  requestId: text("request_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const insertLogSchema = createInsertSchema(logs).omit({
  id: true,
});

export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;

// Performance Logs Schema
export const performance_logs = pgTable("performance_logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  pageUrl: text("page_url"),
  loadTime: integer("load_time"), // in milliseconds
  apiEndpoint: text("api_endpoint"),
  responseTime: integer("response_time"), // in milliseconds
  memoryUsage: real("memory_usage"), // in MB
  cpuUsage: real("cpu_usage"), // in percentage
  errorType: text("error_type"),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  sessionId: text("session_id"),
  userAgent: text("user_agent"),
  metricType: text("metric_type").default("general").notNull(), // page_load, api_response, resource, error, etc.
});

export const insertPerformanceLogSchema = createInsertSchema(performance_logs).omit({
  id: true,
});

export type PerformanceLog = typeof performance_logs.$inferSelect;
export type InsertPerformanceLog = z.infer<typeof insertPerformanceLogSchema>;

// Performance Metrics Schema (for summary/aggregated data)
export const performance_metrics = pgTable("performance_metrics", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  avgPageLoadTime: real("avg_page_load_time"), // in milliseconds
  avgApiResponseTime: real("avg_api_response_time"), // in milliseconds
  totalErrorCount: integer("total_error_count").default(0),
  avgMemoryUsage: real("avg_memory_usage"), // in MB
  avgCpuUsage: real("avg_cpu_usage"), // in percentage
  slowestEndpoints: json("slowest_endpoints").$type<{path: string, avgTime: number}[]>(),
  slowestPages: json("slowest_pages").$type<{path: string, avgTime: number}[]>(),
  commonErrors: json("common_errors").$type<{type: string, count: number}[]>(),
  timeframe: text("timeframe").notNull(), // hourly, daily, weekly, monthly
});

export const insertPerformanceMetricSchema = createInsertSchema(performance_metrics).omit({
  id: true,
});

export type PerformanceMetric = typeof performance_metrics.$inferSelect;
export type InsertPerformanceMetric = z.infer<typeof insertPerformanceMetricSchema>;

// Performance Recommendations Schema
export const performance_recommendations = pgTable("performance_recommendations", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  type: text("type").notNull(), // frontend, backend, general
  priority: text("priority").notNull(), // high, medium, low
  issue: text("issue").notNull(),
  recommendation: text("recommendation").notNull(),
  expectedImpact: text("expected_impact").notNull(),
  implementationComplexity: text("implementation_complexity").notNull(), // easy, medium, complex
  code: text("code"), // Optional code snippet
  status: text("status").default("pending").notNull(), // pending, implemented, rejected, in_progress
  implementedAt: timestamp("implemented_at"),
  implementedBy: integer("implemented_by").references(() => users.id, { onDelete: "set null" }),
});

export const insertPerformanceRecommendationSchema = createInsertSchema(performance_recommendations).omit({
  id: true,
  timestamp: true,
});

export type PerformanceRecommendation = typeof performance_recommendations.$inferSelect;
export type InsertPerformanceRecommendation = z.infer<typeof insertPerformanceRecommendationSchema>;

// Support tickets table
export const support_tickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  sessionId: text("session_id"),
  status: text("status").default("open").notNull(), // open, escalated, resolved, closed
  priority: text("priority").default("medium").notNull(), // low, medium, high, critical
  category: text("category"), // billing, technical, account, feature, other
  metadata: json("metadata"), // For additional context
  firstResponseTime: integer("first_response_time"), // Time in seconds to first response
  resolutionTime: integer("resolution_time"), // Time in seconds to resolution
  internalNotes: text("internal_notes"), // For internal use
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSupportTicketSchema = createInsertSchema(support_tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type SupportTicket = typeof support_tickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;

// Support responses table
export const support_responses = pgTable("support_responses", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => support_tickets.id, { onDelete: "cascade" }),
  response: text("response").notNull(),
  isAutomated: boolean("is_automated").default(false).notNull(),
  responderId: integer("responder_id").references(() => users.id, { onDelete: "set null" }),
  metadata: json("metadata"), // For AI analysis and additional context
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSupportResponseSchema = createInsertSchema(support_responses).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type SupportResponse = typeof support_responses.$inferSelect;
export type InsertSupportResponse = z.infer<typeof insertSupportResponseSchema>;

// Platform compatibility issues table
export const platform_compatibility_issues = pgTable("platform_compatibility_issues", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(), // ios, android, web, specific browser
  issueType: text("issue_type").notNull(), // rendering, performance, input handling
  affectedComponents: json("affected_components").notNull(), // Array of component names
  description: text("description").notNull(),
  recommendedFix: text("recommended_fix").notNull(),
  priority: text("priority").notNull(), // high, medium, low
  occurrences: integer("occurrences").default(1).notNull(),
  status: text("status").default("open").notNull(), // open, in-progress, resolved, closed
  fixedInVersion: text("fixed_in_version"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  logIds: json("log_ids"), // Array of log IDs related to this issue
});

export const insertPlatformCompatibilityIssueSchema = createInsertSchema(platform_compatibility_issues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  occurrences: true,
});

export type PlatformCompatibilityIssue = typeof platform_compatibility_issues.$inferSelect;
export type InsertPlatformCompatibilityIssue = z.infer<typeof insertPlatformCompatibilityIssueSchema>;

// Bug reports table for tracking detected issues
export const bug_reports = pgTable("bug_reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // low, medium, high, critical
  status: text("status").notNull(), // open, in-progress, resolved, closed, fix-attempted
  source: text("source").notNull(), // automated-log-analysis, user-feedback, manual-report
  affectedComponent: text("affected_component"),
  suggestedFix: text("suggested_fix"),
  canAutoFix: boolean("can_auto_fix").default(false),
  autoFixCode: text("auto_fix_code"),
  assignedToUserId: integer("assigned_to_user_id").references(() => users.id, { onDelete: "set null" }),
  reportedByUserId: integer("reported_by_user_id").references(() => users.id, { onDelete: "set null" }),
  logIds: json("log_ids").$type<number[]>(),
  feedbackId: integer("feedback_id").references(() => feedback.id, { onDelete: "set null" }),
  fixAttemptedAt: timestamp("fix_attempted_at"),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBugReportSchema = createInsertSchema(bug_reports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type BugReport = typeof bug_reports.$inferSelect;
export type InsertBugReport = z.infer<typeof insertBugReportSchema>;

// Brand consistency issues table for tracking brand guideline violations
export const brand_consistency_issues = pgTable("brand_consistency_issues", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // color, typography, tone, logo, other
  severity: varchar("severity", { length: 20 }).notNull(), // low, medium, high
  location: text("location").notNull(), // file path, content ID, etc.
  description: text("description").notNull(),
  recommendation: text("recommendation").notNull(),
  canAutoFix: boolean("can_auto_fix").default(false),
  autoFixCode: text("auto_fix_code"),
  status: varchar("status", { length: 20 }).notNull().default("open"), // open, fixed, ignored
  fixedByUserId: integer("fixed_by_user_id").references(() => users.id, { onDelete: "set null" }),
  ignoredByUserId: integer("ignored_by_user_id").references(() => users.id, { onDelete: "set null" }),
  fixedAt: timestamp("fixed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBrandConsistencyIssueSchema = createInsertSchema(brand_consistency_issues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type BrandConsistencyIssue = typeof brand_consistency_issues.$inferSelect;
export type InsertBrandConsistencyIssue = z.infer<typeof insertBrandConsistencyIssueSchema>;

// A/B Testing schema
export const abTests = pgTable("ab_tests", {
  id: text("id").primaryKey(), // UUID
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").$type<ABTestStatus>().default("draft").notNull(), // draft, running, completed, stopped
  elementSelector: text("element_selector").notNull(), // CSS selector for the element to test
  goalType: text("goal_type").$type<ABTestGoalType>().notNull(), // click, form_submit, page_view, custom
  goalSelector: text("goal_selector"), // CSS selector for goal conversion (if applicable)
  minSampleSize: integer("min_sample_size").default(100).notNull(), // Minimum sample size for statistical significance
  confidenceLevel: decimal("confidence_level", { precision: 3, scale: 2 }).default("0.95").notNull(), // Default 95% confidence
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const abTestVariants = pgTable("ab_test_variants", {
  id: text("id").primaryKey(), // UUID
  testId: text("test_id").notNull().references(() => abTests.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  changes: json("changes").$type<Record<string, any>>().notNull(), // JSON of changes to apply
  isControl: boolean("is_control").default(false).notNull(), // Is this the control variant?
  weight: integer("weight").default(1).notNull(), // Relative weight for traffic distribution
  impressions: integer("impressions").default(0), // Cached impression count
  conversions: integer("conversions").default(0), // Cached conversion count
  conversionRate: decimal("conversion_rate", { precision: 6, scale: 3 }).default("0") // Cached conversion rate (%)
});

export const abTestImpressions = pgTable("ab_test_impressions", {
  id: text("id").primaryKey(), // UUID
  testId: text("test_id").notNull().references(() => abTests.id, { onDelete: "cascade" }),
  variantId: text("variant_id").notNull().references(() => abTestVariants.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id), // Optional: track which user saw this variant
  sessionId: text("session_id"), // For anonymous tracking
  timestamp: timestamp("timestamp").defaultNow().notNull()
});

export const abTestConversions = pgTable("ab_test_conversions", {
  id: text("id").primaryKey(), // UUID
  testId: text("test_id").notNull().references(() => abTests.id, { onDelete: "cascade" }),
  variantId: text("variant_id").notNull().references(() => abTestVariants.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id), // Optional: track which user converted
  sessionId: text("session_id"), // For anonymous tracking
  timestamp: timestamp("timestamp").defaultNow().notNull()
});

export const insertABTestSchema = createInsertSchema(abTests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertABTestVariantSchema = createInsertSchema(abTestVariants).omit({
  id: true,
  impressions: true,
  conversions: true,
  conversionRate: true,
});

export type ABTest = typeof abTests.$inferSelect & {
  variants?: ABTestVariant[];
};
export type ABTestVariant = typeof abTestVariants.$inferSelect;
export type ABTestImpression = typeof abTestImpressions.$inferSelect;
export type ABTestConversion = typeof abTestConversions.$inferSelect;
export type InsertABTest = z.infer<typeof insertABTestSchema>;
export type InsertABTestVariant = z.infer<typeof insertABTestVariantSchema>;

// AI Products schema
export const aiProducts = pgTable("ai_products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  shortDescription: text("short_description").notNull(),
  icon: text("icon").notNull(), // Lucide icon name
  category: text("category").notNull(), // business, content, technical, etc.
  features: json("features").$type<string[]>().notNull(),
  demoUrl: text("demo_url"),
  imageUrl: text("image_url"),
  requiredPlan: text("required_plan").notNull(), // starter, professional, enterprise
  isActive: boolean("is_active").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAiProductSchema = createInsertSchema(aiProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertAiProduct = z.infer<typeof insertAiProductSchema>;
export type AiProduct = typeof aiProducts.$inferSelect;

// AI Product Usage schema
export const aiProductUsage = pgTable("ai_product_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => aiProducts.id),
  usageCount: integer("usage_count").default(0).notNull(),
  lastUsedAt: timestamp("last_used_at"),
  userRating: integer("user_rating"), // 1-5 rating
  userFeedback: text("user_feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAiProductUsageSchema = createInsertSchema(aiProductUsage).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertAiProductUsage = z.infer<typeof insertAiProductUsageSchema>;
export type AiProductUsage = typeof aiProductUsage.$inferSelect;

// Course schema
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  coverImage: text("cover_image"),
  instructor: text("instructor").notNull(),
  instructorBio: text("instructor_bio"),
  durationMinutes: integer("duration_minutes").notNull(),
  difficulty: text("difficulty").default("intermediate").notNull(), // beginner, intermediate, advanced, expert
  category: text("category").notNull(),
  tags: json("tags").$type<string[]>().default([]),
  prerequisites: json("prerequisites").$type<string[]>().default([]),
  objectives: json("objectives").$type<string[]>().notNull(),
  status: text("status").default("draft").notNull(), // draft, published, archived
  requiredSubscriptionLevel: text("required_subscription_level").default("professional").notNull(), // starter, professional, enterprise
  featured: boolean("featured").default(false).notNull(),
  popularity: integer("popularity").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0").notNull(),
  ratingCount: integer("rating_count").default(0).notNull(),
  enrollmentCount: integer("enrollment_count").default(0).notNull(),
  completionCount: integer("completion_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  rating: true,
  ratingCount: true,
  enrollmentCount: true, 
  completionCount: true,
  popularity: true,
  createdAt: true,
  updatedAt: true,
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

// Course modules schema
export const courseModules = pgTable("course_modules", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  orderIndex: integer("order_index").notNull(), // For ordering within course
  durationMinutes: integer("duration_minutes").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCourseModuleSchema = createInsertSchema(courseModules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CourseModule = typeof courseModules.$inferSelect;
export type InsertCourseModule = z.infer<typeof insertCourseModuleSchema>;

// Lessons schema
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull().references(() => courseModules.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(), // Rich text content
  videoUrl: text("video_url"), // Embedded video URL
  orderIndex: integer("order_index").notNull(), // For ordering within module
  durationMinutes: integer("duration_minutes").notNull(),
  hasExercise: boolean("has_exercise").default(false).notNull(),
  exerciseContent: text("exercise_content"),
  hasQuiz: boolean("has_quiz").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;

// Quiz questions schema
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  options: json("options").$type<string[]>().notNull(),
  correctOption: integer("correct_option").notNull(), // Index of correct option
  explanation: text("explanation"), // Explanation of correct answer
  orderIndex: integer("order_index").notNull(), // For ordering within quiz
  difficultyLevel: text("difficulty_level").default("medium").notNull(), // easy, medium, hard
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;

// Course resources schema
export const courseResources = pgTable("course_resources", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  resourceType: text("resource_type").notNull(), // pdf, video, link, code, etc.
  resourceUrl: text("resource_url").notNull(),
  orderIndex: integer("order_index").notNull(), // For ordering
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCourseResourceSchema = createInsertSchema(courseResources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CourseResource = typeof courseResources.$inferSelect;
export type InsertCourseResource = z.infer<typeof insertCourseResourceSchema>;

// User course enrollments schema
export const userCourseEnrollments = pgTable("user_course_enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  lastAccessedAt: timestamp("last_accessed_at"),
  completedAt: timestamp("completed_at"),
  progress: integer("progress").default(0).notNull(), // Progress percentage 0-100
  currentLessonId: integer("current_lesson_id").references(() => lessons.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserCourseEnrollmentSchema = createInsertSchema(userCourseEnrollments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserCourseEnrollment = typeof userCourseEnrollments.$inferSelect;
export type InsertUserCourseEnrollment = z.infer<typeof insertUserCourseEnrollmentSchema>;

// User lesson completions schema
export const userLessonCompletions = pgTable("user_lesson_completions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: integer("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  timeSpentMinutes: integer("time_spent_minutes").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserLessonCompletionSchema = createInsertSchema(userLessonCompletions).omit({
  id: true,
  createdAt: true,
});

export type UserLessonCompletion = typeof userLessonCompletions.$inferSelect;
export type InsertUserLessonCompletion = z.infer<typeof insertUserLessonCompletionSchema>;

// User quiz attempts schema
export const userQuizAttempts = pgTable("user_quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: integer("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  score: integer("score").notNull(), // Score percentage 0-100
  correctAnswers: integer("correct_answers").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  timeSpentMinutes: integer("time_spent_minutes").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserQuizAttemptSchema = createInsertSchema(userQuizAttempts).omit({
  id: true,
  createdAt: true,
});

export type UserQuizAttempt = typeof userQuizAttempts.$inferSelect;
export type InsertUserQuizAttempt = z.infer<typeof insertUserQuizAttemptSchema>;

// Course ratings schema
export const courseRatings = pgTable("course_ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCourseRatingSchema = createInsertSchema(courseRatings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CourseRating = typeof courseRatings.$inferSelect;
export type InsertCourseRating = z.infer<typeof insertCourseRatingSchema>;

// Forum threads schema
export const forumThreads = pgTable("forum_threads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: json("tags").$type<string[]>().default([]),
  category: text("category").notNull(),
  views: integer("views").default(0).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  lastReplyAt: timestamp("last_reply_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertForumThreadSchema = createInsertSchema(forumThreads).omit({
  id: true,
  views: true,
  lastReplyAt: true,
  createdAt: true,
  updatedAt: true,
});

export type ForumThread = typeof forumThreads.$inferSelect;
export type InsertForumThread = z.infer<typeof insertForumThreadSchema>;

// Forum replies schema
export const forumReplies = pgTable("forum_replies", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").notNull().references(() => forumThreads.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isAcceptedAnswer: boolean("is_accepted_answer").default(false).notNull(),
  parentReplyId: integer("parent_reply_id").references(() => forumReplies.id), // For threaded replies
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;

// Media resources schema
export const mediaResources = pgTable("media_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  resourceType: text("resource_type").notNull(), // video, podcast, presentation, etc.
  resourceUrl: text("resource_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  duration: integer("duration"), // In seconds
  category: text("category").notNull(),
  tags: json("tags").$type<string[]>().default([]),
  requiredSubscriptionLevel: text("required_subscription_level").default("professional").notNull(),
  views: integer("views").default(0).notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMediaResourceSchema = createInsertSchema(mediaResources).omit({
  id: true,
  views: true,
  createdAt: true,
  updatedAt: true,
});

export type MediaResource = typeof mediaResources.$inferSelect;
export type InsertMediaResource = z.infer<typeof insertMediaResourceSchema>;
