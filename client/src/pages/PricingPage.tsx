import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSubscriptionPlans, SubscriptionPlan } from '@/utils/stripe';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Crown, Rocket, Star, HelpCircle, Zap, X, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MainLayout from '@/layouts/MainLayout';
import { trackEvent } from '@/lib/analytics';

// Helper function to parse price string to number
function parsePriceString(price: string): number {
  // Remove currency symbol and commas, then parse as float
  const numericString = price.replace(/[^0-9.]/g, '');
  return parseFloat(numericString) || 0;
}

// Plan type definitions
type PlanTier = 'free' | 'basic' | 'pro' | 'enterprise';

// Feature comparison definition
interface FeatureComparison {
  name: string;
  description?: string;
  tiers: {
    free: boolean | string;
    basic: boolean | string;
    pro: boolean | string;
    enterprise: boolean | string;
  };
}

const PricingPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  
  // Get current subscription
  const { hasActiveSubscription, plan: currentPlan, isLoading: isSubscriptionLoading } = useSubscription();
  
  // Fetch subscription plans
  const { data: plans, isLoading: isPlansLoading } = useQuery({
    queryKey: ['/api/stripe/subscription-plans'],
    queryFn: getSubscriptionPlans
  });

  // Track page view 
  React.useEffect(() => {
    trackEvent('view_pricing_page');
  }, []);

  // Handle selecting a plan
  const handleSelectPlan = (planId: number) => {
    trackEvent('select_plan', 'pricing', `plan_id_${planId}_${billingInterval}`);
    setLocation(`/subscription-checkout/${planId}/${billingInterval}`);
  };

  // Feature comparison data for the plan tiers
  const featureComparisons: FeatureComparison[] = [
    {
      name: "AI Courses Access",
      description: "Access to our library of AI training courses",
      tiers: {
        free: "2 courses only",
        basic: "5 credits/month",
        pro: "Unlimited",
        enterprise: "Unlimited"
      }
    },
    {
      name: "Tool Usage",
      description: "Access to AI-powered design and development tools",
      tiers: {
        free: "3 uses/day",
        basic: "5 API calls/day",
        pro: "Unlimited",
        enterprise: "Unlimited"
      }
    },
    {
      name: "Web Development Projects",
      description: "Access to web development project templates and resources",
      tiers: {
        free: "Preview only",
        basic: "Sample projects only",
        pro: true,
        enterprise: true
      }
    },
    {
      name: "Development Services Discount",
      description: "Discount on custom development services",
      tiers: {
        free: false,
        basic: false,
        pro: "10% discount",
        enterprise: "20% discount"
      }
    },
    {
      name: "Support",
      description: "Customer and technical support",
      tiers: {
        free: "Community support",
        basic: "Email support",
        pro: "Priority email support",
        enterprise: "24/7 priority support"
      }
    },
    {
      name: "Personalized Coaching",
      description: "One-on-one coaching sessions with experts",
      tiers: {
        free: false,
        basic: false,
        pro: false,
        enterprise: true
      }
    },
    {
      name: "Dedicated Account Manager",
      description: "Personal account manager for your organization",
      tiers: {
        free: false,
        basic: false,
        pro: false,
        enterprise: true
      }
    },
    {
      name: "Custom Development Projects",
      description: "Custom development services for enterprise needs",
      tiers: {
        free: false,
        basic: false,
        pro: false,
        enterprise: true
      }
    },
    {
      name: "White-Label Solutions",
      description: "Rebrand our tools with your own branding",
      tiers: {
        free: false,
        basic: false,
        pro: false, 
        enterprise: true
      }
    },
    {
      name: "Team Collaboration Tools",
      description: "Tools for team collaboration and management",
      tiers: {
        free: false,
        basic: false,
        pro: false,
        enterprise: true
      }
    },
    {
      name: "Community Forum Access",
      description: "Access to our community forum for discussions and support",
      tiers: {
        free: true,
        basic: true,
        pro: true,
        enterprise: true
      }
    },
    {
      name: "Analytics Dashboard",
      description: "Track your progress and performance metrics",
      tiers: {
        free: "Basic metrics",
        basic: "Standard metrics",
        pro: "Advanced analytics",
        enterprise: "Custom reports"
      }
    }
  ];

  // Loading state
  if (isPlansLoading || isSubscriptionLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center">
            <Skeleton className="h-12 w-56 mx-auto mb-4" />
            <Skeleton className="h-6 w-[500px] max-w-full mx-auto" />
          </div>
          
          <div className="flex justify-center">
            <Skeleton className="h-10 w-60" />
          </div>
          
          <div className="grid gap-10 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  // Find the plans for the pricing page
  const freePlan = {
    id: 0,
    name: 'Free',
    price: '0',
    interval: 'month'
  };
  
  const basicPlan = plans?.find(p => 
    p.name === (billingInterval === 'annual' ? 'Basic Annual' : 'Basic')
  );
  
  const proPlan = plans?.find(p => 
    p.name === (billingInterval === 'annual' ? 'Pro Annual' : 'Pro')
  );
  
  const enterprisePlan = plans?.find(p => 
    p.name === (billingInterval === 'annual' ? 'Enterprise Annual' : 'Enterprise')
  );

  return (
    <MainLayout>
      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">
            Subscription Plans
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the perfect plan for your needs. Upgrade or downgrade at any time.
          </p>
        </div>
        
        {/* Billing toggle */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center justify-center space-x-4 bg-card px-4 py-2 rounded-full shadow-sm">
            <span className={`text-sm font-medium transition-colors ${billingInterval === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <div className="relative flex items-center">
              <Switch
                id="billing-toggle"
                checked={billingInterval === 'annual'}
                onCheckedChange={(checked) => {
                  setBillingInterval(checked ? 'annual' : 'monthly');
                  trackEvent('toggle_billing_interval', 'pricing', checked ? 'annual' : 'monthly');
                }}
              />
            </div>
            <span className={`text-sm font-medium transition-colors ${billingInterval === 'annual' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual <Badge variant="outline" className="ml-1 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">Save 15%</Badge>
            </span>
          </div>
        </div>
        
        {/* Plan cards */}
        <div className="grid gap-10 md:grid-cols-4">
          {/* Free plan */}
          <Card className="border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-gray-500" />
                Free
              </CardTitle>
              <div className="mt-4 flex items-baseline text-gray-900 dark:text-gray-50">
                <span className="text-5xl font-extrabold tracking-tight">
                  $0
                </span>
                <span className="ml-1 text-xl font-semibold">
                  /forever
                </span>
              </div>
              <CardDescription className="mt-2">
                No credit card required
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="ml-2 text-sm">Access to 2 AI courses</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="ml-2 text-sm">Basic tool usage (3 uses/day)</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="ml-2 text-sm">Preview web development projects</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="ml-2 text-sm">Community forum access</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="ml-2 text-sm">Basic analytics</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button 
                className="w-full bg-gray-600 hover:bg-gray-700 text-white" 
                onClick={() => setLocation('/register')}
              >
                Get Started
              </Button>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Try RXAI features with no commitment
              </p>
            </CardFooter>
          </Card>
          
          {/* Basic plan */}
          <Card className="border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Rocket className="h-5 w-5 mr-2 text-blue-500" />
                Basic
              </CardTitle>
              <div className="mt-4 flex items-baseline text-gray-900 dark:text-gray-50">
                <span className="text-5xl font-extrabold tracking-tight">
                  ${billingInterval === 'annual' ? '16' : '19'}
                </span>
                <span className="ml-1 text-xl font-semibold">
                  /{billingInterval === 'annual' ? 'mo' : 'month'}
                </span>
              </div>
              <CardDescription className="mt-2">
                {billingInterval === 'annual' ? 'Billed annually ($193.80/year)' : 'Billed monthly'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="ml-2 text-sm">5 AI course credits per month</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="ml-2 text-sm">Limited tool usage (5 API calls/day)</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="ml-2 text-sm">Sample web development projects</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="ml-2 text-sm">Email support</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="ml-2 text-sm">Community forum access</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                onClick={() => basicPlan && handleSelectPlan(basicPlan.id)}
              >
                {hasActiveSubscription && currentPlan?.id === basicPlan?.id 
                  ? 'Current Plan'
                  : 'Start 7-day Free Trial'}
              </Button>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                No credit card required for trial. Cancel anytime.
              </p>
            </CardFooter>
          </Card>
          
          {/* Pro plan */}
          <Card className="relative border-2 border-purple-500 dark:border-purple-600 shadow-lg ring-1 ring-purple-500/20 dark:ring-purple-600/20 transition-all duration-200 hover:shadow-xl">
            <div className="absolute -top-4 left-0 right-0 mx-auto w-40 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1 text-sm font-semibold text-white text-center shadow-md">
              Most Popular
            </div>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-purple-500" />
                Pro
              </CardTitle>
              <div className="mt-4 flex items-baseline text-gray-900 dark:text-gray-50">
                <span className="text-5xl font-extrabold tracking-tight">
                  ${billingInterval === 'annual' ? '42' : '49'}
                </span>
                <span className="ml-1 text-xl font-semibold">
                  /{billingInterval === 'annual' ? 'mo' : 'month'}
                </span>
              </div>
              <CardDescription className="mt-2">
                {billingInterval === 'annual' ? 'Billed annually ($499.80/year)' : 'Billed monthly'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="ml-2 text-sm">Unlimited AI course access</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="ml-2 text-sm">Unlimited tool usage</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="ml-2 text-sm">10% discount on development services</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="ml-2 text-sm">Priority email support</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="ml-2 text-sm">Advanced analytics dashboard</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="ml-2 text-sm">Premium templates library</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white" 
                onClick={() => proPlan && handleSelectPlan(proPlan.id)}
              >
                {hasActiveSubscription && currentPlan?.id === proPlan?.id 
                  ? 'Current Plan'
                  : 'Start 7-day Free Trial'}
              </Button>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                No credit card required for trial. Cancel anytime.
              </p>
            </CardFooter>
          </Card>
          
          {/* Enterprise plan */}
          <Card className="border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="h-5 w-5 mr-2 text-amber-500" />
                Enterprise
              </CardTitle>
              <div className="mt-4 flex items-baseline text-gray-900 dark:text-gray-50">
                <span className="text-5xl font-extrabold tracking-tight">
                  ${billingInterval === 'annual' ? '169' : '199'}
                </span>
                <span className="ml-1 text-xl font-semibold">
                  /{billingInterval === 'annual' ? 'mo' : 'month'}
                </span>
              </div>
              <CardDescription className="mt-2">
                {billingInterval === 'annual' ? 'Billed annually ($2,029.80/year)' : 'Billed monthly'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="ml-2 text-sm">All Pro features</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="ml-2 text-sm">Personalized coaching sessions</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="ml-2 text-sm">Priority 24/7 support</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="ml-2 text-sm">Dedicated account manager</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="ml-2 text-sm">Custom development projects</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="ml-2 text-sm">White-label solutions</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button 
                className="w-full bg-amber-600 hover:bg-amber-700 text-white" 
                onClick={() => enterprisePlan && handleSelectPlan(enterprisePlan.id)}
              >
                {hasActiveSubscription && currentPlan?.id === enterprisePlan?.id 
                  ? 'Current Plan'
                  : 'Start 7-day Free Trial'}
              </Button>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                No credit card required for trial. Cancel anytime.
              </p>
            </CardFooter>
          </Card>
        </div>
        
        {/* Feature comparison table */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-10">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                    <div className="flex items-center justify-center">
                      <Zap className="h-4 w-4 mr-1 text-gray-500" />
                      Free
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                    <div className="flex items-center justify-center">
                      <Rocket className="h-4 w-4 mr-1 text-blue-500" />
                      Basic
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                    <div className="flex items-center justify-center">
                      <Star className="h-4 w-4 mr-1 text-purple-500" />
                      Pro
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                    <div className="flex items-center justify-center">
                      <Crown className="h-4 w-4 mr-1 text-amber-500" />
                      Enterprise
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted">
                {featureComparisons.map((feature, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center">
                        <span>{feature.name}</span>
                        {feature.description && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{feature.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      {feature.tiers.free === true ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : feature.tiers.free === false ? (
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      ) : (
                        <span>{feature.tiers.free}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      {feature.tiers.basic === true ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : feature.tiers.basic === false ? (
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      ) : (
                        <span>{feature.tiers.basic}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      {feature.tiers.pro === true ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : feature.tiers.pro === false ? (
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      ) : (
                        <span>{feature.tiers.pro}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      {feature.tiers.enterprise === true ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : feature.tiers.enterprise === false ? (
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      ) : (
                        <span>{feature.tiers.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* FAQ and cancellation information */}
        <div className="bg-muted/30 rounded-lg p-6 mt-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Flexible Cancellation Policy</h3>
          <p className="text-sm text-muted-foreground">
            All plans come with a 7-day free trial. You can cancel at any time during your trial period
            and you won't be charged. After the trial period, you can still cancel anytime - we prorate
            remaining days and provide partial refunds for annual plans.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default PricingPage;