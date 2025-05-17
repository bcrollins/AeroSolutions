import React from 'react';
import { Link } from 'wouter';
import { usePremiumAccess } from '../../hooks/usePremiumAccess';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock, AlertTriangle } from 'lucide-react';

interface PremiumContentGateProps {
  productId: number;
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode;
}

/**
 * A component that gates content behind premium subscription access
 */
export function PremiumContentGate({
  productId,
  children,
  fallbackComponent
}: PremiumContentGateProps) {
  const { isAuthenticated, user } = useAuth();
  const { 
    hasAccess, 
    requiresSubscription, 
    isLoading, 
    currentPlanName,
    requiredPlanId 
  } = usePremiumAccess(productId);

  // If checking access or not authenticated yet, show loading
  if (isLoading) {
    return (
      <div className="w-full p-8 space-y-4">
        <Skeleton className="h-8 w-full max-w-md" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  // If the user has access, show the content
  if (hasAccess) {
    return <>{children}</>;
  }

  // If there's a custom fallback component provided, use it
  if (fallbackComponent) {
    return <>{fallbackComponent}</>;
  }

  // Otherwise show a default access restriction message
  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-6">
      <Alert variant="destructive" className="bg-opacity-10">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="text-xl font-semibold mb-2">
          Premium Content
        </AlertTitle>
        <AlertDescription className="text-base">
          {!isAuthenticated ? (
            <div className="space-y-4">
              <p>
                This content requires a subscription. Please log in to access it.
              </p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/api/login">Log In</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p>
                This content requires a {requiredPlanId || 'premium'} subscription.
                {currentPlanName && ` Your current plan is: ${currentPlanName}.`}
              </p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/pricing">Upgrade Subscription</Link>
                </Button>
              </div>
            </div>
          )}
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="text-primary h-5 w-5" />
          <h3 className="text-lg font-semibold">Premium Features</h3>
        </div>
        <ul className="space-y-2 ml-6 list-disc text-sm">
          <li>Advanced AI-powered course content</li>
          <li>Downloadable resources and materials</li>
          <li>Personalized learning paths and recommendations</li>
          <li>Interactive exercises and quizzes</li>
          <li>Completion certificates</li>
        </ul>
      </div>
    </div>
  );
}