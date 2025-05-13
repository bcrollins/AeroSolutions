/**
 * Stripe Payment Service
 * 
 * This module handles all Stripe payment integrations including:
 * - Creating payment intents for one-time payments
 * - Managing subscription plans
 * - Processing webhooks for payment events
 */

import Stripe from 'stripe';
import { storage } from '../storage';
import { logger } from '../utils/logger';

// Initialize Stripe with secret key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required environment variable: STRIPE_SECRET_KEY');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

/**
 * Create a payment intent for one-time purchases
 * 
 * @param amount - Amount in dollars (will be converted to cents)
 * @param currency - Currency code (default: usd)
 * @param metadata - Additional metadata to store with the payment
 * @returns Payment intent with client secret
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> {
  try {
    // Convert dollar amount to cents for Stripe
    const amountInCents = Math.round(amount * 100);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    logger.info(`Created payment intent: ${paymentIntent.id} for $${amount}`);
    return paymentIntent;
  } catch (error) {
    logger.error('Error creating payment intent:', error);
    throw error;
  }
}

/**
 * Create a new customer in Stripe
 * 
 * @param email - Customer email address
 * @param name - Customer name
 * @param metadata - Additional metadata
 * @returns Stripe customer object
 */
export async function createCustomer(
  email: string,
  name?: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Customer> {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });
    
    logger.info(`Created Stripe customer: ${customer.id} for ${email}`);
    return customer;
  } catch (error) {
    logger.error('Error creating Stripe customer:', error);
    throw error;
  }
}

/**
 * Create a subscription for a customer
 * 
 * @param customerId - Stripe customer ID
 * @param priceId - Stripe price ID
 * @param metadata - Additional metadata
 * @returns Stripe subscription object
 */
export async function createSubscription(
  customerId: string,
  priceId: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
        },
      ],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata,
    });
    
    logger.info(`Created subscription: ${subscription.id} for customer ${customerId}`);
    return subscription;
  } catch (error) {
    logger.error('Error creating subscription:', error);
    throw error;
  }
}

/**
 * Cancel a subscription
 * 
 * @param subscriptionId - Stripe subscription ID
 * @param cancelImmediately - Whether to cancel immediately or at period end
 * @returns Canceled subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelImmediately: boolean = false
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId, {
      cancel_at_period_end: !cancelImmediately,
    });
    
    logger.info(`Canceled subscription: ${subscriptionId}`);
    return subscription;
  } catch (error) {
    logger.error(`Error canceling subscription ${subscriptionId}:`, error);
    throw error;
  }
}

/**
 * Update a customer's subscription
 * 
 * @param subscriptionId - Stripe subscription ID
 * @param newPriceId - New price ID to switch to
 * @returns Updated subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  try {
    // Get the subscription to find the current item ID
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const itemId = subscription.items.data[0].id;
    
    // Update the subscription with the new price
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: itemId,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });
    
    logger.info(`Updated subscription: ${subscriptionId} to price ${newPriceId}`);
    return updatedSubscription;
  } catch (error) {
    logger.error(`Error updating subscription ${subscriptionId}:`, error);
    throw error;
  }
}

/**
 * Process a Stripe webhook event
 * 
 * @param event - Stripe webhook event
 * @returns Processing result
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<{ status: string; message: string }> {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        return await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        
      case 'payment_intent.payment_failed':
        return await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        
      case 'customer.subscription.created':
        return await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        
      case 'customer.subscription.updated':
        return await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        
      case 'customer.subscription.deleted':
        return await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        
      case 'invoice.payment_succeeded':
        return await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        
      case 'invoice.payment_failed':
        return await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        
      default:
        logger.info(`Unhandled webhook event type: ${event.type}`);
        return { status: 'ignored', message: `Event type not handled: ${event.type}` };
    }
  } catch (error) {
    logger.error(`Error handling webhook event ${event.id}:`, error);
    throw error;
  }
}

// Webhook event handlers
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<{ status: string; message: string }> {
  logger.info(`Payment intent succeeded: ${paymentIntent.id}`);
  // Process the successful payment (e.g., fulfill order)
  
  // If there's product info in metadata, process the purchase
  if (paymentIntent.metadata.productId) {
    await storage.createPurchase({
      userId: parseInt(paymentIntent.metadata.userId),
      productId: parseInt(paymentIntent.metadata.productId),
      amount: (paymentIntent.amount / 100).toString(),
      transactionId: paymentIntent.id,
      status: 'completed',
    });
    
    logger.info(`Recorded purchase for product ${paymentIntent.metadata.productId} by user ${paymentIntent.metadata.userId}`);
  }
  
  return { status: 'success', message: 'Payment recorded' };
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<{ status: string; message: string }> {
  logger.warn(`Payment intent failed: ${paymentIntent.id}`);
  
  // Record the failed payment if we have user info
  if (paymentIntent.metadata.userId) {
    await storage.createPurchase({
      userId: parseInt(paymentIntent.metadata.userId),
      productId: paymentIntent.metadata.productId ? parseInt(paymentIntent.metadata.productId) : null,
      amount: (paymentIntent.amount / 100).toString(),
      transactionId: paymentIntent.id,
      status: 'failed',
    });
  }
  
  return { status: 'failure', message: 'Payment failed' };
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<{ status: string; message: string }> {
  logger.info(`Subscription created: ${subscription.id} for customer ${subscription.customer}`);
  
  // Additional processing for new subscriptions
  
  return { status: 'success', message: 'Subscription created' };
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<{ status: string; message: string }> {
  logger.info(`Subscription updated: ${subscription.id}`);
  
  // Update the local subscription record with the new status
  if (subscription.metadata.userId) {
    const userId = parseInt(subscription.metadata.userId);
    const user = await storage.getUserById(userId);
    
    if (user && user.stripeSubscriptionId === subscription.id) {
      await storage.updateUserSubscription(userId, {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });
      
      logger.info(`Updated subscription status for user ${userId}`);
    }
  }
  
  return { status: 'success', message: 'Subscription updated' };
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<{ status: string; message: string }> {
  logger.info(`Subscription deleted: ${subscription.id}`);
  
  // Update the user's subscription status
  if (subscription.metadata.userId) {
    const userId = parseInt(subscription.metadata.userId);
    await storage.updateUserSubscription(userId, {
      subscriptionStatus: 'canceled',
      cancelAtPeriodEnd: false,
    });
    
    logger.info(`Marked subscription as canceled for user ${userId}`);
  }
  
  return { status: 'success', message: 'Subscription canceled' };
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<{ status: string; message: string }> {
  logger.info(`Invoice payment succeeded: ${invoice.id}`);
  
  // If this is for a subscription, update the subscription status
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    
    if (subscription.metadata.userId) {
      const userId = parseInt(subscription.metadata.userId);
      await storage.updateUserSubscription(userId, {
        subscriptionStatus: 'active',
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      });
      
      logger.info(`Updated subscription status to active for user ${userId}`);
    }
  }
  
  return { status: 'success', message: 'Invoice payment recorded' };
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<{ status: string; message: string }> {
  logger.warn(`Invoice payment failed: ${invoice.id}`);
  
  // If this is for a subscription, update the subscription status
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    
    if (subscription.metadata.userId) {
      const userId = parseInt(subscription.metadata.userId);
      await storage.updateUserSubscription(userId, {
        subscriptionStatus: 'past_due',
      });
      
      logger.info(`Updated subscription status to past_due for user ${userId}`);
      
      // Here you could trigger an email notification to the user
    }
  }
  
  return { status: 'failure', message: 'Invoice payment failed' };
}

// Function to create Stripe products and prices from our subscription plans
export async function syncPlansWithStripe(): Promise<void> {
  try {
    const plans = await storage.getAllSubscriptionPlans();
    
    for (const plan of plans) {
      // Check if product exists for this plan
      let product: Stripe.Product;
      
      // If the plan has a Stripe product ID, retrieve it
      if (plan.stripeProductId) {
        try {
          product = await stripe.products.retrieve(plan.stripeProductId);
          logger.info(`Retrieved existing Stripe product: ${product.id} for plan ${plan.name}`);
        } catch (error) {
          // Product doesn't exist or was deleted, create a new one
          logger.warn(`Plan ${plan.name} has Stripe product ID ${plan.stripeProductId} but it doesn't exist. Creating new product.`);
          product = await createStripeProduct(plan);
        }
      } else {
        // Create a new product
        product = await createStripeProduct(plan);
      }
      
      // Now handle the price
      // For monthly and annual plans, we need two prices
      if (plan.stripeMonthlyPriceId) {
        try {
          const price = await stripe.prices.retrieve(plan.stripeMonthlyPriceId);
          logger.info(`Retrieved existing monthly price: ${price.id} for plan ${plan.name}`);
        } catch (error) {
          // Price doesn't exist, create a new one
          await createStripePrice(product.id, plan, 'monthly');
        }
      } else {
        await createStripePrice(product.id, plan, 'monthly');
      }
      
      // Annual price
      if (plan.stripeAnnualPriceId) {
        try {
          const price = await stripe.prices.retrieve(plan.stripeAnnualPriceId);
          logger.info(`Retrieved existing annual price: ${price.id} for plan ${plan.name}`);
        } catch (error) {
          // Price doesn't exist, create a new one
          await createStripePrice(product.id, plan, 'annual');
        }
      } else {
        await createStripePrice(product.id, plan, 'annual');
      }
    }
    
    logger.info('Successfully synced all subscription plans with Stripe');
  } catch (error) {
    logger.error('Error syncing plans with Stripe:', error);
    throw error;
  }
}

// Helper to create a Stripe product from a plan
async function createStripeProduct(plan: any): Promise<Stripe.Product> {
  const product = await stripe.products.create({
    name: plan.name,
    description: plan.description,
    metadata: {
      planId: plan.id.toString(),
    },
    active: true,
  });
  
  // Update the plan with the Stripe product ID
  await storage.updateSubscriptionPlan(plan.id, {
    stripeProductId: product.id,
  });
  
  logger.info(`Created Stripe product: ${product.id} for plan ${plan.name}`);
  return product;
}

// Helper to create a Stripe price for a product
async function createStripePrice(productId: string, plan: any, interval: 'monthly' | 'annual'): Promise<Stripe.Price> {
  // Extract the numeric part of the price string (remove currency symbol)
  let priceValue = plan.price;
  if (typeof priceValue === 'string') {
    priceValue = parseFloat(priceValue.replace(/[^0-9.]/g, ''));
  }
  
  // For annual pricing, apply a discount if applicable
  if (interval === 'annual') {
    // Apply 20% discount for annual plans
    priceValue = priceValue * 12 * 0.8;
  }
  
  // Convert to cents for Stripe
  const priceCents = Math.round(priceValue * 100);
  
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: priceCents,
    currency: 'usd',
    recurring: {
      interval: interval === 'monthly' ? 'month' : 'year',
    },
    metadata: {
      planId: plan.id.toString(),
      interval,
    },
  });
  
  // Update the plan with the Stripe price ID
  const updateData: any = {};
  if (interval === 'monthly') {
    updateData.stripeMonthlyPriceId = price.id;
  } else {
    updateData.stripeAnnualPriceId = price.id;
  }
  
  await storage.updateSubscriptionPlan(plan.id, updateData);
  
  logger.info(`Created ${interval} Stripe price: ${price.id} for plan ${plan.name}`);
  return price;
}