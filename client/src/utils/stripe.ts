import { loadStripe, Stripe } from '@stripe/stripe-js';
import { apiRequest } from '@/lib/queryClient';

// Subscription plan interface
export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  features: string[];
  stripePriceId?: string;
  stripeMonthlyPriceId?: string;
  stripeAnnualPriceId?: string;
  isPopular?: boolean;
  isEnterprise?: boolean;
  isActive?: boolean;
}

// Load Stripe outside of component render to avoid recreating Stripe object
let stripePromise: Promise<Stripe | null>;

/**
 * Get Stripe instance
 * @returns Stripe promise
 */
export const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    if (!key) {
      console.error('Stripe public key not found');
      throw new Error('Stripe public key is missing');
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

/**
 * Fetch available subscription plans
 * @returns List of subscription plans
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const response = await apiRequest('GET', '/api/stripe/subscription-plans');
    if (!response.ok) {
      throw new Error('Failed to fetch subscription plans');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
}

/**
 * Create a subscription
 * @param priceId Stripe price ID
 * @param planId Plan ID
 * @returns Object containing client secret and subscription ID
 */
export async function createSubscription(
  priceId: string,
  planId: number
): Promise<{
  clientSecret: string;
  subscriptionId: string;
  status?: string;
}> {
  try {
    const response = await apiRequest('POST', '/api/stripe/create-subscription', {
      priceId,
      planId,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

/**
 * Cancel a subscription
 * @param subscriptionId Stripe subscription ID
 * @returns Success status
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiRequest('POST', '/api/stripe/cancel-subscription', {
      subscriptionId,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to cancel subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

/**
 * Get current subscription details
 * @returns Subscription details
 */
export async function getCurrentSubscription(): Promise<{
  subscription: any;
  plan: SubscriptionPlan | null;
}> {
  try {
    const response = await apiRequest('GET', '/api/stripe/current-subscription');
    
    if (!response.ok) {
      if (response.status === 404) {
        // No subscription found, not an error
        return { subscription: null, plan: null };
      }
      throw new Error('Failed to fetch current subscription');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching current subscription:', error);
    throw error;
  }
}

/**
 * Create a payment intent for one-time payments
 * @param amount Amount in dollars (will be converted to cents)
 * @param productId Optional product ID for tracking
 * @returns Client secret for payment intent
 */
export async function createPaymentIntent(
  amount: number,
  productId?: number
): Promise<{ clientSecret: string }> {
  try {
    const response = await apiRequest('POST', '/api/stripe/create-payment-intent', {
      amount,
      productId,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create payment intent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}