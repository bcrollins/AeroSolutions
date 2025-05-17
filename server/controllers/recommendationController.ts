import { Request, Response } from 'express';
import { z } from 'zod';
import { getPersonalizedRecommendations, getTopicBasedRecommendations } from '../services/recommendationService';

/**
 * Get personalized recommendations for the authenticated user
 */
export async function getPersonalRecommendations(req: Request, res: Response) {
  try {
    // Validate user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const userId = req.user.id;
    
    // Parse optional query parameters
    const count = req.query.count ? parseInt(req.query.count as string) : 3;
    const topic = req.query.topic as string;
    
    // If a specific topic is provided, use topic-based recommendations
    if (topic) {
      const recommendations = await getTopicBasedRecommendations(topic, count);
      return res.json({
        success: true,
        recommendations
      });
    }
    
    // Otherwise get user's learning preferences from request body
    const { interests = [], recentCourseIds = [], learningGoal = '' } = req.body;
    
    // Get personalized recommendations
    const recommendations = await getPersonalizedRecommendations({
      userId,
      interests,
      recentCourseIds,
      learningGoal,
      count
    });
    
    return res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Error in recommendation controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
      error: (error as Error).message
    });
  }
}

/**
 * Get course recommendations based on completed lessons
 */
export async function getLessonBasedRecommendations(req: Request, res: Response) {
  try {
    // Validate request
    const schema = z.object({
      completedLessonIds: z.array(z.string()),
      count: z.number().optional().default(3)
    });
    
    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.errors
      });
    }
    
    const { completedLessonIds, count } = validation.data;
    
    // Get user ID if authenticated
    const userId = req.user?.id || 'guest';
    
    // Get recommendations based on completed lessons
    const recommendations = await getPersonalizedRecommendations({
      userId,
      completedLessonIds,
      count
    });
    
    return res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Error in lesson-based recommendations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate lesson-based recommendations',
      error: (error as Error).message
    });
  }
}