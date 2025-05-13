import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LockKeyhole, Sparkles, Crown } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface PaywallGuardProps {
  children: React.ReactNode;
  requiredSubscriptionLevel?: 'free' | 'basic' | 'professional' | 'enterprise';
  title?: string;
  description?: string;
  featuresList?: string[];
}

export function PaywallGuard({
  children,
  requiredSubscriptionLevel = 'basic',
  title = 'Premium Feature',
  description = 'This feature requires a subscription to access.',
  featuresList = []
}: PaywallGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  // Default to 'free' if no subscription data is available
  const userSubscriptionLevel = user?.subscriptionLevel || 'free';
  
  // Define the subscription levels hierarchy for comparison
  const subscriptionLevels = {
    'free': 0,
    'basic': 1,
    'professional': 2,
    'enterprise': 3
  };
  
  // Check if user has the required subscription level
  const hasRequiredSubscription = 
    isAuthenticated && 
    subscriptionLevels[userSubscriptionLevel] >= subscriptionLevels[requiredSubscriptionLevel];
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px] w-full">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // User has appropriate subscription level - show the content
  if (hasRequiredSubscription) {
    return <>{children}</>;
  }
  
  // User is authenticated but doesn't have appropriate subscription level - show upgrade prompt
  if (isAuthenticated) {
    return (
      <Card className="w-full border border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg text-amber-700">{title}</CardTitle>
          </div>
          <CardDescription className="text-amber-700">
            Upgrade your subscription to access this feature.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="text-sm text-amber-700 mb-3">
            This feature requires a {requiredSubscriptionLevel} subscription or higher.
            You currently have a {userSubscriptionLevel} subscription.
          </p>
          
          {featuresList.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-amber-800">With this feature you can:</p>
              <ul className="text-sm space-y-1">
                {featuresList.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-amber-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/member-dashboard">
              Go to Dashboard
            </Link>
          </Button>
          <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" asChild>
            <Link href="/subscriptions">
              Upgrade Now
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // User is not authenticated - show login prompt
  return (
    <Card className="w-full border border-slate-200 bg-slate-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <LockKeyhole className="h-5 w-5 text-slate-blue-500" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-slate-600 mb-3">
          Sign in or create an account to access premium features.
        </p>
        
        {featuresList.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">With this feature you can:</p>
            <ul className="text-sm space-y-1">
              {featuresList.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-slate-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-3">
        <Button variant="outline" asChild>
          <Link href="/subscriptions">
            View Plans
          </Link>
        </Button>
        <Button className="bg-gradient-to-r from-slate-blue-500 to-electric-cyan-500 hover:from-slate-blue-600 hover:to-electric-cyan-600" asChild>
          <Link href="/login">
            Sign In
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default PaywallGuard;