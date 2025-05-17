import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

/**
 * Hook to check if a user has access to premium content
 * 
 * @param courseId - The ID of the course to check access for
 * @returns An object containing access information and loading state
 */
export function usePremiumAccess(courseId?: number) {
  const { user, isAuthenticated } = useAuth();
  
  // Query to check course access level
  const { data, isLoading } = useQuery({
    queryKey: [`/api/product/${courseId}/access`],
    enabled: !!courseId && isAuthenticated,
  });
  
  // Default state when not authenticated or no course specified
  if (!isAuthenticated || !courseId) {
    return {
      hasAccess: false,
      isPremium: true,
      isLoading: false,
      currentPlan: null,
      requiredPlan: 'premium'
    };
  }
  
  return {
    hasAccess: data?.hasAccess || false,
    isPremium: data?.requiresSubscription || true,
    isLoading,
    currentPlan: data?.currentPlanName || null,
    requiredPlan: data?.requiredPlanId || 'premium'
  };
}

export default usePremiumAccess;