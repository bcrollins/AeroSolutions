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
import { Check, Crown, Rocket, Star, Zap, Users, Shield, Sparkles, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SubscriptionPlansProps {
  className?: string;
  onPlanSelect?: (planId: number, interval: 'monthly' | 'annual') => void;
  hideCurrentPlan?: boolean;
}

// Get icon by plan name
const getPlanIcon = (planName: string) => {
  const name = planName.toLowerCase();
  if (name.includes('starter')) return <Rocket className="h-6 w-6 text-blue-500" />;
  if (name.includes('professional')) return <Star className="h-6 w-6 text-purple-500" />;
  if (name.includes('enterprise')) return <Crown className="h-6 w-6 text-amber-500" />;
  return <Sparkles className="h-6 w-6 text-teal-500" />;
};

// Map to determine which plans are popular or recommended
const planAttributes = {
  'Professional': { isPopular: true, recommended: false },
  'Professional Annual': { isPopular: true, recommended: true },
  'Enterprise': { isPopular: false, recommended: false },
  'Enterprise Annual': { isPopular: false, recommended: false },
};

// Feature icons map
const featureIcons: Record<string, React.ReactNode> = {
  "Basic design tools": <Sparkles className="h-4 w-4 text-blue-500" />,
  "Advanced design tools": <Sparkles className="h-4 w-4 text-purple-500" />,
  "Team collaboration": <Users className="h-4 w-4 text-indigo-500" />,
  "Priority support": <Shield className="h-4 w-4 text-teal-500" />,
  "Analytics dashboard": <BarChart3 className="h-4 w-4 text-orange-500" />,
};

// Gradient backgrounds for each plan
const planGradients = {
  'Starter': 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
  'Starter Annual': 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
  'Professional': 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30',
  'Professional Annual': 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30',
  'Enterprise': 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30',
  'Enterprise Annual': 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30',
};

// Helper function to get card accent color
const getAccentColor = (planName: string) => {
  const name = planName.toLowerCase();
  if (name.includes('starter')) return 'border-blue-400 dark:border-blue-600';
  if (name.includes('professional')) return 'border-purple-400 dark:border-purple-600';
  if (name.includes('enterprise')) return 'border-amber-400 dark:border-amber-600';
  return 'border-teal-400 dark:border-teal-600';
};

// Helper function to get button color
const getButtonColor = (planName: string, isPopular: boolean) => {
  const name = planName.toLowerCase();
  if (isPopular) return 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700';
  if (name.includes('starter')) return 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600';
  if (name.includes('enterprise')) return 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600';
  return '';
};

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

  // Mark popular and recommended plans
  const enhancedPlans = plans.map(plan => ({
    ...plan,
    isPopular: planAttributes[plan.name as keyof typeof planAttributes]?.isPopular || false,
    isRecommended: planAttributes[plan.name as keyof typeof planAttributes]?.recommended || false
  }));

  // Filter active plans and sort by price (lowest to highest)
  const activePlans = enhancedPlans
    .filter(p => p.isActive !== false)
    .filter(p => !hideCurrentPlan || p.id !== currentPlan?.id)
    // Filter by interval
    .filter(p => p.interval === (billingInterval === 'annual' ? 'year' : 'month'))
    .sort((a, b) => {
      const priceA = parsePriceString(a.price || '0');
      const priceB = parsePriceString(b.price || '0');
      
      return priceA - priceB;
    });

  return (
    <div className={`space-y-12 ${className} px-4 py-8`}>
      {/* Hero section */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <motion.h1 
          className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Discover Your Perfect Plan
        </motion.h1>
        <motion.p 
          className="text-xl text-muted-foreground mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Unlock premium features and maximize your productivity with our flexible subscription options.
        </motion.p>
        
        {/* Billing interval toggle */}
        <motion.div 
          className="flex items-center justify-center space-x-6 bg-muted px-6 py-4 rounded-full shadow-sm max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <span className={`text-base font-medium transition-colors ${billingInterval === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <div className="relative flex items-center">
            <Switch
              checked={billingInterval === 'annual'}
              onCheckedChange={(checked) => setBillingInterval(checked ? 'annual' : 'monthly')}
              id="billing-toggle"
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-blue-600"
            />
            <Label htmlFor="billing-toggle" className="sr-only">
              Toggle billing interval
            </Label>
            <div className="absolute -right-2 top-[-24px] transform translate-x-full">
              {billingInterval === 'annual' && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium py-1 animate-pulse">
                  <Zap className="h-3 w-3 mr-1" /> Save 20%
                </Badge>
              )}
            </div>
          </div>
          <span className={`text-base font-medium transition-colors ${billingInterval === 'annual' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Annual
          </span>
        </motion.div>
      </div>

      {/* Subscription plans grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 max-w-7xl mx-auto">
        {activePlans.map((plan, index) => {
          const price = plan.price || '$0.00';
          const isCurrentPlan = currentPlan?.id === plan.id;
          const accent = getAccentColor(plan.name);
          const gradient = planGradients[plan.name as keyof typeof planGradients] || '';
          const buttonGradient = getButtonColor(plan.name, plan.isPopular);
          
          // Set up animations with staggered delay based on index
          const animationDelay = 0.2 + (index * 0.1);
          
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: animationDelay }}
              className={plan.isRecommended ? 'lg:col-span-1 lg:row-span-1 lg:transform lg:scale-105 z-10' : ''}
            >
              <Card 
                className={`flex flex-col h-full overflow-hidden ${gradient} border-2 transition-all duration-300 hover:shadow-lg ${plan.isPopular || plan.isRecommended ? accent : ''}`}
              >
                {(plan.isPopular || plan.isRecommended) && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-4 py-1 transform rotate-45 translate-x-[30%] translate-y-[100%] shadow-md">
                      {plan.isRecommended ? 'BEST VALUE' : 'POPULAR'}
                    </div>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-center mb-2">
                    {getPlanIcon(plan.name)}
                    <CardTitle className="ml-2 text-2xl">{plan.name.replace(' Annual', '')}</CardTitle>
                  </div>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="flex-grow pb-6">
                  <div className="mb-6 flex items-baseline">
                    <span className="text-4xl font-bold">{price}</span>
                    <span className="text-muted-foreground ml-1 text-base">
                      / {billingInterval === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => {
                      const icon = featureIcons[feature] || <Check className="h-4 w-4 text-green-500" />;
                      return (
                        <motion.li 
                          key={idx} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: animationDelay + (idx * 0.05) }}
                          className="flex items-start"
                        >
                          <div className="mr-3 mt-1 flex-shrink-0">{icon}</div>
                          <span className="text-sm">{feature}</span>
                        </motion.li>
                      );
                    })}
                  </ul>
                </CardContent>
                
                <CardFooter className="pt-2 pb-6">
                  {isCurrentPlan ? (
                    <Button disabled className="w-full py-6 text-base font-medium">
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleSelectPlan(plan.id)} 
                      className={`w-full py-6 text-base font-medium transition-all duration-300 hover:shadow-md ${buttonGradient}`}
                    >
                      {hasActiveSubscription ? 'Change Plan' : 'Get Started'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      {/* Testimonials section */}
      <div className="mt-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10">What Our Customers Say</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <motion.div 
            className="bg-muted p-6 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center mb-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </div>
            <p className="text-sm mb-4">"The Professional plan has completely transformed our design workflow. The team collaboration features are worth every penny."</p>
            <p className="text-sm font-semibold">- Sarah Johnson, Design Director</p>
          </motion.div>
          
          <motion.div 
            className="bg-muted p-6 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center mb-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </div>
            <p className="text-sm mb-4">"The AI features in this platform save us countless hours every week. Upgrading to the Enterprise plan was the best decision our agency made this year."</p>
            <p className="text-sm font-semibold">- Michael Chen, Creative Director</p>
          </motion.div>
          
          <motion.div 
            className="bg-muted p-6 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="flex items-center mb-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </div>
            <p className="text-sm mb-4">"Even the Starter plan offers incredible value. As a freelancer, it's given me tools that help me compete with much larger design studios."</p>
            <p className="text-sm font-semibold">- Alex Rivera, Independent Designer</p>
          </motion.div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <motion.div 
            className="bg-muted p-6 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-2">Can I change plans later?</h3>
            <p className="text-sm text-muted-foreground">Yes, you can upgrade, downgrade, or cancel your subscription at any time. When you upgrade, you'll get immediate access to the new features. If you downgrade, you'll keep your current plan until the end of your billing period.</p>
          </motion.div>
          
          <motion.div 
            className="bg-muted p-6 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold mb-2">How do I cancel my subscription?</h3>
            <p className="text-sm text-muted-foreground">You can cancel your subscription at any time from your account settings. After cancellation, you'll still have access to your plan until the end of your current billing period.</p>
          </motion.div>
          
          <motion.div 
            className="bg-muted p-6 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold mb-2">Do you offer a free trial?</h3>
            <p className="text-sm text-muted-foreground">Yes, we offer a 14-day free trial with full access to the Professional plan. You won't be charged until the trial period ends, and you can cancel anytime before then.</p>
          </motion.div>
        </div>
      </div>
      
      {/* CTA Section */}
      <motion.div 
        className="mt-16 max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h2 className="text-2xl font-bold mb-6">Ready to transform your design workflow?</h2>
        <p className="text-muted-foreground mb-8">Join thousands of designers and teams who have already upgraded their creative process.</p>
        <Button 
          onClick={() => handleSelectPlan(2)} // Professional plan (assumed to be id 2)
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 text-lg font-medium"
        >
          Start Your Free Trial
        </Button>
        <p className="text-xs text-muted-foreground mt-4">No credit card required to start your trial.</p>
      </motion.div>
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