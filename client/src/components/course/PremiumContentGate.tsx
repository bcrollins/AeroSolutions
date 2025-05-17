import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import usePremiumAccess from '@/hooks/usePremiumAccess';
import { ShieldCheck, Lock, CreditCard } from 'lucide-react';

// Simple loading spinner component
const LoadingSpinner = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) => {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8';
  return (
    <div className={`animate-spin ${sizeClass} ${className}`} role="status">
      <svg className="text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

type PremiumContentGateProps = {
  courseId: number;
  children: React.ReactNode;
};

const PremiumContentGate: React.FC<PremiumContentGateProps> = ({ courseId, children }) => {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading: isLoadingAuth } = useAuth();
  const { hasAccess, isPremium, isLoading, currentPlan, requiredPlan } = usePremiumAccess(courseId);

  if (isLoadingAuth || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If the user is not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            Please sign in to access this content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Lock className="h-5 w-5" />
            <p>This content requires authentication</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => navigate('/api/login')} className="w-full">
            Sign In
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // If premium content and user doesn't have access, show subscription prompt
  if (isPremium && !hasAccess) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Premium Content</CardTitle>
              <CardDescription>
                Upgrade to access this content
              </CardDescription>
            </div>
            <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
              <CreditCard className="h-3 w-3" />
              Premium
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="h-5 w-5" />
              <p>
                This content requires a {requiredPlan} subscription.
                {currentPlan && ` You currently have a ${currentPlan} plan.`}
              </p>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-md p-4">
              <h3 className="font-medium mb-2">Benefits of upgrading:</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  Access to all premium courses
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  Hands-on projects and assignments
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  Certificates upon completion
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={() => navigate('/pricing')} className="w-full">
            View Subscription Options
          </Button>
          <Button variant="outline" onClick={() => navigate('/courses')} className="w-full">
            Browse Free Courses
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // If the user has access, show the content
  return <>{children}</>;
};

export default PremiumContentGate;