import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { logger } from '../utils/logger';
import { isAuthenticated } from '../middlewares/auth';
import { z } from 'zod';
import { validateRequest } from '../middlewares/validate';
import { insertMediaResourceSchema } from '@shared/schema';

const router = Router();

// Validation schemas
const mediaIdParam = z.object({
  id: z.coerce.number()
});

const getMediaQuery = z.object({
  category: z.string().optional(),
  level: z.string().optional(),
  limit: z.coerce.number().optional()
});

/**
 * @route GET /api/media/resources
 * @desc Get media resources, optionally filtered by category and subscription level
 * @access Public (with subscription level filtering)
 */
router.get('/resources', validateRequest({ query: getMediaQuery }), async (req: Request, res: Response) => {
  try {
    const { category, level, limit } = req.query;
    let resources;
    
    if (category) {
      resources = await storage.getMediaResourcesByCategory(
        category as string,
        limit ? parseInt(limit as string) : undefined
      );
    } else if (level) {
      resources = await storage.getMediaResourcesBySubscriptionLevel(
        level as string,
        limit ? parseInt(limit as string) : undefined
      );
    } else {
      resources = await storage.getAllMediaResources(
        limit ? parseInt(limit as string) : undefined
      );
    }
    
    res.json(resources);
  } catch (error) {
    logger.error('Error fetching media resources', { error });
    res.status(500).json({ error: 'Failed to fetch media resources' });
  }
});

/**
 * @route GET /api/media/resources/:id
 * @desc Get a specific media resource
 * @access Public (with subscription level check)
 */
router.get('/resources/:id', validateRequest({ params: mediaIdParam }), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resource = await storage.getMediaResourceById(parseInt(id));
    
    if (!resource) {
      return res.status(404).json({ error: 'Media resource not found' });
    }
    
    // Check if user has required subscription level (if authenticated)
    if (req.user) {
      const userId = (req.user as any).id;
      const userSubscription = await storage.getUserActiveSubscription(userId);
      
      if (userSubscription) {
        const plan = await storage.getSubscriptionPlanById(userSubscription.planId);
        
        if (plan) {
          const subscriptionLevels = {
            'starter': 1,
            'professional': 2,
            'enterprise': 3
          };
          
          const userLevel = subscriptionLevels[plan.name.toLowerCase()] || 0;
          const requiredLevel = subscriptionLevels[resource.requiredSubscriptionLevel.toLowerCase()] || 0;
          
          if (userLevel < requiredLevel) {
            return res.status(403).json({ 
              error: 'Subscription level insufficient', 
              requiredLevel: resource.requiredSubscriptionLevel,
              currentLevel: plan.name
            });
          }
        }
      } else if (resource.requiredSubscriptionLevel !== 'free') {
        return res.status(403).json({ 
          error: 'Subscription required',
          requiredLevel: resource.requiredSubscriptionLevel
        });
      }
    } else if (resource.requiredSubscriptionLevel !== 'free') {
      return res.status(403).json({ 
        error: 'Subscription required',
        requiredLevel: resource.requiredSubscriptionLevel
      });
    }
    
    // Increment view count
    await storage.incrementMediaResourceViews(resource.id);
    
    res.json(resource);
  } catch (error) {
    logger.error('Error fetching media resource', { error, resourceId: req.params.id });
    res.status(500).json({ error: 'Failed to fetch media resource' });
  }
});

/**
 * @route POST /api/media/resources
 * @desc Create a new media resource (admin only)
 * @access Private (admin only)
 */
router.post('/resources', isAuthenticated, validateRequest({ 
  body: insertMediaResourceSchema.extend({
    title: z.string().min(5).max(200),
    description: z.string().min(10),
    resourceType: z.string().min(2),
    resourceUrl: z.string().url(),
    category: z.string().min(2),
    requiredSubscriptionLevel: z.string()
  })
}), async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    
    // Check if user is admin
    const user = await storage.getUser(userId);
    
    if (user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create media resources' });
    }
    
    const resource = await storage.createMediaResource(req.body);
    
    res.status(201).json(resource);
  } catch (error) {
    logger.error('Error creating media resource', { error, userId: (req.user as any).id });
    res.status(500).json({ error: 'Failed to create media resource' });
  }
});

export default router;