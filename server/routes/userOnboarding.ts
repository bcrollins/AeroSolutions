/**
 * User Onboarding Routes
 * 
 * These routes handle user onboarding after subscription signup,
 * including preferences and initial setup.
 */

import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';

const onboardingRouter = Router();

// Validation schema for onboarding data
const onboardingSchema = z.object({
  userId: z.string(),
  preference: z.enum(['ai-courses', 'digital-tools', 'web-development'])
});

// Save user onboarding preferences
onboardingRouter.post('/', isAuthenticated, async (req, res) => {
  try {
    const validatedData = onboardingSchema.parse(req.body);
    
    // Update user record with onboarding preference and mark onboarding as complete
    await db.update(users)
      .set({
        preferences: validatedData.preference,
        onboardingComplete: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, validatedData.userId));
    
    res.status(200).json({ success: true, message: 'Onboarding preferences saved successfully' });
  } catch (error) {
    console.error('Error in user onboarding:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid onboarding data',
        errors: error.errors 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save onboarding preferences'
    });
  }
});

// Get user onboarding status
onboardingRouter.get('/status', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    
    const [userRecord] = await db.select({
      onboardingComplete: users.onboardingComplete,
      preferences: users.preferences
    })
    .from(users)
    .where(eq(users.id, userId));
    
    if (!userRecord) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      onboardingComplete: userRecord.onboardingComplete,
      preference: userRecord.preferences
    });
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch onboarding status'
    });
  }
});

export default onboardingRouter;