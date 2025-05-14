import express from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";
import { logger } from "../utils/logger";
import { openaiApi } from "../grok";

const router = express.Router();

// Schema for creating a content calendar
const contentCalendarSchema = z.object({
  name: z.string().min(3, "Calendar name must be at least 3 characters"),
  brandName: z.string().min(2, "Brand name must be at least 2 characters"),
  industry: z.string().min(2, "Industry must be at least 2 characters"),
  companyGoals: z.string().min(10, "Please provide more detailed company goals"),
  targetAudience: z.string().min(10, "Please describe your target audience in more detail"),
  toneOfVoice: z.string().min(3, "Please specify the tone of voice"),
  includeImages: z.boolean().default(true),
  startDate: z.string().or(z.date()).transform(val => 
    typeof val === 'string' ? val : val.toISOString().split('T')[0]
  ),
  endDate: z.string().or(z.date()).transform(val => 
    typeof val === 'string' ? val : val.toISOString().split('T')[0]
  ),
  frequency: z.enum(["daily", "weekly", "bi-weekly", "monthly"]),
  platforms: z.array(z.string()).min(1, "Select at least one platform"),
  userId: z.string(),
  keyHashtags: z.array(z.string()).optional(),
  brandColors: z.array(z.string()).optional(),
  competitorUrls: z.array(z.string()).optional(),
  campaignThemes: z.array(z.string()).optional(),
  productHighlights: z.array(z.string()).optional(),
  keyMessages: z.array(z.string()).optional(),
  callToAction: z.string().optional(),
  urlsToInclude: z.array(z.string()).optional(),
  preferredContentTypes: z.array(z.string()).optional(),
  exclusions: z.string().optional(),
  specialDates: z.array(z.object({
    date: z.string(),
    description: z.string()
  })).optional(),
  status: z.string().default("ready"),
});

// Schema for content item creation
const contentItemSchema = z.object({
  calendarId: z.number(),
  platform: z.string(),
  content: z.string(),
  imageUrl: z.string().optional(),
  postDate: z.string().or(z.date()).transform(val => 
    typeof val === 'string' ? val : val.toISOString().split('T')[0]
  ),
  status: z.string().default("scheduled"),
  type: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  targetAudience: z.string().optional(),
  campaignTheme: z.string().optional(),
});

// Schema for content performance analytics
const performanceAnalyticsSchema = z.object({
  contentItemId: z.number(),
  impressions: z.number().default(0),
  clicks: z.number().default(0),
  likes: z.number().default(0),
  shares: z.number().default(0),
  comments: z.number().default(0),
  engagementRate: z.number().default(0),
  conversionRate: z.number().default(0),
  revenueGenerated: z.number().default(0),
});

// Get all calendars for a user
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.claims.sub;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const result = await storage.getUserContentCalendars(userId, limit, offset);
    res.json(result);
  } catch (error: any) {
    logger.error("Error fetching content calendars", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch content calendars",
    });
  }
});

// Get a specific calendar by ID
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const calendarId = parseInt(req.params.id);
    const calendar = await storage.getContentCalendarById(calendarId);
    
    if (!calendar) {
      return res.status(404).json({
        error: "Not Found",
        message: "Content calendar not found",
      });
    }
    
    // Check that the user owns this calendar
    const userId = req.user.claims.sub;
    if (calendar.userId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to access this calendar",
      });
    }
    
    res.json(calendar);
  } catch (error: any) {
    logger.error("Error fetching content calendar", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch content calendar",
    });
  }
});

// Create a new content calendar
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const result = contentCalendarSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: "Validation Error",
        message: result.error.errors[0].message,
        details: result.error.format(),
      });
    }
    
    // Ensure the user ID is set to the authenticated user
    const userId = req.user.claims.sub;
    if (result.data.userId !== userId) {
      result.data.userId = userId;
    }
    
    const calendar = await storage.createContentCalendar(result.data);
    
    // After creating the calendar, start generating content items
    // This is better done asynchronously in a real-world scenario
    // For simplicity, we'll add a placeholder item to demonstrate the structure
    const firstPostDate = new Date(result.data.startDate);
    
    // Add a sample content item for demonstration
    // In a real app, this would be a more sophisticated AI-generated content
    // using the OpenAI integration
    try {
      // Use the existing openaiApi instance
      
      // Generate a post for each selected platform
      for (const platform of result.data.platforms) {
        // Adjust the prompt based on the platform
        let prompt = `Create a social media post for ${platform} for ${result.data.brandName} in the ${result.data.industry} industry. 
        The post should use a ${result.data.toneOfVoice} tone and address the following company goals: ${result.data.companyGoals}.
        Target audience: ${result.data.targetAudience}.`;
        
        if (result.data.keyHashtags && result.data.keyHashtags.length > 0) {
          prompt += ` Include the following hashtags: ${result.data.keyHashtags.join(', ')}.`;
        }
        
        if (result.data.keyMessages && result.data.keyMessages.length > 0) {
          prompt += ` Key messages to highlight: ${result.data.keyMessages.join(', ')}.`;
        }
        
        if (result.data.callToAction) {
          prompt += ` Call to action: ${result.data.callToAction}.`;
        }
        
        // Platform specific adjustments
        if (platform === 'X') {
          prompt += ` The post must be 280 characters or less.`;
        } else if (platform === 'Facebook' || platform === 'Threads') {
          prompt += ` The post can be longer and more detailed.`;
        } else if (platform === 'Instagram') {
          prompt += ` The post should be visually descriptive and include relevant hashtags at the end.`;
        }
        
        // Generate content using OpenAI
        let content = "Welcome to your new content calendar! This is a placeholder post. In the full implementation, AI would generate custom content based on your preferences.";
        
        try {
          const response = await openaiApi.generateText(
            prompt,
            "You are a social media content expert specializing in creating engaging, brand-appropriate posts.",
            { max_tokens: 500 }
          );
          
          if (response && response.trim()) {
            content = response;
          }
        } catch (aiError) {
          logger.error("Error generating AI content", { error: aiError });
          // Continue with placeholder content if AI fails
        }
        
        // Create the content item
        await storage.createCalendarContentItem({
          calendarId: calendar.id,
          platform,
          content,
          postDate: firstPostDate.toISOString().split('T')[0],
          status: "scheduled",
          type: result.data.preferredContentTypes ? result.data.preferredContentTypes[0] : "post",
          hashtags: result.data.keyHashtags,
          targetAudience: result.data.targetAudience,
          campaignTheme: result.data.campaignThemes ? result.data.campaignThemes[0] : undefined,
        });
        
        // Increment the date based on frequency for the next platform's post
        if (result.data.frequency === "daily") {
          firstPostDate.setDate(firstPostDate.getDate() + 1);
        } else if (result.data.frequency === "weekly") {
          firstPostDate.setDate(firstPostDate.getDate() + 7);
        } else if (result.data.frequency === "bi-weekly") {
          firstPostDate.setDate(firstPostDate.getDate() + 14);
        } else if (result.data.frequency === "monthly") {
          firstPostDate.setMonth(firstPostDate.getMonth() + 1);
        }
      }
      
      // Update the calendar to indicate content has been generated
      await storage.updateContentCalendar(calendar.id, {
        lastGeneratedAt: new Date().toISOString()
      });
      
    } catch (error) {
      logger.error("Error creating initial content items", { error });
      // We don't want to fail the whole request if content generation fails
      // The user can still generate content manually
    }
    
    res.status(201).json(calendar);
  } catch (error: any) {
    logger.error("Error creating content calendar", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to create content calendar",
    });
  }
});

// Update a content calendar
router.patch("/:id", isAuthenticated, async (req, res) => {
  try {
    const calendarId = parseInt(req.params.id);
    const calendar = await storage.getContentCalendarById(calendarId);
    
    if (!calendar) {
      return res.status(404).json({
        error: "Not Found",
        message: "Content calendar not found",
      });
    }
    
    // Check that the user owns this calendar
    const userId = req.user.claims.sub;
    if (calendar.userId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to modify this calendar",
      });
    }
    
    // Only allow updating certain fields
    const allowedUpdates = [
      "name", "brandName", "industry", "companyGoals", "targetAudience", 
      "toneOfVoice", "includeImages", "frequency", "keyHashtags", 
      "brandColors", "campaignThemes", "productHighlights", "keyMessages",
      "callToAction", "urlsToInclude", "preferredContentTypes", "exclusions",
      "specialDates"
    ];
    
    const updates: any = {};
    for (const field of allowedUpdates) {
      if (field in req.body) {
        updates[field] = req.body[field];
      }
    }
    
    const updatedCalendar = await storage.updateContentCalendar(calendarId, updates);
    res.json(updatedCalendar);
  } catch (error: any) {
    logger.error("Error updating content calendar", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update content calendar",
    });
  }
});

// Delete a content calendar
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const calendarId = parseInt(req.params.id);
    const calendar = await storage.getContentCalendarById(calendarId);
    
    if (!calendar) {
      return res.status(404).json({
        error: "Not Found",
        message: "Content calendar not found",
      });
    }
    
    // Check that the user owns this calendar
    const userId = req.user.claims.sub;
    if (calendar.userId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to delete this calendar",
      });
    }
    
    // Delete the calendar and all associated content items (handled by foreign key constraints)
    const success = await storage.deleteContentCalendar(calendarId);
    
    if (success) {
      res.status(204).send();
    } else {
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to delete content calendar",
      });
    }
  } catch (error: any) {
    logger.error("Error deleting content calendar", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to delete content calendar",
    });
  }
});

// Get all content items for a calendar
router.get("/:id/content", isAuthenticated, async (req, res) => {
  try {
    const calendarId = parseInt(req.params.id);
    const calendar = await storage.getContentCalendarById(calendarId);
    
    if (!calendar) {
      return res.status(404).json({
        error: "Not Found",
        message: "Content calendar not found",
      });
    }
    
    // Check that the user owns this calendar
    const userId = req.user.claims.sub;
    if (calendar.userId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to access this calendar",
      });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    // Filter by platform if specified
    if (req.query.platform) {
      const platform = req.query.platform as string;
      const contentItems = await storage.getCalendarContentItemsByPlatform(calendarId, platform);
      return res.json({ contentItems, total: contentItems.length });
    }
    
    const result = await storage.getCalendarContentItems(calendarId, limit, offset);
    
    // Enhance the response with post status information
    const enhancedItems = result.contentItems.map(item => {
      const postDate = new Date(item.postDate);
      const today = new Date();
      let postStatus = "scheduled";
      
      if (postDate < today) {
        postStatus = "past";
      } else if (
        postDate.getDate() === today.getDate() &&
        postDate.getMonth() === today.getMonth() &&
        postDate.getFullYear() === today.getFullYear()
      ) {
        postStatus = "today";
      }
      
      return {
        ...item,
        postStatus
      };
    });
    
    res.json({
      contentItems: enhancedItems,
      total: result.total
    });
  } catch (error: any) {
    logger.error("Error fetching content items", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch content items",
    });
  }
});

// Create a content item
router.post("/:id/content", isAuthenticated, async (req, res) => {
  try {
    const calendarId = parseInt(req.params.id);
    const calendar = await storage.getContentCalendarById(calendarId);
    
    if (!calendar) {
      return res.status(404).json({
        error: "Not Found",
        message: "Content calendar not found",
      });
    }
    
    // Check that the user owns this calendar
    const userId = req.user.claims.sub;
    if (calendar.userId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to modify this calendar",
      });
    }
    
    // Set calendar ID from URL parameter
    req.body.calendarId = calendarId;
    
    const result = contentItemSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: "Validation Error",
        message: result.error.errors[0].message,
        details: result.error.format(),
      });
    }
    
    const contentItem = await storage.createCalendarContentItem(result.data);
    res.status(201).json(contentItem);
  } catch (error: any) {
    logger.error("Error creating content item", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to create content item",
    });
  }
});

// Update a content item
router.patch("/:calendarId/content/:itemId", isAuthenticated, async (req, res) => {
  try {
    const calendarId = parseInt(req.params.calendarId);
    const itemId = parseInt(req.params.itemId);
    
    const calendar = await storage.getContentCalendarById(calendarId);
    
    if (!calendar) {
      return res.status(404).json({
        error: "Not Found",
        message: "Content calendar not found",
      });
    }
    
    // Check that the user owns this calendar
    const userId = req.user.claims.sub;
    if (calendar.userId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to modify this calendar",
      });
    }
    
    // Only allow updating certain fields
    const allowedUpdates = [
      "content", "imageUrl", "postDate", "status", "type", 
      "hashtags", "targetAudience", "campaignTheme"
    ];
    
    const updates: any = {};
    for (const field of allowedUpdates) {
      if (field in req.body) {
        updates[field] = req.body[field];
      }
    }
    
    const updatedItem = await storage.updateCalendarContentItem(itemId, updates);
    
    if (!updatedItem) {
      return res.status(404).json({
        error: "Not Found",
        message: "Content item not found",
      });
    }
    
    res.json(updatedItem);
  } catch (error: any) {
    logger.error("Error updating content item", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update content item",
    });
  }
});

// Delete a content item
router.delete("/:calendarId/content/:itemId", isAuthenticated, async (req, res) => {
  try {
    const calendarId = parseInt(req.params.calendarId);
    const itemId = parseInt(req.params.itemId);
    
    const calendar = await storage.getContentCalendarById(calendarId);
    
    if (!calendar) {
      return res.status(404).json({
        error: "Not Found",
        message: "Content calendar not found",
      });
    }
    
    // Check that the user owns this calendar
    const userId = req.user.claims.sub;
    if (calendar.userId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to modify this calendar",
      });
    }
    
    const success = await storage.deleteCalendarContentItem(itemId);
    
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({
        error: "Not Found",
        message: "Content item not found",
      });
    }
  } catch (error: any) {
    logger.error("Error deleting content item", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to delete content item",
    });
  }
});

// Generate content for a calendar using AI
router.post("/:id/generate", isAuthenticated, async (req, res) => {
  try {
    const calendarId = parseInt(req.params.id);
    const calendar = await storage.getContentCalendarById(calendarId);
    
    if (!calendar) {
      return res.status(404).json({
        error: "Not Found",
        message: "Content calendar not found",
      });
    }
    
    // Check that the user owns this calendar
    const userId = req.user.claims.sub;
    if (calendar.userId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to modify this calendar",
      });
    }
    
    // Parameters for generation
    const count = req.body.count || 10; // Number of posts to generate
    const platforms = req.body.platforms || calendar.platforms;
    const startDate = req.body.startDate || new Date().toISOString().split('T')[0];
    
    // Update calendar status to "generating"
    await storage.updateContentCalendar(calendarId, { 
      status: "generating" 
    });
    
    try {
      // Use the existing openaiApi instance
      
      const generatedItems = [];
      let currentDate = new Date(startDate);
      
      // Generate content for each platform
      for (let i = 0; i < count; i++) {
        for (const platform of platforms) {
          // Similar to the content generation in the POST endpoint
          let prompt = `Create a social media post for ${platform} for ${calendar.brandName} in the ${calendar.industry} industry. 
          The post should use a ${calendar.toneOfVoice} tone and address the following company goals: ${calendar.companyGoals}.
          Target audience: ${calendar.targetAudience}.`;
          
          if (calendar.keyHashtags && calendar.keyHashtags.length > 0) {
            prompt += ` Include the following hashtags: ${calendar.keyHashtags.join(', ')}.`;
          }
          
          if (calendar.keyMessages && calendar.keyMessages.length > 0) {
            prompt += ` Key messages to highlight: ${calendar.keyMessages.join(', ')}.`;
          }
          
          if (calendar.callToAction) {
            prompt += ` Call to action: ${calendar.callToAction}.`;
          }
          
          // Platform specific adjustments
          if (platform === 'X') {
            prompt += ` The post must be 280 characters or less.`;
          } else if (platform === 'Facebook' || platform === 'Threads') {
            prompt += ` The post can be longer and more detailed.`;
          } else if (platform === 'Instagram') {
            prompt += ` The post should be visually descriptive and include relevant hashtags at the end.`;
          }
          
          // Generate content using OpenAI
          let content = `Default ${platform} post for ${calendar.brandName}. This is a placeholder as AI generation is currently unavailable.`;
          
          try {
            const response = await openaiApi.generateText(
              prompt,
              "You are a social media content expert specializing in creating engaging, brand-appropriate posts.",
              { max_tokens: 500 }
            );
            
            if (response && response.trim()) {
              content = response;
            }
          } catch (aiError) {
            logger.error("Error generating AI content", { error: aiError });
            // Continue with placeholder content if AI fails
          }
          
          // Create the content item
          const contentItem = await storage.createCalendarContentItem({
            calendarId: calendar.id,
            platform,
            content,
            postDate: currentDate.toISOString().split('T')[0],
            status: "scheduled",
            type: calendar.preferredContentTypes ? calendar.preferredContentTypes[0] : "post",
            hashtags: calendar.keyHashtags,
            targetAudience: calendar.targetAudience,
            campaignTheme: calendar.campaignThemes ? calendar.campaignThemes[0] : undefined,
          });
          
          generatedItems.push(contentItem);
        }
        
        // Increment the date based on frequency
        if (calendar.frequency === "daily") {
          currentDate.setDate(currentDate.getDate() + 1);
        } else if (calendar.frequency === "weekly") {
          currentDate.setDate(currentDate.getDate() + 7);
        } else if (calendar.frequency === "bi-weekly") {
          currentDate.setDate(currentDate.getDate() + 14);
        } else if (calendar.frequency === "monthly") {
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      }
      
      // Update calendar status and last generated time
      await storage.updateContentCalendar(calendarId, {
        status: "ready",
        lastGeneratedAt: new Date().toISOString()
      });
      
      res.status(200).json({
        success: true,
        message: `Generated ${generatedItems.length} content items`,
        count: generatedItems.length
      });
    } catch (error) {
      // Handle errors during generation
      await storage.updateContentCalendar(calendarId, { status: "error" });
      throw error;
    }
  } catch (error: any) {
    logger.error("Error generating content", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to generate content",
      details: error.message
    });
  }
});

// Add content performance analytics
router.post("/:calendarId/content/:itemId/analytics", isAuthenticated, async (req, res) => {
  try {
    const calendarId = parseInt(req.params.calendarId);
    const itemId = parseInt(req.params.itemId);
    
    const calendar = await storage.getContentCalendarById(calendarId);
    
    if (!calendar) {
      return res.status(404).json({
        error: "Not Found",
        message: "Content calendar not found",
      });
    }
    
    // Check that the user owns this calendar
    const userId = req.user.claims.sub;
    if (calendar.userId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to modify this calendar",
      });
    }
    
    // Set content item ID from URL parameter
    req.body.contentItemId = itemId;
    
    const result = performanceAnalyticsSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: "Validation Error",
        message: result.error.errors[0].message,
        details: result.error.format(),
      });
    }
    
    // Check if analytics already exist
    const existingAnalytics = await storage.getContentPerformanceAnalytics(itemId);
    
    if (existingAnalytics) {
      // Update existing analytics
      const updatedAnalytics = await storage.updateContentPerformanceAnalytics(itemId, result.data);
      res.json(updatedAnalytics);
    } else {
      // Create new analytics
      const analytics = await storage.addContentPerformanceAnalytics(result.data);
      res.status(201).json(analytics);
    }
  } catch (error: any) {
    logger.error("Error adding content performance analytics", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to add content performance analytics",
    });
  }
});

// Get content performance analytics
router.get("/:calendarId/content/:itemId/analytics", isAuthenticated, async (req, res) => {
  try {
    const calendarId = parseInt(req.params.calendarId);
    const itemId = parseInt(req.params.itemId);
    
    const calendar = await storage.getContentCalendarById(calendarId);
    
    if (!calendar) {
      return res.status(404).json({
        error: "Not Found",
        message: "Content calendar not found",
      });
    }
    
    // Check that the user owns this calendar
    const userId = req.user.claims.sub;
    if (calendar.userId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to access this calendar",
      });
    }
    
    const analytics = await storage.getContentPerformanceAnalytics(itemId);
    
    if (!analytics) {
      return res.status(404).json({
        error: "Not Found",
        message: "Content performance analytics not found",
      });
    }
    
    res.json(analytics);
  } catch (error: any) {
    logger.error("Error fetching content performance analytics", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch content performance analytics",
    });
  }
});

export default router;