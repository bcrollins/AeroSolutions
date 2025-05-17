import { Request, Response } from 'express';
import { db } from '../db';
import { courseInteractions } from '../../shared/schema';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';

// Schema for validating interaction tracking
const interactionSchema = z.object({
  courseId: z.number().int().positive(),
  interactionType: z.enum(['view', 'click', 'enroll', 'complete']),
  duration: z.number().int().optional(),
  context: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const trackInteractionsSchema = z.object({
  interactions: z.array(interactionSchema)
});

/**
 * Track course interactions to improve recommendations
 */
export async function trackCourseInteraction(req: Request, res: Response) {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const userId = (req.user as any).claims?.sub;
    
    // Validate request body
    const validationResult = trackInteractionsSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interaction data',
        errors: validationResult.error.errors
      });
    }
    
    const { interactions } = validationResult.data;
    
    // Save each interaction to the database
    const savedInteractions = await Promise.all(
      interactions.map(interaction => 
        db.insert(courseInteractions)
          .values({
            userId,
            courseId: interaction.courseId,
            interactionType: interaction.interactionType,
            duration: interaction.duration,
            context: interaction.context,
            metadata: interaction.metadata || {},
            timestamp: new Date(),
          })
          .returning()
      )
    );
    
    // Log the interaction for analytics
    console.log(`Tracked ${interactions.length} course interactions for user ${userId}`);
    
    return res.status(200).json({
      success: true,
      message: `Tracked ${interactions.length} course interactions`,
      data: savedInteractions
    });
    
  } catch (error) {
    console.error('Error tracking course interaction:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to track course interaction'
    });
  }
}

/**
 * Get a user's course interaction history
 */
export async function getUserInteractionHistory(req: Request, res: Response) {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const userId = (req.user as any).claims?.sub;
    
    // Get interaction history from database
    const history = await db
      .select()
      .from(courseInteractions)
      .where(eq(courseInteractions.userId, userId))
      .orderBy(desc(courseInteractions.timestamp))
      .limit(100);
    
    return res.status(200).json({
      success: true,
      data: history
    });
    
  } catch (error) {
    console.error('Error getting user interaction history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get interaction history'
    });
  }
}