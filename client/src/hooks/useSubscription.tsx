import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentSubscription, SubscriptionPlan } from '@/utils/stripe';
import { useToast } from '@/hooks/use-toast';
import { canAccessProduct as checkProductAccess } from '@/utils/productData';

/**
 * Hook for managing user subscription state
 * @returns Subscription-related state and utility functions
 */
export function useSubscription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  // Get current subscription status
  const {
    data: subscriptionData,
    error,
    isLoading: isSubscriptionLoading,
    refetch,
  } = useQuery({
    queryKey: ['/api/stripe/current-subscription'],
    queryFn: getCurrentSubscription,
    retry: 1,
    enabled: true, // This will run the query immediately
    onError: (err: any) => {
      // Only show error toast if it's not a 404 (no subscription found)
      if (err.status !== 404) {
        toast({
          title: 'Subscription error',
          description: 'Unable to fetch subscription status. Please try again.',
          variant: 'destructive',
        });
      }
    },
  });
  
  // Set loading state
  useEffect(() => {
    setIsLoading(isSubscriptionLoading);
  }, [isSubscriptionLoading]);
  
  // Get subscription status
  const hasActiveSubscription = 
    subscriptionData?.subscription && 
    ['active', 'trialing'].includes(subscriptionData.subscription.status);
  
  // Destructuring subscription data for convenience
  const subscription = subscriptionData?.subscription || null;
  const plan = subscriptionData?.plan || null;
  
  // Determine user's current plan level
  const userSubscription = {
    plan: plan ? plan.name.toLowerCase().includes('professional') 
                ? 'professional' 
                : plan.name.toLowerCase().includes('enterprise') 
                ? 'enterprise' 
                : 'starter'
          : 'starter',
    status: subscription ? subscription.status as any : 'inactive'
  };
  
  /**
   * Invalidate subscription data to refresh it
   */
  const refreshSubscription = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/stripe/current-subscription'] });
  };
  
  /**
   * Check if the user has access to a feature based on plan level
   * @param requiredPlanId - The minimum plan ID required for access
   * @returns Whether the user has access to the feature
   */
  const hasFeatureAccess = (requiredPlanId: number): boolean => {
    // If no plan is required, everyone has access
    if (!requiredPlanId) return true;
    
    // If no active subscription, no access
    if (!hasActiveSubscription || !plan) return false;
    
    // Check if current plan ID is greater than or equal to required plan ID
    return plan.id >= requiredPlanId;
  };
  
  /**
   * Check if the user has access to a specific product
   * @param requiredPlan - The plan level required for the product
   * @returns Whether the user has access to the product
   */
  const canAccessProduct = (requiredPlan?: string): boolean => {
    if (!requiredPlan) return true;
    return checkProductAccess(requiredPlan, userSubscription.plan);
  };
  
  /**
   * Get a list of features the user has access to based on their current plan
   * @param allPlans - All available subscription plans
   * @returns Array of feature strings the user has access to
   */
  const getAccessibleFeatures = (allPlans: SubscriptionPlan[]): string[] => {
    if (!hasActiveSubscription || !plan) return [];
    
    // Find current plan in the list
    const currentPlan = allPlans.find(p => p.id === plan.id);
    if (!currentPlan) return [];
    
    return currentPlan.features;
  };
  
  return {
    isLoading,
    error,
    subscription,
    plan,
    userSubscription,
    hasActiveSubscription,
    refreshSubscription,
    hasFeatureAccess,
    canAccessProduct,
    getAccessibleFeatures,
  };
}