import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { canAccessProduct } from '@/utils/productData';

interface UseSubscriptionResult {
  userSubscription: {
    plan: string;
    status: 'active' | 'inactive' | 'trial' | 'expired';
    expiresAt?: string;
  };
  isLoading: boolean;
  error: unknown;
  canAccessProduct: (requiredPlan?: string) => boolean;
}

/**
 * Hook to manage user subscription and product access
 */
export function useSubscription(): UseSubscriptionResult {
  // Default to starter plan if not authenticated or subscription data not loaded
  const [userSubscription, setUserSubscription] = useState({
    plan: 'starter',
    status: 'active' as const
  });

  // Fetch the user's subscription from the API
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/user/subscription'],
    enabled: true // Always fetch subscription data
  });

  useEffect(() => {
    if (data && data.subscription) {
      setUserSubscription({
        plan: data.subscription.plan || 'starter',
        status: data.subscription.status || 'active',
        expiresAt: data.subscription.expiresAt
      });
    }
  }, [data]);

  /**
   * Check if user can access a product based on their subscription
   */
  const checkProductAccess = (requiredPlan?: string): boolean => {
    if (!requiredPlan) return true; // If no plan is required, everyone can access
    
    // If subscription is not active, deny access regardless of plan
    if (userSubscription.status !== 'active' && userSubscription.status !== 'trial') {
      return false;
    }
    
    return canAccessProduct(requiredPlan, userSubscription.plan);
  };

  return {
    userSubscription,
    isLoading,
    error,
    canAccessProduct: checkProductAccess
  };
}