/**
 * Stripe Service
 * 
 * This module provides utilities for working with the Stripe API.
 */

import Stripe from 'stripe';
import { storage } from '../storage';
import { logger } from './logger';

// Initialize Stripe with the secret key
if (!process.env.STRIPE_SECRET_KEY) {
  logger.error('Missing required environment variable: STRIPE_SECRET_KEY');
  throw new Error('Stripe secret key is missing');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Use the latest Stripe API version
});

/**
 * Create a new customer in Stripe
 * @param email Customer email address
 * @param name Customer name
 * @param metadata Additional metadata
 * @returns Stripe customer object
 */
export async function createCustomer(
  email: string,
  name: string,
  metadata: Record<string, any> = {}
): Promise<Stripe.Customer> {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });
    
    logger.info(`Created Stripe customer for ${email}`, { customerId: customer.id });
    return customer;
  } catch (error: any) {
    logger.error('Error creating Stripe customer', { email, error: error.message });
    throw error;
  }
}

/**
 * Create a subscription for a customer
 * @param customerId Stripe customer ID
 * @param priceId Stripe price ID
 * @param trialDays Optional number of trial days
 * @returns Stripe subscription object
 */
export async function createSubscription(
  customerId: string,
  priceId: string,
  trialDays: number = 0
): Promise<Stripe.Subscription> {
  try {
    const subscriptionData: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    };
    
    // Add trial period if specified
    if (trialDays > 0) {
      subscriptionData.trial_period_days = trialDays;
    }
    
    const subscription = await stripe.subscriptions.create(subscriptionData);
    
    logger.info(`Created Stripe subscription for customer ${customerId}`, { 
      subscriptionId: subscription.id,
      priceId 
    });
    
    return subscription;
  } catch (error: any) {
    logger.error('Error creating Stripe subscription', { 
      customerId, 
      priceId, 
      error: error.message 
    });
    throw error;
  }
}

/**
 * Cancel a subscription
 * @param subscriptionId Stripe subscription ID
 * @param cancelAtPeriodEnd Whether to cancel at the end of the billing period
 * @returns Stripe subscription object
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<Stripe.Subscription> {
  try {
    let subscription;
    
    if (cancelAtPeriodEnd) {
      // Cancel at the end of the billing period
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } else {
      // Cancel immediately
      subscription = await stripe.subscriptions.cancel(subscriptionId);
    }
    
    logger.info(`Cancelled Stripe subscription ${subscriptionId}`, {
      cancelAtPeriodEnd,
      status: subscription.status
    });
    
    return subscription;
  } catch (error: any) {
    logger.error('Error cancelling Stripe subscription', { 
      subscriptionId, 
      error: error.message 
    });
    throw error;
  }
}

/**
 * Retrieve a subscription
 * @param subscriptionId Stripe subscription ID
 * @returns Stripe subscription object
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['customer', 'default_payment_method', 'latest_invoice.payment_intent'],
    });
    
    return subscription;
  } catch (error: any) {
    logger.error('Error retrieving Stripe subscription', { 
      subscriptionId, 
      error: error.message 
    });
    throw error;
  }
}

/**
 * Create a payment intent
 * @param amount Amount in dollars (will be converted to cents)
 * @param currency Currency code (default: 'usd')
 * @param customerId Optional Stripe customer ID
 * @param metadata Additional metadata
 * @returns Stripe payment intent object
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  customerId?: string,
  metadata: Record<string, any> = {}
): Promise<Stripe.PaymentIntent> {
  try {
    // Convert amount to cents
    const amountInCents = Math.round(amount * 100);
    
    const paymentIntentData: Stripe.PaymentIntentCreateParams = {
      amount: amountInCents,
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    };
    
    // Add customer if specified
    if (customerId) {
      paymentIntentData.customer = customerId;
    }
    
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);
    
    logger.info('Created Stripe payment intent', { 
      amount: amountInCents, 
      currency,
      paymentIntentId: paymentIntent.id 
    });
    
    return paymentIntent;
  } catch (error: any) {
    logger.error('Error creating Stripe payment intent', { 
      amount, 
      currency, 
      error: error.message 
    });
    throw error;
  }
}

/**
 * Get subscription plans with Stripe price IDs
 * @returns Array of subscription plans
 */
export async function getSubscriptionPlans() {
  try {
    // Get all plans from the database
    const plans = await storage.getSubscriptionPlans();
    
    // Return plans with Stripe price IDs
    return plans;
  } catch (error: any) {
    logger.error('Error getting subscription plans', { error: error.message });
    throw error;
  }
}

/**
 * Handle Stripe webhook events
 * @param event Stripe event object
 * @returns Response message
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<string> {
  try {
    logger.info(`Processing Stripe webhook event: ${event.type}`, { eventId: event.id });
    
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
        
      default:
        logger.info(`Unhandled Stripe webhook event: ${event.type}`);
    }
    
    return `Handled event ${event.type}`;
  } catch (error: any) {
    logger.error('Error handling Stripe webhook event', { 
      eventType: event.type,
      error: error.message 
    });
    throw error;
  }
}

/**
 * Handle subscription created webhook event
 * @param subscription Stripe subscription object
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
  // Get customer ID from subscription
  const customerId = subscription.customer as string;
  
  // Find user with this Stripe customer ID
  const user = await storage.getUserByStripeCustomerId(customerId);
  
  if (!user) {
    logger.warn(`No user found for Stripe customer ID: ${customerId}`);
    return;
  }
  
  // Update user with subscription ID
  await storage.updateUserStripeSubscription(user.id, subscription.id, subscription.status);
  
  logger.info(`Updated user ${user.id} with new subscription ${subscription.id}`);
}

/**
 * Handle subscription updated webhook event
 * @param subscription Stripe subscription object
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  // Find user with this subscription ID
  const user = await storage.getUserByStripeSubscriptionId(subscription.id);
  
  if (!user) {
    logger.warn(`No user found for Stripe subscription ID: ${subscription.id}`);
    return;
  }
  
  // Update user with new subscription status
  await storage.updateUserStripeSubscription(user.id, subscription.id, subscription.status);
  
  logger.info(`Updated subscription status for user ${user.id} to ${subscription.status}`);
}

/**
 * Handle subscription deleted webhook event
 * @param subscription Stripe subscription object
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  // Find user with this subscription ID
  const user = await storage.getUserByStripeSubscriptionId(subscription.id);
  
  if (!user) {
    logger.warn(`No user found for Stripe subscription ID: ${subscription.id}`);
    return;
  }
  
  // Update user to remove subscription
  await storage.updateUserStripeSubscription(user.id, null, 'canceled');
  
  logger.info(`Removed subscription for user ${user.id}`);
}

/**
 * Handle invoice payment succeeded webhook event
 * @param invoice Stripe invoice object
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  // Only process subscription invoices
  if (!invoice.subscription) return;
  
  const subscriptionId = invoice.subscription as string;
  
  // Find user with this subscription ID
  const user = await storage.getUserByStripeSubscriptionId(subscriptionId);
  
  if (!user) {
    logger.warn(`No user found for Stripe subscription ID: ${subscriptionId}`);
    return;
  }
  
  // Get subscription to check status
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // Update user with active subscription status
  await storage.updateUserStripeSubscription(user.id, subscriptionId, subscription.status);
  
  // Record the payment
  await storage.createPayment({
    userId: user.id,
    amount: (invoice.amount_paid / 100).toFixed(2), // Convert from cents to dollars
    currency: invoice.currency,
    status: 'succeeded',
    type: 'subscription',
    stripeInvoiceId: invoice.id,
    stripePaymentIntentId: invoice.payment_intent as string,
  });
  
  logger.info(`Recorded successful payment for user ${user.id}`, {
    subscriptionId,
    invoiceId: invoice.id,
    amount: invoice.amount_paid
  });
}

/**
 * Handle invoice payment failed webhook event
 * @param invoice Stripe invoice object
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  // Only process subscription invoices
  if (!invoice.subscription) return;
  
  const subscriptionId = invoice.subscription as string;
  
  // Find user with this subscription ID
  const user = await storage.getUserByStripeSubscriptionId(subscriptionId);
  
  if (!user) {
    logger.warn(`No user found for Stripe subscription ID: ${subscriptionId}`);
    return;
  }
  
  // Get subscription to check status
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // Update user with new subscription status
  await storage.updateUserStripeSubscription(user.id, subscriptionId, subscription.status);
  
  // Record the failed payment
  await storage.createPayment({
    userId: user.id,
    amount: (invoice.amount_due / 100).toFixed(2), // Convert from cents to dollars
    currency: invoice.currency,
    status: 'failed',
    type: 'subscription',
    stripeInvoiceId: invoice.id,
    stripePaymentIntentId: invoice.payment_intent as string,
    failureReason: invoice.last_payment_error?.message,
  });
  
  logger.warn(`Recorded failed payment for user ${user.id}`, {
    subscriptionId,
    invoiceId: invoice.id,
    amount: invoice.amount_due
  });
}