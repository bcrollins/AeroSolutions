import { apiRequest } from '@/lib/queryClient';
import { loadStripe, Stripe } from '@stripe/stripe-js';

/**
 * Subscription plan interface defining the structure of a plan
 */
export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  features: string[];
  isPopular?: boolean;
  isEnterprise?: boolean;
  isActive?: boolean;
  stripePriceId?: string;
  stripeAnnualPriceId?: string;
}

/**
 * Interface for subscription data returned from the API
 */
export interface SubscriptionData {
  subscription: {
    id: string;
    status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    cancel_at?: string;
    canceled_at?: string;
    plan?: {
      id: string;
      interval: 'month' | 'year';
      amount: number;
    };
  };
  plan: SubscriptionPlan;
}

/**
 * Get all available subscription plans
 * @returns Array of subscription plans
 */
export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await apiRequest('GET', '/api/stripe/subscription-plans');
  
  if (!response.ok) {
    const errorData = await response.json();
    throw {
      status: response.status,
      statusText: response.statusText,
      data: errorData
    };
  }
  
  return response.json();
};

/**
 * Get current user's subscription
 * @returns Current subscription data
 */
export const getCurrentSubscription = async (): Promise<SubscriptionData> => {
  const response = await apiRequest('GET', '/api/stripe/current-subscription');
  
  if (!response.ok) {
    const errorData = await response.json();
    throw {
      status: response.status,
      statusText: response.statusText,
      data: errorData
    };
  }
  
  return response.json();
};

/**
 * Create a subscription checkout session
 * @param planId - ID of the subscription plan
 * @param interval - Billing interval (monthly or annual)
 * @returns Checkout session data with URL
 */
export const createSubscriptionCheckout = async (
  planId: number,
  interval: 'monthly' | 'annual'
): Promise<{ sessionId: string; url: string }> => {
  const response = await apiRequest('POST', '/api/stripe/create-subscription-checkout', {
    planId,
    interval
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw {
      status: response.status,
      statusText: response.statusText,
      data: errorData
    };
  }
  
  return response.json();
};

/**
 * Cancel a subscription
 * @param subscriptionId - ID of the subscription to cancel
 * @returns Cancellation result
 */
export const cancelSubscription = async (
  subscriptionId: string
): Promise<{ success: boolean }> => {
  const response = await apiRequest('POST', '/api/stripe/cancel-subscription', {
    subscriptionId
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw {
      status: response.status,
      statusText: response.statusText,
      data: errorData
    };
  }
  
  return response.json();
};

/**
 * Create a one-time payment intent
 * @param amount - Amount to charge in dollars
 * @param metadata - Additional metadata for the payment
 * @returns Payment intent client secret
 */
export const createPaymentIntent = async (
  amount: number,
  metadata?: Record<string, string>
): Promise<{ clientSecret: string }> => {
  const response = await apiRequest('POST', '/api/stripe/create-payment-intent', {
    amount,
    metadata
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw {
      status: response.status,
      statusText: response.statusText,
      data: errorData
    };
  }
  
  return response.json();
};

/**
 * Format a price for display
 * @param amount - Amount in cents
 * @param currency - Currency code (default: USD)
 * @returns Formatted price string
 */
export const formatPrice = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0
  }).format(amount / 100);
};

// Stripe instance to be used with React components
let stripePromise: Promise<Stripe | null>;

/**
 * Get a Stripe instance for use with React components
 * @returns Promise that resolves to a Stripe instance
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    // Get the Stripe publishable key from environment variables
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    
    if (!publishableKey) {
      console.error('Stripe publishable key is missing. Please check your environment variables.');
      return Promise.resolve(null);
    }
    
    stripePromise = loadStripe(publishableKey);
  }
  
  return stripePromise;
};