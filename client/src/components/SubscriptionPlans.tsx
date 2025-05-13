import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getSubscriptionPlans, SubscriptionPlan } from '@/utils/stripe';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X, Zap } from 'lucide-react';

interface SubscriptionPlansProps {
  className?: string;
  onPlanSelect?: (planId: number, interval: 'monthly' | 'annual') => void;
  hideCurrentPlan?: boolean;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  className = '',
  onPlanSelect,
  hideCurrentPlan = false,
}) => {
  const [, setLocation] = useLocation();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');
  
  // Get current subscription
  const { hasActiveSubscription, plan: currentPlan, isLoading: isSubscriptionLoading } = useSubscription();
  
  // Fetch subscription plans
  const { data: plans, isLoading: isPlansLoading } = useQuery({
    queryKey: ['/api/stripe/subscription-plans'],
    queryFn: getSubscriptionPlans
  });

  // Handle plan selection
  const handleSelectPlan = (planId: number) => {
    if (onPlanSelect) {
      onPlanSelect(planId, billingInterval);
    } else {
      setLocation(`/subscription-checkout/${planId}/${billingInterval}`);
    }
  };

  // Loading state
  if (isPlansLoading || isSubscriptionLoading) {
    return (
      <div className={`grid gap-6 ${className}`}>
        <div className="flex items-center justify-center space-x-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader>
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="flex-grow">
                <Skeleton className="h-10 w-full mb-6" />
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // No plans found
  if (!plans || plans.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>No subscription plans are currently available.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Filter active plans and sort by price (lowest to highest)
  const activePlans = plans
    .filter(p => p.isActive !== false)
    .filter(p => !hideCurrentPlan || p.id !== currentPlan?.id)
    .sort((a, b) => {
      const priceA = billingInterval === 'annual' 
        ? parsePriceString(a.annualPrice) / 12 
        : parsePriceString(a.monthlyPrice);
      
      const priceB = billingInterval === 'annual' 
        ? parsePriceString(b.annualPrice) / 12 
        : parsePriceString(b.monthlyPrice);
      
      return priceA - priceB;
    });

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Billing interval toggle */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="text-xl font-semibold">Choose Your Plan</div>
        <div className="flex items-center space-x-4">
          <span className={billingInterval === 'monthly' ? 'font-medium' : 'text-muted-foreground'}>
            Monthly
          </span>
          <div className="relative flex items-center">
            <Switch
              checked={billingInterval === 'annual'}
              onCheckedChange={(checked) => setBillingInterval(checked ? 'annual' : 'monthly')}
              id="billing-toggle"
            />
            <Label htmlFor="billing-toggle" className="sr-only">
              Toggle billing interval
            </Label>
            {billingInterval === 'annual' && (
              <Badge variant="secondary" className="absolute -right-16 ml-2 flex items-center gap-1">
                <Zap className="h-3 w-3" /> Save 20%
              </Badge>
            )}
          </div>
          <span className={billingInterval === 'annual' ? 'font-medium' : 'text-muted-foreground'}>
            Annual
          </span>
        </div>
      </div>

      {/* Subscription plans grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {activePlans.map((plan) => {
          const price = billingInterval === 'annual' ? plan.annualPrice : plan.monthlyPrice;
          const isCurrentPlan = currentPlan?.id === plan.id;
          
          return (
            <Card 
              key={plan.id} 
              className={`flex flex-col ${plan.isPopular ? 'border-primary' : ''} ${isCurrentPlan ? 'bg-muted' : ''}`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription className="mt-1">{plan.description}</CardDescription>
                  </div>
                  {plan.isPopular && (
                    <Badge>Popular</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-6">
                  <span className="text-3xl font-bold">{price}</span>
                  {billingInterval === 'monthly' && (
                    <span className="text-muted-foreground ml-1">/ month</span>
                  )}
                  {billingInterval === 'annual' && (
                    <span className="text-muted-foreground ml-1">/ year</span>
                  )}
                </div>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isCurrentPlan ? (
                  <Button disabled className="w-full">
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleSelectPlan(plan.id)} 
                    className="w-full"
                    variant={plan.isPopular ? 'default' : 'outline'}
                  >
                    {hasActiveSubscription ? 'Change Plan' : 'Subscribe'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
        
        {/* Enterprise plan */}
        {plans.some(p => p.isEnterprise) && (
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>Custom solutions for larger organizations</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mb-6">
                <span className="text-3xl font-bold">Custom</span>
                <span className="text-muted-foreground ml-1">pricing</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>All features from Premium plan</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Dedicated support team</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Custom SLA and uptime guarantees</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>On-premises deployment options</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setLocation('/contact')}>
                Contact Sales
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

// Helper function to parse price string to number
function parsePriceString(price: string): number {
  // Remove currency symbol and commas, then parse as float
  const numericString = price.replace(/[^0-9.]/g, '');
  return parseFloat(numericString) || 0;
}

export default SubscriptionPlans;