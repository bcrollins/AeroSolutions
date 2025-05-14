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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Crown, Rocket, Star, Zap, Users, Shield, Sparkles, BarChart3, Code, BookOpen, Palette, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

interface SubscriptionPlansProps {
  className?: string;
  onPlanSelect?: (planId: number, interval: 'monthly' | 'annual') => void;
  hideCurrentPlan?: boolean;
}

// Plan category type for tabs
type PlanCategory = 'design' | 'courses' | 'tools' | 'webdev' | 'all';

// Helper function to parse price string to number
function parsePriceString(price: string): number {
  // Remove currency symbol and commas, then parse as float
  const numericString = price.replace(/[^0-9.]/g, '');
  return parseFloat(numericString) || 0;
}

// Get category by plan name
const getPlanCategory = (planName: string): PlanCategory => {
  const name = planName.toLowerCase();
  if (name.includes('courses')) return 'courses';
  if (name.includes('tools')) return 'tools';
  if (name.includes('web dev')) return 'webdev';
  return 'design'; // Default category for original plans
};

// Get icon by plan name
const getPlanIcon = (planName: string) => {
  const name = planName.toLowerCase();
  
  // Design plans
  if (name.includes('starter') && !name.includes('courses') && !name.includes('tools') && !name.includes('web dev')) 
    return <Rocket className="h-6 w-6 text-blue-500" />;
  if (name.includes('professional') && !name.includes('courses') && !name.includes('tools') && !name.includes('web dev')) 
    return <Star className="h-6 w-6 text-purple-500" />;
  if (name.includes('enterprise') && !name.includes('courses') && !name.includes('tools') && !name.includes('web dev')) 
    return <Crown className="h-6 w-6 text-amber-500" />;
  
  // AI Courses plans
  if (name.includes('courses starter')) return <BookOpen className="h-6 w-6 text-emerald-500" />;
  if (name.includes('courses pro')) return <BookOpen className="h-6 w-6 text-indigo-500" />;
  if (name.includes('courses enterprise')) return <BookOpen className="h-6 w-6 text-amber-500" />;
  
  // Digital Tools plans
  if (name.includes('tools basic')) return <Palette className="h-6 w-6 text-cyan-500" />;
  if (name.includes('tools premium')) return <Palette className="h-6 w-6 text-violet-500" />;
  if (name.includes('tools agency')) return <Palette className="h-6 w-6 text-amber-500" />;
  
  // Web Dev plans
  if (name.includes('web dev standard')) return <Code className="h-6 w-6 text-teal-500" />;
  if (name.includes('web dev business')) return <Code className="h-6 w-6 text-fuchsia-500" />;
  if (name.includes('web dev enterprise')) return <Code className="h-6 w-6 text-amber-500" />;
  
  return <Sparkles className="h-6 w-6 text-teal-500" />;
};

// Map to determine which plans are popular or recommended
const planAttributes = {
  // Original plans
  'Professional': { isPopular: true, recommended: false },
  'Professional Annual': { isPopular: true, recommended: true },
  'Enterprise': { isPopular: false, recommended: false },
  'Enterprise Annual': { isPopular: false, recommended: false },
  
  // AI Courses plans
  'AI Courses Pro': { isPopular: true, recommended: false },
  'AI Courses Pro Annual': { isPopular: true, recommended: true },
  
  // Digital Tools plans
  'Digital Tools Premium': { isPopular: true, recommended: false },
  'Digital Tools Premium Annual': { isPopular: true, recommended: true },
  
  // Web Dev plans
  'Web Dev Business': { isPopular: true, recommended: false },
  'Web Dev Business Annual': { isPopular: true, recommended: true },
};

// Feature icons map
const featureIcons: Record<string, React.ReactNode> = {
  // Design features
  "Basic design tools": <Sparkles className="h-4 w-4 text-blue-500" />,
  "Advanced design tools": <Sparkles className="h-4 w-4 text-purple-500" />,
  "Team collaboration": <Users className="h-4 w-4 text-indigo-500" />,
  "Priority support": <Shield className="h-4 w-4 text-teal-500" />,
  "Analytics dashboard": <BarChart3 className="h-4 w-4 text-orange-500" />,
  
  // AI Courses features
  "5 AI course credits per month": <BookOpen className="h-4 w-4 text-emerald-500" />,
  "15 AI course credits per month": <BookOpen className="h-4 w-4 text-indigo-500" />,
  "Unlimited AI course credits": <BookOpen className="h-4 w-4 text-amber-500" />,
  
  // Digital Tools features
  "5 AI content generations daily": <Palette className="h-4 w-4 text-cyan-500" />,
  "Unlimited AI content generations": <Palette className="h-4 w-4 text-violet-500" />,
  
  // Web Dev features
  "Single website management": <Layers className="h-4 w-4 text-teal-500" />,
  "3 website management": <Layers className="h-4 w-4 text-fuchsia-500" />,
  "Unlimited website management": <Layers className="h-4 w-4 text-amber-500" />,
};

// Gradient backgrounds for each plan category
const getPlanGradient = (planName: string) => {
  const name = planName.toLowerCase();
  
  // Design plans
  if ((name.includes('starter') || name.includes('professional') || name.includes('enterprise')) && 
      !name.includes('courses') && !name.includes('tools') && !name.includes('web dev')) {
    if (name.includes('starter')) return 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30';
    if (name.includes('professional')) return 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30';
    if (name.includes('enterprise')) return 'bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-950/30 dark:to-yellow-950/30';
  }
  
  // AI Courses plans
  if (name.includes('courses')) {
    if (name.includes('starter')) return 'bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/30 dark:to-teal-950/30';
    if (name.includes('pro')) return 'bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-950/30 dark:to-blue-950/30';
    if (name.includes('enterprise')) return 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30';
  }
  
  // Digital Tools plans
  if (name.includes('tools')) {
    if (name.includes('basic')) return 'bg-gradient-to-br from-cyan-100 to-sky-100 dark:from-cyan-950/30 dark:to-sky-950/30';
    if (name.includes('premium')) return 'bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-950/30 dark:to-purple-950/30';
    if (name.includes('agency')) return 'bg-gradient-to-br from-amber-100 to-red-100 dark:from-amber-950/30 dark:to-red-950/30';
  }
  
  // Web Dev plans
  if (name.includes('web dev')) {
    if (name.includes('standard')) return 'bg-gradient-to-br from-teal-100 to-green-100 dark:from-teal-950/30 dark:to-green-950/30';
    if (name.includes('business')) return 'bg-gradient-to-br from-fuchsia-100 to-pink-100 dark:from-fuchsia-950/30 dark:to-pink-950/30';
    if (name.includes('enterprise')) return 'bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-950/30 dark:to-yellow-950/30';
  }
  
  return 'bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-950/30 dark:to-slate-950/30';
};

// Helper function to get card accent color
const getAccentColor = (planName: string) => {
  const name = planName.toLowerCase();
  
  // Design plans
  if ((name.includes('starter') || name.includes('professional') || name.includes('enterprise')) && 
      !name.includes('courses') && !name.includes('tools') && !name.includes('web dev')) {
    if (name.includes('starter')) return 'border-blue-400 dark:border-blue-600';
    if (name.includes('professional')) return 'border-purple-400 dark:border-purple-600';
    if (name.includes('enterprise')) return 'border-amber-400 dark:border-amber-600';
  }
  
  // AI Courses plans
  if (name.includes('courses')) {
    if (name.includes('starter')) return 'border-emerald-400 dark:border-emerald-600';
    if (name.includes('pro')) return 'border-indigo-400 dark:border-indigo-600';
    if (name.includes('enterprise')) return 'border-amber-400 dark:border-amber-600';
  }
  
  // Digital Tools plans
  if (name.includes('tools')) {
    if (name.includes('basic')) return 'border-cyan-400 dark:border-cyan-600';
    if (name.includes('premium')) return 'border-violet-400 dark:border-violet-600';
    if (name.includes('agency')) return 'border-amber-400 dark:border-amber-600';
  }
  
  // Web Dev plans
  if (name.includes('web dev')) {
    if (name.includes('standard')) return 'border-teal-400 dark:border-teal-600';
    if (name.includes('business')) return 'border-fuchsia-400 dark:border-fuchsia-600';
    if (name.includes('enterprise')) return 'border-amber-400 dark:border-amber-600';
  }
  
  return 'border-teal-400 dark:border-teal-600';
};

// Helper function to get button color
const getButtonColor = (planName: string, isPopular: boolean) => {
  const name = planName.toLowerCase();
  
  if (isPopular) return 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700';
  
  // Design plans
  if ((name.includes('starter') || name.includes('professional') || name.includes('enterprise')) && 
      !name.includes('courses') && !name.includes('tools') && !name.includes('web dev')) {
    if (name.includes('starter')) return 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600';
    if (name.includes('enterprise')) return 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600';
  }
  
  // AI Courses plans
  if (name.includes('courses')) {
    if (name.includes('starter')) return 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600';
    if (name.includes('enterprise')) return 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600';
  }
  
  // Digital Tools plans
  if (name.includes('tools')) {
    if (name.includes('basic')) return 'bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600';
    if (name.includes('agency')) return 'bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600';
  }
  
  // Web Dev plans
  if (name.includes('web dev')) {
    if (name.includes('standard')) return 'bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600';
    if (name.includes('enterprise')) return 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600';
  }
  
  return 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600';
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
    <div className={`space-y-12 ${className} container mx-auto px-6 md:px-8 py-16`}>
      {/* Hero section with formatting box */}
      <div className="text-center max-w-3xl mx-auto mb-12 bg-gray-100 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 shadow-md border border-gray-200 dark:border-gray-700">
        <motion.h1 
          className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Subscription Plans
        </motion.h1>
        
        {/* Billing interval toggle */}
        <motion.div 
          className="flex items-center justify-center space-x-6 bg-white dark:bg-slate-700/50 px-6 py-4 rounded-full shadow-sm max-w-md mx-auto"
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
      <div className="bg-gray-100 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 max-w-6xl mx-auto">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
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
                  className={`flex flex-col h-full overflow-hidden ${gradient} border-2 shadow-md transition-all duration-300 hover:shadow-xl ${plan.isPopular || plan.isRecommended ? accent : 'border-gray-300'}`}
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
      </div>
      
      {/* Testimonials section */}
      <div className="mt-16 max-w-5xl mx-auto px-6">
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
      <div className="mt-16 max-w-4xl mx-auto px-6">
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
            <h3 className="text-lg font-semibold mb-2">Is there a free trial available?</h3>
            <p className="text-sm text-muted-foreground">Yes, we offer a 14-day free trial on all our subscription plans. You can try out all the features without any commitment, and no credit card is required to start your trial.</p>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <motion.div 
        className="mt-16 max-w-3xl mx-auto text-center px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Design Workflow?</h2>
        <p className="text-muted-foreground mb-8">Join thousands of designers and teams who are already using our platform to create amazing designs.</p>
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

export default SubscriptionPlans;