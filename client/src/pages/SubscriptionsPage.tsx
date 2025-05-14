import React from 'react';
import { Helmet } from 'react-helmet';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { useToast } from '@/hooks/use-toast';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: {
    monthly: number;
    annually: number;
  };
  description: string;
  features: PlanFeature[];
  highlight?: boolean;
  badge?: string;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: {
      monthly: 0,
      annually: 0,
    },
    description: 'Basic access to RXAI platform with limited features.',
    features: [
      { name: 'Access to Free Articles', included: true },
      { name: 'News Hub Access', included: true },
      { name: 'Community Forum (Read-Only)', included: true },
      { name: 'Basic AI Course Content', included: true },
      { name: 'Course Certificates', included: false },
      { name: 'AI Tools Access', included: false },
      { name: 'Content Calendar Creator', included: false },
      { name: 'Priority Support', included: false },
      { name: 'Custom Analytics', included: false },
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    price: {
      monthly: 19,
      annually: 16,
    },
    description: 'Perfect for individuals looking to explore AI and learn new skills.',
    badge: 'Popular',
    highlight: true,
    features: [
      { name: 'Access to Free Articles', included: true },
      { name: 'News Hub Access', included: true },
      { name: 'Community Forum (Full Access)', included: true },
      { name: 'Full AI Course Library', included: true },
      { name: 'Course Certificates', included: true },
      { name: 'Basic AI Tools Access', included: true },
      { name: 'Content Calendar Creator', included: false },
      { name: 'Priority Support', included: false },
      { name: 'Custom Analytics', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: {
      monthly: 49,
      annually: 39,
    },
    description: 'Ideal for professionals and small businesses leveraging AI solutions.',
    features: [
      { name: 'Access to Free Articles', included: true },
      { name: 'News Hub Access', included: true },
      { name: 'Community Forum (Full Access)', included: true },
      { name: 'Full AI Course Library', included: true },
      { name: 'Course Certificates', included: true },
      { name: 'Full AI Tools Suite', included: true },
      { name: 'Content Calendar Creator', included: true },
      { name: 'Priority Support', included: true },
      { name: 'Basic Analytics', included: true },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: {
      monthly: 199,
      annually: 179,
    },
    description: 'Complete solution for organizations requiring custom AI implementation.',
    features: [
      { name: 'Access to Free Articles', included: true },
      { name: 'News Hub Access', included: true },
      { name: 'Community Forum (Full Access)', included: true },
      { name: 'Full AI Course Library', included: true },
      { name: 'Course Certificates', included: true },
      { name: 'Full AI Tools Suite', included: true },
      { name: 'Content Calendar Creator', included: true },
      { name: 'Priority Support', included: true },
      { name: 'Advanced Analytics Dashboard', included: true },
      { name: 'Custom AI Solutions', included: true },
      { name: 'Dedicated Account Manager', included: true },
    ],
  },
];

const SubscriptionsPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'annually'>('monthly');
  const { toast } = useToast();

  const handleSubscribe = (planId: string, planName: string) => {
    // Track subscription click event
    trackEvent('subscription_click', 'pricing', planId);
    
    // Show a success message (this would be replaced with actual subscription logic)
    toast({
      title: `${planName} Subscription`,
      description: "Subscription functionality will be available soon!",
      variant: "default",
    });
  };

  return (
    <MainLayout>
      <Helmet>
        <title>Subscription Plans | RXAI - Choose Your Plan</title>
        <meta name="description" content="Explore RXAI subscription plans and choose the perfect one for your needs. From free access to enterprise solutions, find the right AI-powered tools and courses for your growth." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rollinsx.dev/subscriptions" />
      </Helmet>

      <section className="py-20 bg-black/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">Choose Your RXAI Plan</h1>
            <p className="text-xl text-gray-300 mb-8">
              Unlock the full potential of AI with our tiered subscription plans
            </p>
            
            {/* Billing toggle */}
            <div className="inline-flex items-center bg-black/50 p-1 rounded-lg border border-gray-800 mb-4">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm ${
                  billingCycle === 'monthly' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annually')}
                className={`px-4 py-2 rounded-md text-sm ${
                  billingCycle === 'annually' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Annually <span className="text-xs text-emerald-400 ml-1">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {subscriptionPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative border ${
                  plan.highlight 
                    ? 'border-primary/50 bg-black/70' 
                    : 'border-gray-800 bg-black/50'
                } overflow-hidden`}
              >
                {plan.badge && (
                  <Badge className="absolute top-4 right-4 bg-primary text-white">
                    {plan.badge}
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-3">
                    <span className="text-3xl font-bold">${billingCycle === 'monthly' ? plan.price.monthly : plan.price.annually}</span>
                    <span className="text-gray-400 ml-1">/month</span>
                    {billingCycle === 'annually' && plan.price.monthly > 0 && (
                      <div className="text-sm text-emerald-400 mt-1">
                        ${(plan.price.monthly - plan.price.annually) * 12} saved annually
                      </div>
                    )}
                  </div>
                  <CardDescription className="mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
                        )}
                        <span className={feature.included ? "text-gray-200" : "text-gray-500"}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${
                      plan.id === 'free' 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : plan.highlight 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' 
                          : ''
                    }`}
                    onClick={() => handleSubscribe(plan.id, plan.name)}
                  >
                    {plan.id === 'free' ? 'Get Started' : 'Subscribe'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-20 bg-black/40 border border-gray-800 rounded-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Can I cancel my subscription?</h3>
                <p className="text-gray-400">Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">How do I upgrade my plan?</h3>
                <p className="text-gray-400">You can upgrade your plan at any time from your account dashboard. The price difference will be prorated for the remainder of your billing cycle.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Do you offer team pricing?</h3>
                <p className="text-gray-400">Yes, for teams of 5 or more, we offer special pricing. Please contact our sales team for details.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-400">We accept all major credit cards, PayPal, and bank transfers for Enterprise accounts.</p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Need a Custom Solution?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-6">
              Contact our team for a tailored solution designed specifically for your organization's unique requirements.
            </p>
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-white"
              onClick={() => {
                trackEvent('contact_sales_click', 'pricing', 'custom_solution');
                window.location.href = '/contact';
              }}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default SubscriptionsPage;