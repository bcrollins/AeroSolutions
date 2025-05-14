import type { Express } from "express";
import { createServer, type Server } from "http";
import stripeRoutes from "./routes/stripe";
import postsRoutes from "./routes/posts";
import coursesRoutes from "./routes/courses";
import forumRoutes from "./routes/forum";
import mediaRoutes from "./routes/media";
import contentGenerationRoutes from "./routes/content-generation";
import contentRoutes from "./routes/content";
import aiContentRoutes from "./routes/ai-content";
import adminRoutes from "./routes/admin";
import userOnboardingRoutes from "./routes/userOnboarding";
import userDashboardRoutes from "./routes/userDashboard";
import authRoutes from "./routes/auth";
import analyticsRoutes from "./routes/analytics";
import aiCoursesRoutes from "./routes/aiCourses";
import { storage } from "./storage";
import { logger } from "./utils/logger";
import { setupAuth } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);
  
  // Register auth routes
  app.use("/api/auth", authRoutes);
  
  // Register Stripe routes
  app.use("/api/stripe", stripeRoutes);
  
  // Register Posts routes
  app.use("/api/posts", postsRoutes);
  
  // Register AI Content Generation routes
  app.use("/api/content-generation", contentGenerationRoutes);
  app.use("/api/content", contentRoutes);
  app.use("/api/ai-content", aiContentRoutes);
  
  // Register Learning System routes
  app.use("/api/courses", coursesRoutes);
  app.use("/api/ai-courses", aiCoursesRoutes);
  app.use("/api/forum", forumRoutes);
  app.use("/api/media", mediaRoutes);
  
  // The AI Course routes are already registered above
  
  // Register Admin routes
  app.use("/api/admin", adminRoutes);
  
  // Register User Onboarding routes
  app.use("/api/user/onboarding", userOnboardingRoutes);
  
  // Register User Dashboard routes
  app.use("/api/user", userDashboardRoutes);
  
  // Register Analytics routes (for subscription analytics)
  app.use("/api/analytics", analyticsRoutes);

  // API route to fetch active subscription plans
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error: any) {
      logger.error("Error fetching subscription plans", { error: error.message });
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to fetch subscription plans",
      });
    }
  });

  // API route to fetch products (AI products)
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getActiveAiProducts();
      res.json(products);
    } catch (error: any) {
      logger.error("Error fetching products", { error: error.message });
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to fetch products",
      });
    }
  });

  // API route to check if user can access a product based on plan
  app.get("/api/product/:id/access", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid product ID",
        });
      }
      
      // Check if user is authenticated
      const userId = req.user?.id;
      
      // If no user, return public access info
      if (!userId) {
        const product = await storage.getAiProduct(productId);
        return res.json({
          hasAccess: product?.requiredPlan === 'free' || false,
          requiresSubscription: product?.requiredPlan !== 'free',
          requiredPlanId: product?.requiredPlan || null,
        });
      }
      
      // Get user subscription and check access
      const user = await storage.getUser(userId);
      const userSubscription = await storage.getUserSubscription(userId);
      const canAccess = await storage.canAccessProduct(userId, productId);
      
      // Determine current plan from user subscription
      const currentPlan = userSubscription?.planId 
        ? await storage.getSubscriptionPlanById(userSubscription.planId) 
        : null;
      
      return res.json({
        hasAccess: canAccess,
        currentPlanId: userSubscription?.planId || null,
        currentPlanName: currentPlan?.name || 'Free',
        // Additional info could be added here
      });
    } catch (error: any) {
      logger.error("Error checking product access", { error: error.message });
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to check product access",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}