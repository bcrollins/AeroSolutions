import { Router, Request, Response } from 'express';
import { apiRateLimiter } from '../utils/rate-limiting';
import { authMiddleware } from '../utils/auth';
import { storage } from '../storage';
import { z } from 'zod';
import { validateRequest } from '../utils/validation';

// Create a router with rate limiting
const subscriptionRouter = Router();
subscriptionRouter.use(apiRateLimiter);

// Define available subscription plans
const plans = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 9.99,
    currency: 'USD',
    features: [
      'Access to GPT-4o',
      '50 requests per day',
      'Basic customer support'
    ],
    requestLimit: 50
  },
  {
    id: 'professional',
    name: 'Professional Plan',
    price: 29.99,
    currency: 'USD',
    features: [
      'Access to all AI models',
      '200 requests per day',
      'Priority customer support',
      'API key for integrations'
    ],
    requestLimit: 200
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 99.99,
    currency: 'USD',
    features: [
      'Access to all AI models',
      'Unlimited requests',
      'Dedicated customer support',
      'Multiple API keys',
      'Custom integration assistance'
    ],
    requestLimit: 1000
  }
];

// Get available subscription plans
subscriptionRouter.get('/plans', (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: plans
  });
});

// Get subscription status
subscriptionRouter.get('/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // In a real application, this would fetch the subscription status from the database
    // Since this is a simplified implementation, return a mock response
    
    return res.json({
      success: true,
      data: {
        status: 'active',
        plan: 'basic',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching subscription status'
    });
  }
});

// Subscribe to a plan
const subscribeSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required')
});

subscriptionRouter.post('/subscribe', 
  authMiddleware, 
  validateRequest(subscribeSchema), 
  async (req: Request, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { planId } = req.body;
      
      // Validate plan ID
      const plan = plans.find(p => p.id === planId);
      if (!plan) {
        return res.status(400).json({
          success: false,
          message: 'Invalid plan ID'
        });
      }
      
      // In a real application, this would create a subscription in the database
      // and integrate with a payment provider like Stripe
      
      return res.json({
        success: true,
        message: `Successfully subscribed to ${plan.name}`,
        data: {
          planId,
          status: 'active',
          startDate: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      return res.status(500).json({
        success: false,
        message: 'Error processing subscription'
      });
    }
});

// Cancel subscription
subscriptionRouter.post('/cancel', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    // In a real application, this would update the subscription status in the database
    
    return res.json({
      success: true,
      message: 'Subscription successfully cancelled',
      data: {
        status: 'cancelled',
        effectiveDate: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return res.status(500).json({
      success: false,
      message: 'Error cancelling subscription'
    });
  }
});

export default subscriptionRouter;