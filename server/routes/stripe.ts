import express from 'express';
import { z } from 'zod';
import * as stripeService from '../utils/stripeService';
import { isAuthenticated } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { logger } from '../utils/logger';
import Stripe from 'stripe';

const router = express.Router();

// We need a buffer for Stripe webhook events
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Get all subscription plans
router.get('/subscription-plans', async (req, res) => {
  try {
    const plans = await stripeService.getSubscriptionPlans();
    res.json(plans);
  } catch (error) {
    logger.error('Error getting subscription plans', { error });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get current user's subscription
router.get('/current-subscription', isAuthenticated, async (req, res) => {
  try {
    const subscription = await stripeService.getUserSubscription(req.user!.id);
    res.json(subscription || null);
  } catch (error) {
    logger.error('Error getting user subscription', { error, userId: req.user!.id });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a subscription checkout session
const createCheckoutSchema = z.object({
  planId: z.number(),
  interval: z.enum(['monthly', 'annual']),
});

router.post(
  '/create-checkout',
  isAuthenticated,
  validate(createCheckoutSchema),
  async (req, res) => {
    try {
      const { planId, interval } = req.body;
      const user = req.user!;

      // Get the plan
      const plan = await stripeService.getSubscriptionPlanById(planId);

      if (!plan) {
        return res.status(404).json({ error: 'Subscription plan not found' });
      }

      // Determine which price ID to use
      const priceId = interval === 'annual' 
        ? plan.stripeAnnualPriceId 
        : plan.stripePriceId;

      if (!priceId) {
        return res.status(400).json({ error: 'No price ID available for this plan and interval' });
      }

      // Get or create Stripe customer
      const customerId = await stripeService.getOrCreateStripeCustomer(
        user.id,
        user.email || '',
        user.username
      );

      // Create checkout session
      const session = await stripeService.createStripeCheckoutSession(
        planId,
        customerId,
        priceId,
        user.id
      );

      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      logger.error('Error creating checkout session', { error, userId: req.user!.id });
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }
);

// Create a subscription directly (without redirect)
const createSubscriptionSchema = z.object({
  planId: z.number(),
  interval: z.enum(['monthly', 'annual']),
});

router.post(
  '/create-subscription',
  isAuthenticated,
  validate(createSubscriptionSchema),
  async (req, res) => {
    try {
      const { planId, interval } = req.body;
      const user = req.user!;

      // Get the plan
      const plan = await stripeService.getSubscriptionPlanById(planId);

      if (!plan) {
        return res.status(404).json({ error: 'Subscription plan not found' });
      }

      // Determine which price ID to use
      const priceId = interval === 'annual' 
        ? plan.stripeAnnualPriceId 
        : plan.stripePriceId;

      if (!priceId) {
        return res.status(400).json({ error: 'No price ID available for this plan and interval' });
      }

      // Get or create Stripe customer
      const customerId = await stripeService.getOrCreateStripeCustomer(
        user.id,
        user.email || '',
        user.username
      );

      // Create subscription
      const subscription = await stripeService.createSubscription(
        customerId,
        priceId,
        planId,
        user.id
      );

      res.json(subscription);
    } catch (error) {
      logger.error('Error creating subscription', { error, userId: req.user!.id });
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  }
);

// Cancel a subscription
const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string(),
  immediate: z.boolean().optional(),
});

router.post(
  '/cancel-subscription',
  isAuthenticated,
  validate(cancelSubscriptionSchema),
  async (req, res) => {
    try {
      const { subscriptionId, immediate = false } = req.body;
      const userId = req.user!.id;

      const result = await stripeService.cancelSubscription(userId, subscriptionId, immediate);
      res.json(result);
    } catch (error) {
      logger.error('Error canceling subscription', { error, userId: req.user!.id });
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  }
);

// Create a payment intent for one-time payment
const createPaymentIntentSchema = z.object({
  amount: z.number().positive(),
  metadata: z.record(z.string()).optional(),
});

router.post(
  '/create-payment-intent',
  isAuthenticated,
  validate(createPaymentIntentSchema),
  async (req, res) => {
    try {
      const { amount, metadata } = req.body;

      // Add user ID to metadata
      const fullMetadata = {
        ...metadata,
        userId: req.user!.id.toString(),
      };

      const result = await stripeService.createPaymentIntent(amount, fullMetadata);
      res.json(result);
    } catch (error) {
      logger.error('Error creating payment intent', { error, userId: req.user!.id });
      res.status(500).json({ error: 'Failed to create payment intent' });
    }
  }
);

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (webhookSecret) {
    // Verify the webhook signature
    const sig = req.headers['stripe-signature'] as string;
    
    try {
      if (!sig) {
        throw new Error('No Stripe signature found in headers');
      }
      
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: '2023-10-16',
      });
      
      const event = stripe.webhooks.constructEvent(
        req.body, 
        sig, 
        webhookSecret
      );
      
      // Handle the webhook event
      await stripeService.handleStripeWebhook(event);
      
      res.json({ received: true });
    } catch (error) {
      logger.error('Webhook signature verification failed', { error });
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
  } else {
    // No webhook secret, just process the webhook
    try {
      const event = req.body as Stripe.Event;
      await stripeService.handleStripeWebhook(event);
      res.json({ received: true });
    } catch (error) {
      logger.error('Error processing webhook', { error });
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
});

export default router;