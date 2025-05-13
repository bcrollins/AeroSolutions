import Stripe from 'stripe';
import { storage } from '../storage';
import { stripe as stripeSchema } from '@shared/schema';

// Check if we have the Stripe API key
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing Stripe API key. Stripe integration will not function properly.');
}

// Initialize Stripe with the API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

/**
 * Get all subscription plans from the database
 * @returns Array of subscription plans
 */
export async function getSubscriptionPlans() {
  return storage.getSubscriptionPlans();
}

/**
 * Get a specific subscription plan by ID
 * @param planId - ID of the plan to retrieve
 * @returns Subscription plan or null if not found
 */
export async function getSubscriptionPlanById(planId: number) {
  return storage.getSubscriptionPlanById(planId);
}

/**
 * Create a Stripe checkout session for subscription
 * @param planId - Plan ID to subscribe to
 * @param customerId - Stripe customer ID
 * @param priceId - Stripe price ID
 * @param userId - User ID
 * @returns Checkout session data
 */
export async function createStripeCheckoutSession(
  planId: number,
  customerId: string,
  priceId: string,
  userId: number
) {
  // Get the current domain
  const domain = process.env.NODE_ENV === 'production'
    ? process.env.DOMAIN || 'https://your-domain.com'
    : 'http://localhost:5000';

  // Create a checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${domain}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${domain}/subscriptions`,
    subscription_data: {
      metadata: {
        userId: userId.toString(),
        planId: planId.toString(),
      },
    },
  });

  return session;
}

/**
 * Create or get a Stripe customer for a user
 * @param userId - User ID
 * @param email - User email
 * @param name - User name (optional)
 * @returns Stripe customer ID
 */
export async function getOrCreateStripeCustomer(
  userId: number,
  email: string,
  name?: string
) {
  // Check if the user already has a Stripe customer ID
  const user = await storage.getUserById(userId);
  
  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // Create a new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      userId: userId.toString(),
    },
  });

  // Save the Stripe customer ID to the user record
  await storage.updateUser(userId, { stripeCustomerId: customer.id });

  return customer.id;
}

/**
 * Create a subscription for a user
 * @param customerId - Stripe customer ID
 * @param priceId - Stripe price ID
 * @param planId - Plan ID
 * @param userId - User ID
 * @returns Created subscription
 */
export async function createSubscription(
  customerId: string,
  priceId: string,
  planId: number,
  userId: number
) {
  try {
    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
        },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: userId.toString(),
        planId: planId.toString(),
      },
    });

    // Save the subscription in the database
    await storage.createUserSubscription({
      userId,
      planId,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    return {
      subscriptionId: subscription.id,
      clientSecret: paymentIntent?.client_secret,
      status: subscription.status,
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

/**
 * Get a user's active subscription
 * @param userId - User ID
 * @returns Active subscription data
 */
export async function getUserSubscription(userId: number) {
  const userSubscription = await storage.getUserSubscription(userId);
  
  if (!userSubscription) {
    return null;
  }

  // If the subscription has a Stripe ID, retrieve the latest data from Stripe
  if (userSubscription.stripeSubscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(
        userSubscription.stripeSubscriptionId
      );
      
      // Get the plan details
      const plan = await storage.getSubscriptionPlanById(userSubscription.planId);
      
      if (!plan) {
        throw new Error('Subscription plan not found');
      }
      
      // Return the combined data
      return {
        subscription: {
          id: subscription.id,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          cancel_at: subscription.cancel_at 
            ? new Date(subscription.cancel_at * 1000).toISOString() 
            : undefined,
          canceled_at: subscription.canceled_at 
            ? new Date(subscription.canceled_at * 1000).toISOString() 
            : undefined,
          plan: subscription.items.data[0]?.price
            ? {
                id: subscription.items.data[0].price.id,
                interval: subscription.items.data[0].price.recurring?.interval || 'month',
                amount: subscription.items.data[0].price.unit_amount || 0,
              }
            : undefined,
        },
        plan,
      };
    } catch (error) {
      console.error('Error retrieving subscription from Stripe:', error);
      throw error;
    }
  }
  
  // If no Stripe subscription, just return the database data
  const plan = await storage.getSubscriptionPlanById(userSubscription.planId);
  
  if (!plan) {
    throw new Error('Subscription plan not found');
  }
  
  return {
    subscription: {
      id: userSubscription.id.toString(),
      status: userSubscription.status,
      current_period_start: userSubscription.currentPeriodStart.toISOString(),
      current_period_end: userSubscription.currentPeriodEnd.toISOString(),
      cancel_at_period_end: userSubscription.cancelAtPeriodEnd,
    },
    plan,
  };
}

/**
 * Cancel a user's subscription
 * @param userId - User ID
 * @param subscriptionId - Stripe subscription ID
 * @param immediate - Whether to cancel immediately or at the end of period
 */
export async function cancelSubscription(
  userId: number, 
  subscriptionId: string,
  immediate: boolean = false
) {
  try {
    // Verify this subscription belongs to the user
    const userSubscription = await storage.getUserSubscriptionByStripeId(subscriptionId);
    
    if (!userSubscription || userSubscription.userId !== userId) {
      throw new Error('Subscription not found or does not belong to this user');
    }
    
    // Cancel in Stripe
    if (immediate) {
      // Cancel immediately
      await stripe.subscriptions.cancel(subscriptionId);
    } else {
      // Cancel at period end
      await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
    }
    
    // Update in database
    await storage.updateUserSubscription(userSubscription.id, { 
      cancelAtPeriodEnd: !immediate,
      status: immediate ? 'canceled' : userSubscription.status,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

/**
 * Create a payment intent for a one-time payment
 * @param amount - Amount in cents
 * @param metadata - Additional metadata
 * @returns Payment intent client secret
 */
export async function createPaymentIntent(
  amount: number,
  metadata?: Record<string, string>
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    return { clientSecret: paymentIntent.client_secret };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

// Webhook handler for Stripe events
export async function handleStripeWebhook(event: Stripe.Event) {
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = Number(subscription.metadata.userId);
        const planId = Number(subscription.metadata.planId);
        
        if (!userId || !planId) {
          console.error('Missing metadata in subscription:', subscription.id);
          return;
        }
        
        // Update the subscription in the database
        const existingSubscription = await storage.getUserSubscriptionByStripeId(subscription.id);
        
        if (existingSubscription) {
          await storage.updateUserSubscription(existingSubscription.id, {
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          });
        } else {
          await storage.createUserSubscription({
            userId,
            planId,
            stripeSubscriptionId: subscription.id,
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          });
        }
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const existingSubscription = await storage.getUserSubscriptionByStripeId(subscription.id);
        
        if (existingSubscription) {
          await storage.updateUserSubscription(existingSubscription.id, {
            status: 'canceled',
            cancelAtPeriodEnd: false,
          });
        }
        
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          const existingSubscription = await storage.getUserSubscriptionByStripeId(
            invoice.subscription as string
          );
          
          if (existingSubscription) {
            await storage.updateUserSubscription(existingSubscription.id, {
              status: 'active',
            });
          }
          
          // Add billing history record if needed
        }
        
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          const existingSubscription = await storage.getUserSubscriptionByStripeId(
            invoice.subscription as string
          );
          
          if (existingSubscription) {
            await storage.updateUserSubscription(existingSubscription.id, {
              status: 'past_due',
            });
          }
        }
        
        break;
      }
    }
  } catch (error) {
    console.error('Error handling Stripe webhook:', error);
    throw error;
  }
}