import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, CheckCircle, ArrowRight, Calendar, CalendarClock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from 'react-i18next';

// Define types for subscription plans
interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: string;
  interval: 'month' | 'year';
  features: string[];
  isActive: boolean;
  stripePriceId: string;
}

interface PlansResponse {
  success: boolean;
  data: SubscriptionPlan[];
}

const SubscriptionPlans: React.FC = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  
  // Fetch subscription plans data
  const { data: plansData, isLoading, error } = useQuery<PlansResponse>({
    queryKey: ['/api/subscriptions/plans'],
    refetchOnWindowFocus: false,
  });

  // Handle subscription
  const handleSubscribe = (planId: number) => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login with return URL
      setLocation(`/login?redirect=/subscriptions/checkout?planId=${planId}`);
      return;
    }
    
    // If user is logged in, go to checkout
    setLocation(`/subscriptions/checkout?planId=${planId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-center mb-8">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex flex-col h-full">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-7 w-1/2" />
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="mt-6 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
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

  if (error) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-bold text-red-500">Error Loading Plans</h3>
        <p className="mt-2">Failed to fetch subscription plans. Please try again later.</p>
      </div>
    );
  }

  const allPlans = plansData?.data || [];

  if (allPlans.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-medium">No Plans Available</h3>
        <p className="mt-2 text-muted-foreground">Subscription plans are currently unavailable. Please check back later.</p>
      </div>
    );
  }

  // Get monthly and yearly plans
  const plans = allPlans.filter((plan: SubscriptionPlan) => 
    plan.interval === billingInterval
  );

  // Define popular plan based on tier
  const popularPlanName = billingInterval === 'month' ? 'Professional' : 'Professional Annual';
  
  // Sort plans by price
  const sortedPlans = [...plans].sort((a, b) => 
    parseFloat(a.price) - parseFloat(b.price)
  );

  const calculateSavings = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyCostForYear = monthlyPrice * 12;
    const savings = monthlyCostForYear - yearlyPrice;
    const savingsPercentage = Math.round((savings / monthlyCostForYear) * 100);
    return savingsPercentage;
  };

  // Find equivalent monthly plans to show savings for annual plans
  const getSavingsText = (plan: SubscriptionPlan) => {
    if (billingInterval === 'year') {
      const monthlyEquivalent = allPlans.find((p: SubscriptionPlan) => 
        p.interval === 'month' && p.name.replace(' Annual', '') === plan.name.replace(' Annual', '')
      );
      
      if (monthlyEquivalent) {
        const savings = calculateSavings(
          parseFloat(monthlyEquivalent.price), 
          parseFloat(plan.price)
        );
        return `Save ${savings}% with annual billing`;
      }
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-center items-center space-x-2 mb-8">
        <Label htmlFor="billing-toggle" className="cursor-pointer">Monthly</Label>
        <Switch
          id="billing-toggle"
          checked={billingInterval === 'year'}
          onCheckedChange={(checked) => setBillingInterval(checked ? 'year' : 'month')}
        />
        <div className="flex items-center space-x-1">
          <Label htmlFor="billing-toggle" className="cursor-pointer">Annual</Label>
          <Badge variant="outline" className="font-normal text-xs bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400">
            Save up to 16%
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sortedPlans.map((plan: SubscriptionPlan) => {
          const isPopular = plan.name === popularPlanName || plan.name.includes(popularPlanName);
          const savingsText = getSavingsText(plan);
          
          return (
            <Card 
              key={plan.id} 
              className={`flex flex-col h-full transition-all duration-300 hover:shadow-lg
                ${isPopular ? 'border-primary border-2 relative' : 'border-opacity-50'}
              `}
            >
              {isPopular && (
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-3">
                  <Badge className="bg-primary text-white shadow-md">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name.replace(' Annual', '')}</CardTitle>
                <CardDescription className="flex items-baseline mt-2">
                  <span className="text-3xl font-bold text-primary">${parseFloat(plan.price).toFixed(2)}</span>
                  <span className="ml-1 text-sm text-muted-foreground">
                    /{billingInterval === 'month' ? 'mo' : 'yr'}
                  </span>
                </CardDescription>
                {savingsText && (
                  <span className="mt-1 text-xs font-medium text-green-600 dark:text-green-400 flex items-center">
                    <CalendarClock className="mr-1 h-3 w-3" />
                    {savingsText}
                  </span>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                <div className="space-y-3">
                  {plan.features?.map((feature: string, i: number) => (
                    <div key={i} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mr-2" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleSubscribe(plan.id)} 
                  className="w-full group"
                  variant={isPopular ? "default" : "outline"}
                >
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-0 group-hover:w-4 transition-all" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPlans;