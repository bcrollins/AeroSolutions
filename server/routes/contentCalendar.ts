import express from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";
import { z } from "zod";
import { insertContentCalendarSchema, insertCalendarContentItemSchema } from "@shared/schema";
import { logger } from "../utils/logger";
import OpenAI from "openai";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const router = express.Router();

// Validation schemas
const createContentCalendarSchema = insertContentCalendarSchema.extend({
  // Add any additional validation rules here
});

const contentItemSchema = insertCalendarContentItemSchema.extend({
  // Add any additional validation rules here
});

// Get all content calendars for a user
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.claims.sub;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const result = await storage.getUserContentCalendars(userId, limit, offset);
    
    res.json(result);
  } catch (error: any) {
    logger.error("Error fetching user content calendars", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch content calendars"
    });
  }
});

// Get a specific content calendar
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const calendarId = parseInt(req.params.id);
    
    if (isNaN(calendarId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid calendar ID"
      });
    }
    
    const calendar = await storage.getContentCalendarById(calendarId);
    
    if (!calendar) {
      return res.status(404).json({
        error: "Not Found",
        message: "Calendar not found"
      });
    }
    
    // Ensure the user has access to this calendar
    const userId = req.user.claims.sub;
    if (calendar.userId !== userId && req.user.claims.role !== "admin") {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to view this calendar"
      });
    }
    
    res.json(calendar);
  } catch (error: any) {
    logger.error("Error fetching calendar", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch calendar"
    });
  }
});

// Create a new content calendar
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const validatedData = createContentCalendarSchema.parse(req.body);
    
    // Ensure the user can only create calendars for themselves
    const userId = req.user.claims.sub;
    if (validatedData.userId !== userId && req.user.claims.role !== "admin") {
      return res.status(403).json({
        error: "Forbidden",
        message: "You can only create calendars for your own account"
      });
    }
    
    const calendar = await storage.createContentCalendar(validatedData);
    
    res.status(201).json(calendar);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid calendar data",
        details: error.errors
      });
    }
    
    logger.error("Error creating content calendar", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to create content calendar"
    });
  }
});

// Update a content calendar
router.patch("/:id", isAuthenticated, async (req, res) => {
  try {
    const calendarId = parseInt(req.params.id);
    
    if (isNaN(calendarId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid calendar ID"
      });
    }
    
    const calendar = await storage.getContentCalendarById(calendarId);
    
    if (!calendar) {
      return res.status(404).json({
        error: "Not Found",
        message: "Calendar not found"
      });
    }
    
    // Ensure the user has access to update this calendar
    const userId = req.user.claims.sub;
    if (calendar.userId !== userId && req.user.claims.role !== "admin") {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to update this calendar"
      });
    }
    
    // Validate and update the calendar
    const updateData = req.body;
    const updatedCalendar = await storage.updateContentCalendar(calendarId, updateData);
    
    res.json(updatedCalendar);
  } catch (error: any) {
    logger.error("Error updating calendar", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update calendar"
    });
  }
});

// Delete a content calendar
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const calendarId = parseInt(req.params.id);
    
    if (isNaN(calendarId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid calendar ID"
      });
    }
    
    const calendar = await storage.getContentCalendarById(calendarId);
    
    if (!calendar) {
      return res.status(404).json({
        error: "Not Found",
        message: "Calendar not found"
      });
    }
    
    // Ensure the user has access to delete this calendar
    const userId = req.user.claims.sub;
    if (calendar.userId !== userId && req.user.claims.role !== "admin") {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to delete this calendar"
      });
    }
    
    await storage.deleteContentCalendar(calendarId);
    
    res.status(204).end();
  } catch (error: any) {
    logger.error("Error deleting calendar", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to delete calendar"
    });
  }
});

// Get all content items for a calendar
router.get("/:id/items", isAuthenticated, async (req, res) => {
  try {
    const calendarId = parseInt(req.params.id);
    
    if (isNaN(calendarId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid calendar ID"
      });
    }
    
    const calendar = await storage.getContentCalendarById(calendarId);
    
    if (!calendar) {
      return res.status(404).json({
        error: "Not Found",
        message: "Calendar not found"
      });
    }
    
    // Ensure the user has access to this calendar
    const userId = req.user.claims.sub;
    if (calendar.userId !== userId && req.user.claims.role !== "admin") {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to view items in this calendar"
      });
    }
    
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const result = await storage.getCalendarContentItems(calendarId, limit, offset);
    
    res.json(result);
  } catch (error: any) {
    logger.error("Error fetching calendar items", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch calendar items"
    });
  }
});

// Get calendar content items by platform
router.get("/:id/platform/:platform", isAuthenticated, async (req, res) => {
  try {
    const calendarId = parseInt(req.params.id);
    const platform = req.params.platform;
    
    if (isNaN(calendarId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid calendar ID"
      });
    }
    
    if (!['X', 'Facebook', 'Instagram', 'Threads'].includes(platform)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid platform. Must be one of: X, Facebook, Instagram, Threads"
      });
    }
    
    const calendar = await storage.getContentCalendarById(calendarId);
    
    if (!calendar) {
      return res.status(404).json({
        error: "Not Found",
        message: "Calendar not found"
      });
    }
    
    // Ensure the user has access to this calendar
    const userId = req.user.claims.sub;
    if (calendar.userId !== userId && req.user.claims.role !== "admin") {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to view items in this calendar"
      });
    }
    
    const contentItems = await storage.getCalendarContentItemsByPlatform(calendarId, platform);
    
    res.json({ contentItems });
  } catch (error: any) {
    logger.error("Error fetching calendar items by platform", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch calendar items"
    });
  }
});

// Create a new content item for a calendar
router.post("/:id/items", isAuthenticated, async (req, res) => {
  try {
    const calendarId = parseInt(req.params.id);
    
    if (isNaN(calendarId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid calendar ID"
      });
    }
    
    const calendar = await storage.getContentCalendarById(calendarId);
    
    if (!calendar) {
      return res.status(404).json({
        error: "Not Found",
        message: "Calendar not found"
      });
    }
    
    // Ensure the user has access to this calendar
    const userId = req.user.claims.sub;
    if (calendar.userId !== userId && req.user.claims.role !== "admin") {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to add items to this calendar"
      });
    }
    
    // Validate the content item data
    const validatedData = contentItemSchema.parse({
      ...req.body,
      calendarId
    });
    
    const contentItem = await storage.createCalendarContentItem(validatedData);
    
    res.status(201).json(contentItem);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid content item data",
        details: error.errors
      });
    }
    
    logger.error("Error creating content item", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to create content item"
    });
  }
});

// Update a content item
router.patch("/:calendarId/items/:itemId", isAuthenticated, async (req, res) => {
  try {
    const calendarId = parseInt(req.params.calendarId);
    const itemId = parseInt(req.params.itemId);
    
    if (isNaN(calendarId) || isNaN(itemId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid ID provided"
      });
    }
    
    const calendar = await storage.getContentCalendarById(calendarId);
    
    if (!calendar) {
      return res.status(404).json({
        error: "Not Found",
        message: "Calendar not found"
      });
    }
    
    // Ensure the user has access to this calendar
    const userId = req.user.claims.sub;
    if (calendar.userId !== userId && req.user.claims.role !== "admin") {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to update items in this calendar"
      });
    }
    
    // Update the content item
    const updateData = req.body;
    const updatedItem = await storage.updateCalendarContentItem(itemId, updateData);
    
    if (!updatedItem) {
      return res.status(404).json({
        error: "Not Found",
        message: "Content item not found"
      });
    }
    
    res.json(updatedItem);
  } catch (error: any) {
    logger.error("Error updating content item", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update content item"
    });
  }
});

// Delete a content item
router.delete("/:calendarId/items/:itemId", isAuthenticated, async (req, res) => {
  try {
    const calendarId = parseInt(req.params.calendarId);
    const itemId = parseInt(req.params.itemId);
    
    if (isNaN(calendarId) || isNaN(itemId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid ID provided"
      });
    }
    
    const calendar = await storage.getContentCalendarById(calendarId);
    
    if (!calendar) {
      return res.status(404).json({
        error: "Not Found",
        message: "Calendar not found"
      });
    }
    
    // Ensure the user has access to this calendar
    const userId = req.user.claims.sub;
    if (calendar.userId !== userId && req.user.claims.role !== "admin") {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to delete items in this calendar"
      });
    }
    
    const result = await storage.deleteCalendarContentItem(itemId);
    
    if (!result) {
      return res.status(404).json({
        error: "Not Found",
        message: "Content item not found"
      });
    }
    
    res.status(204).end();
  } catch (error: any) {
    logger.error("Error deleting content item", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to delete content item"
    });
  }
});

// Generate AI content for a calendar
router.post("/:id/generate", isAuthenticated, async (req, res) => {
  try {
    const calendarId = parseInt(req.params.id);
    
    if (isNaN(calendarId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid calendar ID"
      });
    }
    
    const calendar = await storage.getContentCalendarById(calendarId);
    
    if (!calendar) {
      return res.status(404).json({
        error: "Not Found",
        message: "Calendar not found"
      });
    }
    
    // Ensure the user has access to this calendar
    const userId = req.user.claims.sub;
    if (calendar.userId !== userId && req.user.claims.role !== "admin") {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to generate content for this calendar"
      });
    }
    
    // Generate content using OpenAI for each platform in the calendar
    const contentItems = [];
    
    // Update the calendar status to generating
    await storage.updateContentCalendar(calendarId, { 
      status: "generating" 
    });
    
    // Get dates between start and end date
    const startDate = new Date(calendar.startDate);
    const endDate = new Date(calendar.endDate);
    const dateRange = getDatesBetween(startDate, endDate, calendar.frequency);
    
    for (const platform of calendar.platforms) {
      for (const date of dateRange) {
        try {
          // Generate content for this platform and date
          const contentItem = await generateContentForPlatform(calendar, platform, date);
          
          // Save content item to the database
          const savedItem = await storage.createCalendarContentItem(contentItem);
          contentItems.push(savedItem);
        } catch (itemError) {
          logger.error(`Error generating content for ${platform} on ${date}`, { error: itemError });
          // Continue with other items even if one fails
        }
      }
    }
    
    // Update the calendar status to ready and set last generated date
    await storage.updateContentCalendar(calendarId, { 
      status: "ready",
      lastGeneratedAt: new Date().toISOString()
    });
    
    res.json({ success: true, message: "Content generated successfully", count: contentItems.length });
  } catch (error: any) {
    logger.error("Error generating calendar content", { error: error.message });
    
    // Update the calendar status back to ready in case of error
    try {
      await storage.updateContentCalendar(parseInt(req.params.id), { status: "ready" });
    } catch (updateError) {
      logger.error("Error updating calendar status after generation failure", { error: updateError });
    }
    
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to generate calendar content"
    });
  }
});

// Generate image for a content item
router.post("/:calendarId/items/:itemId/generate-image", isAuthenticated, async (req, res) => {
  try {
    const calendarId = parseInt(req.params.calendarId);
    const itemId = parseInt(req.params.itemId);
    
    if (isNaN(calendarId) || isNaN(itemId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid ID provided"
      });
    }
    
    const calendar = await storage.getContentCalendarById(calendarId);
    
    if (!calendar) {
      return res.status(404).json({
        error: "Not Found",
        message: "Calendar not found"
      });
    }
    
    // Ensure the user has access to this calendar
    const userId = req.user.claims.sub;
    if (calendar.userId !== userId && req.user.claims.role !== "admin") {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to generate images for this calendar"
      });
    }
    
    // Get the content item
    const { contentItems } = await storage.getCalendarContentItems(calendarId);
    const contentItem = contentItems.find(item => item.id === itemId);
    
    if (!contentItem) {
      return res.status(404).json({
        error: "Not Found",
        message: "Content item not found"
      });
    }
    
    // Generate image using OpenAI
    let imagePrompt = contentItem.imagePrompt;
    
    if (!imagePrompt) {
      // If no image prompt exists, create one based on the caption
      imagePrompt = `Create a professional, high-quality social media graphic for ${calendar.brandName} with the following content: ${contentItem.caption}. The brand's industry is ${calendar.industry}. The image should be visually appealing and optimized for ${contentItem.platform}.`;
      
      // Update the content item with the generated prompt
      await storage.updateCalendarContentItem(itemId, { imagePrompt });
    }
    
    // Generate the image
    const image = await generateImage(imagePrompt, calendar.brandName);
    
    // Save the image URL to the content item
    const updatedItem = await storage.updateCalendarContentItem(itemId, { 
      generatedImageUrl: image.url 
    });
    
    res.json({ 
      success: true, 
      message: "Image generated successfully",
      imageUrl: image.url,
      contentItem: updatedItem
    });
  } catch (error: any) {
    logger.error("Error generating image for content item", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to generate image for content item"
    });
  }
});

// Helper functions

async function generateContentForPlatform(calendar: any, platform: string, date: Date): Promise<any> {
  // Build a prompt based on the calendar details
  const prompt = `
    Create a social media post for ${calendar.brandName} to be published on ${platform} on ${date.toISOString().split('T')[0]}.
    
    BRAND INFORMATION:
    - Industry: ${calendar.industry}
    - Company Goals: ${calendar.companyGoals}
    - Target Audience: ${calendar.targetAudience}
    - Tone of Voice: ${calendar.toneOfVoice}
    ${calendar.keyHashtags?.length ? `- Key Hashtags: ${calendar.keyHashtags.join(', ')}` : ''}
    ${calendar.brandColors?.length ? `- Brand Colors: ${calendar.brandColors.join(', ')}` : ''}
    ${calendar.keyMessages?.length ? `- Key Messages: ${calendar.keyMessages.join('; ')}` : ''}
    ${calendar.campaignThemes?.length ? `- Campaign Themes: ${calendar.campaignThemes.join('; ')}` : ''}
    ${calendar.productHighlights?.length ? `- Product Highlights: ${calendar.productHighlights.join('; ')}` : ''}
    ${calendar.callToAction ? `- Call To Action: ${calendar.callToAction}` : ''}
    ${calendar.exclusions ? `- Avoid these topics/approaches: ${calendar.exclusions}` : ''}
    
    PLATFORM SPECIFIC REQUIREMENTS:
    ${getPlatformSpecificGuidelines(platform)}
    
    FORMAT RESPONSE AS JSON with the following fields:
    - platform: The social media platform (${platform})
    - postDate: The date for this post (${date.toISOString().split('T')[0]})
    - contentType: The type of content (text, image, video, carousel, poll)
    - caption: The complete caption text including hashtags
    - hashtags: An array of hashtags to use
    - imagePrompt: A detailed prompt to generate a relevant image for this post
    - engagementTip: A tip to increase engagement on this post
    - performancePrediction: A prediction about how this post might perform
    - postTime: Recommended time to post in HH:MM format
  `;

  try {
    // Call OpenAI to generate content
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an expert social media manager specializing in content creation for ${platform}. You create engaging, platform-optimized content that drives user engagement and conversions. Format all responses as valid JSON.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const content = JSON.parse(response.choices[0].message.content || "{}");
    
    // Ensure the JSON includes all required fields
    const contentItem = {
      calendarId: calendar.id,
      platform,
      postDate: date.toISOString().split('T')[0],
      postTime: content.postTime || getRandomTimeForPlatform(platform),
      contentType: content.contentType || "text",
      caption: content.caption || `Post for ${calendar.brandName} on ${platform}`,
      hashtags: content.hashtags || [],
      imagePrompt: content.imagePrompt || `Create a professional image for ${calendar.brandName} in the ${calendar.industry} industry, focusing on ${calendar.companyGoals}`,
      engagementTip: content.engagementTip || "Respond to comments quickly to boost engagement",
      performancePrediction: content.performancePrediction || "Expected to perform well with target audience",
      status: "draft",
      aiGeneratedScore: 1.0
    };
    
    return contentItem;
  } catch (error) {
    logger.error(`Error generating content for ${platform}`, { error });
    throw error;
  }
}

async function generateImage(prompt: string, brandName: string): Promise<{ url: string }> {
  try {
    // Try generating the image with OpenAI DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${prompt} The image should be professional, high quality, and suitable for a business social media account. No text should be included in the image.`,
      n: 1,
      size: "1024x1024",
      quality: "standard"
    });
    
    // Get the image URL
    const imageUrl = response.data[0].url;
    
    // For production use, you would download the image and save it to your server
    // Here we'll save the image URL to a more permanent location
    const permanentUrl = await saveImageToLocalStorage(imageUrl, brandName);
    
    return { url: permanentUrl || imageUrl };
  } catch (error) {
    logger.error("Error generating image with OpenAI", { error });
    
    // Fallback to a placeholder if image generation fails
    return { url: "/images/placeholder-social-media.png" };
  }
}

async function saveImageToLocalStorage(imageUrl: string, brandName: string): Promise<string | null> {
  try {
    // Create a public/images directory if it doesn't exist
    const publicDir = path.join(process.cwd(), 'public');
    const imagesDir = path.join(publicDir, 'images');
    const contentDir = path.join(imagesDir, 'content-calendar');
    
    try {
      await mkdir(contentDir, { recursive: true });
    } catch (err) {
      // Directory already exists, continue
    }
    
    // Download the image
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    
    // Generate a filename
    const sanitizedBrandName = brandName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filename = `${sanitizedBrandName}-${randomUUID().slice(0, 8)}.png`;
    const filepath = path.join(contentDir, filename);
    
    // Save the image
    await writeFile(filepath, Buffer.from(buffer));
    
    // Return the relative URL
    return `/images/content-calendar/${filename}`;
  } catch (error) {
    logger.error("Error saving image to local storage", { error });
    return null;
  }
}

function getDatesBetween(startDate: Date, endDate: Date, frequency: string): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    
    // Increment based on frequency
    switch (frequency.toLowerCase()) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'bi-weekly':
        currentDate.setDate(currentDate.getDate() + 14);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      default:
        // Default to weekly if unknown frequency
        currentDate.setDate(currentDate.getDate() + 7);
    }
  }
  
  return dates;
}

function getPlatformSpecificGuidelines(platform: string): string {
  switch (platform) {
    case 'X':
      return `
        - X (formerly Twitter) posts are limited to 280 characters.
        - Use 1-2 hashtags for best performance.
        - Consider using engaging questions or polls to increase interaction.
        - Optimal posting times are typically 8-10am, 12-1pm, and 5-6pm.
        - Use concise, impactful language and consider adding visuals to increase engagement.
        - Make the first 20 words count as they are most visible in the feed.
      `;
    case 'Facebook':
      return `
        - Facebook posts can be longer but still keep them under 280 characters for best engagement.
        - Include a compelling image or video that aligns with the brand's aesthetic.
        - Ask questions to encourage comments and engagement.
        - Use a conversational tone that invites discussion.
        - Use 0-2 hashtags (hashtags are less important on Facebook).
        - Best times to post are typically 9-10am, 12-2pm, and 6-7pm.
      `;
    case 'Instagram':
      return `
        - Create visually compelling content that aligns with brand aesthetics.
        - Instagram captions can be longer, but make the first sentence captivating.
        - Use up to 10 relevant hashtags for maximum reach.
        - Include a call-to-action like "Double tap if you agree" or "Tag someone who needs to see this."
        - Encourage engagement with questions or prompts.
        - Best times to post are typically 11am-1pm and 7-9pm.
      `;
    case 'Threads':
      return `
        - Threads posts are limited to 500 characters.
        - Focus on conversational and authentic content.
        - Ask questions to encourage responses.
        - Use 1-3 hashtags to categorize your content.
        - Create content that invites replies and discussion.
        - Since Threads is newer, experiment with different posting times.
        - Consider creating mini-threads with connected ideas.
      `;
    default:
      return `
        - Keep content concise and engaging.
        - Include relevant hashtags.
        - Add a clear call to action.
        - Make sure your content aligns with the brand voice and target audience.
      `;
  }
}

function getRandomTimeForPlatform(platform: string): string {
  // Generate a random time based on optimal posting times for each platform
  const times = {
    'X': ['08:30', '12:30', '17:30', '19:00'],
    'Facebook': ['09:30', '13:00', '15:30', '18:30'],
    'Instagram': ['11:30', '13:30', '19:30', '21:00'],
    'Threads': ['10:00', '14:00', '18:00', '22:00']
  };
  
  const platformTimes = times[platform as keyof typeof times] || ['12:00', '17:00'];
  const randomIndex = Math.floor(Math.random() * platformTimes.length);
  
  return platformTimes[randomIndex];
}

export default router;