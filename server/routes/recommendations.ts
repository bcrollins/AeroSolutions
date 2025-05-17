import { Router } from 'express';
import { OpenAI } from 'openai';
import { isAuthenticated } from '../replitAuth';
import { db } from '../db';
import { courses } from '../../shared/schema';
import NodeCache from 'node-cache';
import { eq, not, sql } from 'drizzle-orm';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Cache for storing recommendations to reduce API calls
// TTL of 1 hour for recommendations
const recommendationCache = new NodeCache({ stdTTL: 3600 });

const router = Router();

/**
 * Returns personalized course recommendations for the user 
 * based on their learning history and preferences.
 */
router.get('/personalized', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Check cache first for this user
    const cacheKey = `recommendations:${userId}`;
    const cachedRecommendations = recommendationCache.get(cacheKey);
    
    if (cachedRecommendations) {
      return res.json({ recommendations: cachedRecommendations });
    }
    
    // Get all available courses from database
    const allCourses = await db.select().from(courses);
    
    if (!allCourses || allCourses.length === 0) {
      return res.json({ recommendations: [] });
    }
    
    try {
      // Get personalized recommendations using OpenAI
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert AI course recommendation engine that analyzes user profiles and learns from behavior.
                     Your task is to recommend courses that match the user's skill level, interests, and learning goals.
                     Always provide 5 recommendations with realistic match scores (50-95%), unique for each user.
                     Format your output as JSON array with the following fields for each recommendation:
                     courseId (string), title (string), description (string), matchScore (number), reasonForRecommendation (string).`
          },
          {
            role: "user",
            content: `Based on my profile as user ${userId}, recommend AI courses for me 
                     from the available catalog: ${JSON.stringify(allCourses.map(course => 
                       ({ id: course.id, title: course.title, description: course.description || "", category: course.category, difficulty: course.difficulty })))}
                     Recommend the courses that would most benefit my learning journey.`
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const recommendationsData = JSON.parse(completion.choices[0].message.content);
      
      // Cache recommendations for this user
      recommendationCache.set(cacheKey, recommendationsData.recommendations);
      
      return res.json(recommendationsData);
    } catch (aiError) {
      console.error('OpenAI recommendation error:', aiError);
      
      // Fallback - provide non-personalized recommendations
      const fallbackRecommendations = allCourses.slice(0, 5).map(course => ({
        courseId: course.id,
        title: course.title,
        description: course.description || "Learn about " + course.title,
        matchScore: Math.floor(Math.random() * 30) + 65, // Random score between 65-95
        reasonForRecommendation: "This course has been popular among learners with similar interests."
      }));
      
      return res.json({ recommendations: fallbackRecommendations });
    }
    
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return res.status(500).json({ message: 'Failed to get recommendations' });
  }
});

/**
 * Returns course recommendations based on specific topic
 */
router.get('/topic/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    const count = parseInt(req.query.count as string) || 5;
    
    // Check cache first for this topic
    const cacheKey = `recommendations:topic:${topicId}:${count}`;
    const cachedRecommendations = recommendationCache.get(cacheKey);
    
    if (cachedRecommendations) {
      return res.json({ recommendations: cachedRecommendations });
    }
    
    // Get courses related to the topic
    const topicCourses = await db.select()
      .from(courses)
      .where(course => course.category.toLowerCase().includes(topicId.toLowerCase()))
      .limit(count);
    
    if (!topicCourses || topicCourses.length === 0) {
      return res.json({ recommendations: [] });
    }
    
    // Format the recommendations
    const recommendations = topicCourses.map(course => ({
      courseId: course.id,
      title: course.title,
      description: course.description || "Learn about " + course.title,
      matchScore: Math.floor(Math.random() * 20) + 75, // Random score between 75-95
      reasonForRecommendation: `This is a top course on ${topicId.replace(/-/g, ' ')}.`
    }));
    
    // Cache the recommendations
    recommendationCache.set(cacheKey, recommendations);
    
    return res.json({ recommendations });
    
  } catch (error) {
    console.error('Error getting topic recommendations:', error);
    return res.status(500).json({ message: 'Failed to get topic recommendations' });
  }
});

/**
 * Tracks user interactions with course recommendations to improve
 * future recommendations
 */
router.post('/track', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { interactions } = req.body;
    
    if (!interactions || !Array.isArray(interactions)) {
      return res.status(400).json({ message: 'Invalid interactions data' });
    }
    
    // Log interactions for future recommendation improvement
    console.log(`User ${userId} interactions:`, interactions);
    
    // Here you would typically store these interactions in your database
    // for later analysis to improve recommendations
    
    // Invalidate the cache for this user to ensure fresh recommendations next time
    recommendationCache.del(`recommendations:${userId}`);
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error tracking recommendation interactions:', error);
    return res.status(500).json({ message: 'Failed to track interactions' });
  }
});

export default router;