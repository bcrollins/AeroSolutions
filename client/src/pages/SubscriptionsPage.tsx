import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import SubscriptionPlans from '@/components/SubscriptionPlans';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Shield, Zap, CheckCircle, Calendar, CreditCard, AlertTriangle } from 'lucide-react';
import { cancelSubscription } from '@/utils/stripe';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const SubscriptionsPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    subscription,
    plan,
    hasActiveSubscription,
    isLoading
  } = useSubscription();

  // Mutation for canceling subscription
  const cancelSubscriptionMutation = useMutation({
    mutationFn: ({ subscriptionId, immediate }: { subscriptionId: string, immediate: boolean }) => 
      cancelSubscription(subscriptionId),
    onSuccess: () => {
      toast({
        title: 'Subscription canceled',
        description: 'Your subscription has been canceled.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/stripe/current-subscription'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error canceling subscription',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });

  // Handle subscription cancellation
  const handleCancelSubscription = (immediate: boolean = false) => {
    if (!subscription?.id) return;
    
    if (confirm('Are you sure you want to cancel your subscription?')) {
      cancelSubscriptionMutation.mutate({ 
        subscriptionId: subscription.id,
        immediate 
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="container py-10 max-w-6xl">
      <div className="flex flex-col gap-8">
        {/* Empty div to preserve spacing */}
        <div></div>

        {/* Current subscription section (if user has an active subscription) */}
        {hasActiveSubscription && plan && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Current Subscription</CardTitle>
              </div>
              <CardDescription>
                You are currently subscribed to the {plan.name} plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Left column: Subscription details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">Plan Details</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="text-muted-foreground">Plan</div>
                      <div className="font-medium">{plan.name}</div>
                      
                      <div className="text-muted-foreground">Price</div>
                      <div className="font-medium">{subscription?.plan?.interval === 'year' ? plan.annualPrice : plan.monthlyPrice}</div>
                      
                      <div className="text-muted-foreground">Billing cycle</div>
                      <div className="font-medium capitalize">
                        {subscription?.plan?.interval === 'year' ? 'Annual' : 'Monthly'}
                      </div>
                      
                      {subscription?.current_period_end && (
                        <>
                          <div className="text-muted-foreground">Next billing date</div>
                          <div className="font-medium">
                            {formatDate(subscription.current_period_end)}
                          </div>
                        </>
                      )}
                      
                      <div className="text-muted-foreground">Status</div>
                      <div className="font-medium flex items-center gap-1">
                        <span className={
                          subscription?.status === 'active' || subscription?.status === 'trialing'
                            ? 'text-green-500' 
                            : 'text-amber-500'
                        }>
                          {subscription?.status === 'active' 
                            ? 'Active' 
                            : subscription?.status === 'trialing'
                              ? 'Trial'
                              : subscription?.status || 'Unknown'}
                        </span>
                        {(subscription?.status === 'active' || subscription?.status === 'trialing') && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {subscription?.cancel_at_period_end && (
                          <span className="ml-2 text-rose-500 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            Cancels at period end
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Buttons for subscription management */}
                  <div className="flex flex-wrap gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setLocation('/billing')}
                      className="flex items-center gap-1"
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Billing History
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCancelSubscription()}
                      className="flex items-center gap-1"
                      disabled={cancelSubscriptionMutation.isPending}
                    >
                      {cancelSubscriptionMutation.isPending ? (
                        <span className="animate-spin mr-1">⏳</span>
                      ) : (
                        <Calendar className="h-4 w-4 mr-1" />
                      )}
                      Cancel Subscription
                    </Button>
                  </div>
                </div>
                
                {/* Right column: Included features */}
                <div className="space-y-4">
                  <h3 className="font-medium mb-2">Included Features</h3>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription plans */}
        <div>
          <SubscriptionPlans 
            hideCurrentPlan={hasActiveSubscription} 
          />
        </div>

        {/* FAQ section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change plans later?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Yes, you can upgrade or downgrade your plan at any time. Changes will take effect immediately.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How do I cancel my subscription?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>You can cancel your subscription from this page. Your access will continue until the end of your current billing period.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We accept all major credit cards, including Visa, Mastercard, and American Express. Payment is securely processed through Stripe.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>If you're not satisfied with your subscription, contact our support team within 14 days of purchase for a full refund.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsPage;