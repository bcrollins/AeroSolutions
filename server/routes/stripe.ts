/**
 * Stripe Payment API Routes
 * 
 * This module defines all Stripe-related API endpoints:
 * - Payment intent creation for one-time purchases
 * - Subscription management (create, update, cancel)
 * - Webhook handling for Stripe events
 */

import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { isAuthenticated } from '../middlewares/auth';
import { storage } from '../storage';
import { logger } from '../utils/logger';
import { validateRequest } from '../middlewares/validate';
import { 
  stripe, 
  createPaymentIntent, 
  createCustomer, 
  createSubscription, 
  cancelSubscription, 
  updateSubscription, 
  handleWebhookEvent,
  syncPlansWithStripe
} from '../utils/stripeService';

const router = express.Router();

// Initialize Stripe products and prices from our plans
// This is typically done during server startup or via an admin endpoint
router.post('/sync-plans', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    const user = await storage.getUserById(req.user?.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await syncPlansWithStripe();
    return res.json({ success: true, message: 'Subscription plans synced with Stripe' });
  } catch (error) {
    logger.error('Error syncing plans with Stripe:', error);
    return res.status(500).json({ error: 'Failed to sync plans with Stripe' });
  }
});

// Create a payment intent for one-time purchases
router.post(
  '/create-payment-intent',
  isAuthenticated,
  [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('currency').optional().isString().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
    body('productId').optional().isNumeric().withMessage('Product ID must be a number'),
    validateRequest,
  ],
  async (req: Request, res: Response) => {
    try {
      const { amount, currency = 'usd', productId } = req.body;
      
      // Prepare metadata
      const metadata: Record<string, string> = {
        userId: req.user?.id.toString() || '',
      };
      
      // If a product ID was provided, add it to metadata
      if (productId) {
        metadata.productId = productId.toString();
        
        // Verify the product exists
        const product = await storage.getProductById(productId);
        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }
      }
      
      const paymentIntent = await createPaymentIntent(amount, currency, metadata);
      
      return res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      logger.error('Error creating payment intent:', error);
      return res.status(500).json({ error: 'Failed to create payment intent' });
    }
  }
);

// Get subscription plans with Stripe price IDs
router.get('/subscription-plans', async (req: Request, res: Response) => {
  try {
    const plans = await storage.getAllSubscriptionPlans();
    
    // Transform the plans to include only necessary info for the frontend
    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      features: plan.features,
      monthlyPrice: plan.price,
      annualPrice: (parseFloat(plan.price.replace(/[^0-9.]/g, '')) * 12 * 0.8).toFixed(2),
      stripeMonthlyPriceId: plan.stripeMonthlyPriceId,
      stripeAnnualPriceId: plan.stripeAnnualPriceId,
      isPopular: plan.isPopular,
    }));
    
    return res.json(formattedPlans);
  } catch (error) {
    logger.error('Error fetching subscription plans:', error);
    return res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
});

// Start a subscription
router.post(
  '/create-subscription',
  isAuthenticated,
  [
    body('priceId').isString().withMessage('Stripe Price ID is required'),
    body('planId').isNumeric().withMessage('Plan ID must be a number'),
    validateRequest,
  ],
  async (req: Request, res: Response) => {
    try {
      const { priceId, planId } = req.body;
      const userId = req.user?.id;
      
      // Get the user
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Check if user already has an active subscription
      if (user.stripeSubscriptionId && user.subscriptionStatus === 'active') {
        return res.status(400).json({ 
          error: 'User already has an active subscription',
          activeSubscription: true 
        });
      }
      
      // Create or retrieve Stripe customer
      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        // Create a new customer
        const customer = await createCustomer(user.email, user.username, {
          userId: userId.toString(),
        });
        
        customerId = customer.id;
        
        // Update user with Stripe customer ID
        await storage.updateUser(userId, {
          stripeCustomerId: customerId,
        });
      }
      
      // Create the subscription
      const subscription = await createSubscription(customerId, priceId, {
        userId: userId.toString(),
        planId: planId.toString(),
      });
      
      // Get the plan to update the user's subscription level
      const plan = await storage.getSubscriptionPlanById(planId);
      
      // Update user with subscription info
      await storage.updateUserSubscription(userId, {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionPlanId: planId,
        subscriptionLevel: plan.name.toLowerCase(),
        currentPeriodEnd: new Date((subscription.current_period_end || 0) * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });
      
      // Check if the subscription is already active
      if (subscription.status === 'active') {
        return res.json({
          subscriptionId: subscription.id,
          status: subscription.status,
        });
      }
      
      // Otherwise, return client secret for payment
      const clientSecret = (subscription as any).latest_invoice.payment_intent.client_secret;
      
      return res.json({
        subscriptionId: subscription.id,
        clientSecret,
        status: subscription.status,
      });
    } catch (error) {
      logger.error('Error creating subscription:', error);
      return res.status(500).json({ error: 'Failed to create subscription' });
    }
  }
);

// Cancel subscription
router.post(
  '/cancel-subscription',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      // Get the user
      const user = await storage.getUserById(userId);
      if (!user || !user.stripeSubscriptionId) {
        return res.status(404).json({ error: 'No active subscription found' });
      }
      
      // Cancel at period end by default
      const cancelImmediately = req.body.cancelImmediately === true;
      const subscription = await cancelSubscription(user.stripeSubscriptionId, cancelImmediately);
      
      // Update user subscription info
      await storage.updateUserSubscription(userId, {
        cancelAtPeriodEnd: !cancelImmediately,
        subscriptionStatus: cancelImmediately ? 'canceled' : 'active',
      });
      
      return res.json({
        subscriptionId: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });
    } catch (error) {
      logger.error('Error canceling subscription:', error);
      return res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  }
);

// Change subscription plan
router.post(
  '/change-subscription',
  isAuthenticated,
  [
    body('newPriceId').isString().withMessage('New Stripe Price ID is required'),
    body('newPlanId').isNumeric().withMessage('New Plan ID must be a number'),
    validateRequest,
  ],
  async (req: Request, res: Response) => {
    try {
      const { newPriceId, newPlanId } = req.body;
      const userId = req.user?.id;
      
      // Get the user
      const user = await storage.getUserById(userId);
      if (!user || !user.stripeSubscriptionId) {
        return res.status(404).json({ error: 'No active subscription found' });
      }
      
      // Update the subscription
      const updatedSubscription = await updateSubscription(user.stripeSubscriptionId, newPriceId);
      
      // Get the new plan
      const newPlan = await storage.getSubscriptionPlanById(newPlanId);
      
      // Update user subscription info
      await storage.updateUserSubscription(userId, {
        subscriptionPlanId: newPlanId,
        subscriptionLevel: newPlan.name.toLowerCase(),
        currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
      });
      
      return res.json({
        subscriptionId: updatedSubscription.id,
        status: updatedSubscription.status,
        plan: newPlan.name,
      });
    } catch (error) {
      logger.error('Error changing subscription:', error);
      return res.status(500).json({ error: 'Failed to change subscription' });
    }
  }
);

// Resume a canceled subscription
router.post(
  '/resume-subscription',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      // Get the user
      const user = await storage.getUserById(userId);
      if (!user || !user.stripeSubscriptionId) {
        return res.status(404).json({ error: 'No subscription found' });
      }
      
      // Resume the subscription by removing the cancellation
      const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });
      
      // Update user subscription info
      await storage.updateUserSubscription(userId, {
        cancelAtPeriodEnd: false,
      });
      
      return res.json({
        subscriptionId: subscription.id,
        status: subscription.status,
      });
    } catch (error) {
      logger.error('Error resuming subscription:', error);
      return res.status(500).json({ error: 'Failed to resume subscription' });
    }
  }
);

// Get current user's subscription
router.get(
  '/my-subscription',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      // Get the user with subscription details
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // If user has no subscription
      if (!user.stripeSubscriptionId) {
        return res.json({
          subscription: null,
          plan: null,
        });
      }
      
      // Get the subscription from Stripe for the most up-to-date info
      let subscription;
      try {
        subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      } catch (error) {
        // If the subscription doesn't exist in Stripe, clear it from our DB
        if ((error as any).code === 'resource_missing') {
          await storage.updateUserSubscription(userId, {
            stripeSubscriptionId: null,
            subscriptionStatus: null,
            subscriptionPlanId: null,
            subscriptionLevel: null,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
          });
          
          return res.json({
            subscription: null,
            plan: null,
          });
        }
        throw error;
      }
      
      // Get the plan details
      const plan = user.subscriptionPlanId 
        ? await storage.getSubscriptionPlanById(user.subscriptionPlanId)
        : null;
      
      return res.json({
        subscription: {
          id: subscription.id,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
        plan: plan ? {
          id: plan.id,
          name: plan.name,
          level: plan.name.toLowerCase(),
          features: plan.features,
        } : null,
      });
    } catch (error) {
      logger.error('Error fetching subscription:', error);
      return res.status(500).json({ error: 'Failed to fetch subscription' });
    }
  }
);

// Stripe webhook handler
// This endpoint receives events from Stripe
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    
    if (!sig) {
      return res.status(400).json({ error: 'Missing Stripe signature' });
    }
    
    try {
      // Verify the event came from Stripe
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
      
      // Handle the event
      const result = await handleWebhookEvent(event);
      
      return res.json(result);
    } catch (error) {
      logger.error('Error handling Stripe webhook:', error);
      return res.status(400).json({ error: 'Webhook signature verification failed' });
    }
  }
);

export default router;