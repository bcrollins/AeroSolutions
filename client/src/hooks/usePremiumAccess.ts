import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

/**
 * Hook to check if the current user has access to premium content
 * @param productId - The ID of the product or course to check access for
 * @returns Access information and loading state
 */
export function usePremiumAccess(productId: number) {
  const { isAuthenticated } = useAuth();
  
  // Only make the request if user is authenticated
  const {
    data,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: [`/api/product/${productId}/access`],
    // Disable the query if the user is not authenticated
    enabled: isAuthenticated && !!productId,
  });

  // Format the response for the component
  return {
    // Default to no access if there's no data
    hasAccess: data?.hasAccess || false,
    requiresSubscription: data?.requiresSubscription || false,
    isLoading,
    isError,
    error,
    currentPlanName: data?.currentPlanName || null,
    requiredPlanId: data?.requiredPlanId || null,
  };
}