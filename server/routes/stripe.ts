/**
 * Stripe API Routes
 * 
 * This module provides routes for Stripe payment processing and subscription management.
 */

import express from 'express';
import { body } from 'express-validator';
import Stripe from 'stripe';
import { storage } from '../storage';
import { validateRequest } from '../middlewares/validate';
import { isAuthenticated } from '../middlewares/auth';
import * as stripeService from '../utils/stripeService';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * Get available subscription plans
 * GET /api/stripe/subscription-plans
 */
router.get('/subscription-plans', async (req, res) => {
  try {
    const plans = await stripeService.getSubscriptionPlans();
    return res.json(plans);
  } catch (error: any) {
    logger.error('Error getting subscription plans', { error: error.message });
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to retrieve subscription plans' 
    });
  }
});

/**
 * Create a subscription
 * POST /api/stripe/create-subscription
 * Body: { priceId, planId }
 */
router.post(
  '/create-subscription',
  isAuthenticated,
  [
    body('priceId').isString().notEmpty().withMessage('Price ID is required'),
    body('planId').isNumeric().withMessage('Plan ID must be a number'),
  ],
  validateRequest,
  async (req: any, res) => {
    try {
      const { priceId, planId } = req.body;
      const userId = req.user.id;
      
      // Get user data
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'User not found' 
        });
      }
      
      // Check if user already has an active subscription
      if (user.stripeSubscriptionId) {
        // Get the subscription to check if it's still active
        try {
          const subscription = await stripeService.getSubscription(user.stripeSubscriptionId);
          
          if (subscription.status === 'active' || subscription.status === 'trialing') {
            return res.json({
              subscriptionId: subscription.id,
              status: subscription.status,
              message: 'Subscription is already active'
            });
          }
        } catch (err) {
          // Subscription not found or error, proceed with creating a new one
          logger.info(`Subscription ${user.stripeSubscriptionId} not found, creating new one`, { userId });
        }
      }
      
      // Create/get Stripe customer
      let stripeCustomerId = user.stripeCustomerId;
      
      if (!stripeCustomerId) {
        // Create new customer
        const customer = await stripeService.createCustomer(
          user.email || `user${userId}@example.com`,
          user.username || `User ${userId}`,
          { userId: userId.toString() }
        );
        
        stripeCustomerId = customer.id;
        
        // Save customer ID to user
        await storage.updateStripeCustomerId(userId, stripeCustomerId);
      }
      
      // Create subscription
      const subscription = await stripeService.createSubscription(
        stripeCustomerId,
        priceId
      );
      
      // Get client secret for payment
      const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;
      
      // Update user with subscription ID
      await storage.updateUserStripeSubscription(
        userId,
        subscription.id,
        subscription.status
      );
      
      // Update user plan
      await storage.updateUserPlan(userId, planId);
      
      return res.json({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
        status: subscription.status
      });
    } catch (error: any) {
      logger.error('Error creating subscription', { error: error.message });
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: error.message || 'Failed to create subscription' 
      });
    }
  }
);

/**
 * Cancel a subscription
 * POST /api/stripe/cancel-subscription
 * Body: { subscriptionId, cancelAtPeriodEnd }
 */
router.post(
  '/cancel-subscription',
  isAuthenticated,
  [
    body('subscriptionId').isString().notEmpty().withMessage('Subscription ID is required'),
    body('cancelAtPeriodEnd').optional().isBoolean(),
  ],
  validateRequest,
  async (req: any, res) => {
    try {
      const { subscriptionId, cancelAtPeriodEnd = true } = req.body;
      const userId = req.user.id;
      
      // Get user data
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'User not found' 
        });
      }
      
      // Check if the subscription belongs to the user
      if (user.stripeSubscriptionId !== subscriptionId) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'You do not have permission to cancel this subscription' 
        });
      }
      
      // Cancel subscription
      const subscription = await stripeService.cancelSubscription(
        subscriptionId,
        cancelAtPeriodEnd
      );
      
      // If immediate cancellation, update user
      if (!cancelAtPeriodEnd) {
        await storage.updateUserStripeSubscription(userId, null, 'canceled');
        await storage.updateUserPlan(userId, null);
      }
      
      return res.json({
        success: true,
        message: cancelAtPeriodEnd 
          ? 'Subscription will be canceled at the end of the billing period' 
          : 'Subscription has been canceled',
        status: subscription.status
      });
    } catch (error: any) {
      logger.error('Error canceling subscription', { error: error.message });
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: error.message || 'Failed to cancel subscription' 
      });
    }
  }
);

/**
 * Get current subscription
 * GET /api/stripe/current-subscription
 */
router.get(
  '/current-subscription',
  isAuthenticated,
  async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get user data
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'User not found' 
        });
      }
      
      // Check if user has a subscription
      if (!user.stripeSubscriptionId) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'No active subscription found' 
        });
      }
      
      // Get subscription details
      const subscription = await stripeService.getSubscription(user.stripeSubscriptionId);
      
      // Get plan details if user has a plan
      let plan = null;
      if (user.planId) {
        plan = await storage.getSubscriptionPlanById(user.planId);
      }
      
      return res.json({
        subscription,
        plan
      });
    } catch (error: any) {
      logger.error('Error getting current subscription', { error: error.message });
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: error.message || 'Failed to retrieve subscription' 
      });
    }
  }
);

/**
 * Create a payment intent
 * POST /api/stripe/create-payment-intent
 * Body: { amount, productId }
 */
router.post(
  '/create-payment-intent',
  isAuthenticated,
  [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('productId').optional().isNumeric().withMessage('Product ID must be a number'),
  ],
  validateRequest,
  async (req: any, res) => {
    try {
      const { amount, productId } = req.body;
      const userId = req.user.id;
      
      // Get user data
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'User not found' 
        });
      }
      
      // Create/get Stripe customer
      let stripeCustomerId = user.stripeCustomerId;
      
      if (!stripeCustomerId) {
        // Create new customer
        const customer = await stripeService.createCustomer(
          user.email || `user${userId}@example.com`,
          user.username || `User ${userId}`,
          { userId: userId.toString() }
        );
        
        stripeCustomerId = customer.id;
        
        // Save customer ID to user
        await storage.updateStripeCustomerId(userId, stripeCustomerId);
      }
      
      // Create payment intent
      const metadata: Record<string, string> = { userId: userId.toString() };
      
      if (productId) {
        metadata.productId = productId.toString();
      }
      
      const paymentIntent = await stripeService.createPaymentIntent(
        amount,
        'usd',
        stripeCustomerId,
        metadata
      );
      
      return res.json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error: any) {
      logger.error('Error creating payment intent', { error: error.message });
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: error.message || 'Failed to create payment intent' 
      });
    }
  }
);

/**
 * Handle Stripe webhooks
 * POST /api/stripe/webhook
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    
    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      logger.warn('Missing Stripe signature or webhook secret');
      return res.status(400).json({ error: 'Webhook signature verification failed' });
    }
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
    
    // Verify webhook signature
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      logger.warn('Webhook signature verification failed', { error: err.message });
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }
    
    // Handle the event
    const result = await stripeService.handleWebhookEvent(event);
    
    // Return success response
    return res.json({ received: true, result });
  } catch (error: any) {
    logger.error('Error handling webhook', { error: error.message });
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
});

export default router;