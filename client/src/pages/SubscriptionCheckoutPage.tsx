import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import { StripeCheckout } from '@/components/checkout/StripeCheckout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { createSubscriptionCheckout as createSubscription, getSubscriptionPlans } from '@/utils/stripe';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SubscriptionCheckoutPage = () => {
  const [_, setLocation] = useLocation();
  const [, params] = useRoute('/subscription-checkout/:planId/:interval');
  const { toast } = useToast();
  
  const planId = params?.planId ? parseInt(params.planId) : null;
  const interval = params?.interval === 'annual' ? 'annual' : 'monthly';

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch subscription plans
  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['/api/stripe/subscription-plans'],
    queryFn: getSubscriptionPlans
  });

  // Find the selected plan
  const selectedPlan = plans?.find(plan => plan.id === planId);
  
  // Handle initial load - create subscription
  useEffect(() => {
    const initializeCheckout = async () => {
      if (!planId || !selectedPlan) return;
      
      try {
        setError(null);
        setIsCreatingSubscription(true);
        
        // Get the price ID based on the interval
        const priceId = interval === 'annual'
          ? selectedPlan.stripeAnnualPriceId
          : selectedPlan.stripeMonthlyPriceId;
        
        if (!priceId) {
          throw new Error('Selected subscription interval is not available');
        }
        
        // Create subscription
        const result = await createSubscription(priceId, planId);
        
        // If subscription is already active, redirect to success page
        if (result.status === 'active') {
          setIsSuccess(true);
          setSubscriptionId(result.subscriptionId);
          
          toast({
            title: 'Subscription active',
            description: `Your ${selectedPlan.name} plan is now active.`,
          });
          
          // Redirect after a short delay
          setTimeout(() => {
            setLocation('/account');
          }, 2000);
          
          return;
        }
        
        // Save client secret for payment form
        if (result.clientSecret) {
          setClientSecret(result.clientSecret);
          setSubscriptionId(result.subscriptionId);
        } else {
          throw new Error('Unable to create subscription');
        }
      } catch (err: any) {
        console.error('Error creating subscription:', err);
        setError(err.message || 'Failed to create subscription. Please try again.');
        
        toast({
          title: 'Subscription error',
          description: err.message || 'There was a problem creating your subscription.',
          variant: 'destructive',
        });
      } finally {
        setIsCreatingSubscription(false);
      }
    };

    if (planId && selectedPlan && !clientSecret && !isCreatingSubscription && !isSuccess) {
      initializeCheckout();
    }
  }, [planId, selectedPlan, interval, clientSecret, isCreatingSubscription, isSuccess, toast, setLocation]);

  // Handle successful payment
  const handlePaymentSuccess = () => {
    setIsSuccess(true);
    
    // Redirect to account page after a short delay
    setTimeout(() => {
      setLocation('/account');
    }, 2000);
  };

  // Handle cancellation
  const handleCancel = () => {
    setLocation('/subscriptions');
  };

  // Show loading state
  if (isLoadingPlans || isCreatingSubscription) {
    return (
      <div className="container max-w-4xl py-12">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Preparing your subscription</CardTitle>
            <CardDescription>Please wait while we set up your checkout...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container max-w-4xl py-12">
        <Alert variant="destructive" className="w-full max-w-md mx-auto mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center">
          <Button onClick={() => setLocation('/subscriptions')}>
            Back to Subscription Plans
          </Button>
        </div>
      </div>
    );
  }

  // Show success state
  if (isSuccess) {
    return (
      <div className="container max-w-4xl py-12">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle>Subscription Successful!</CardTitle>
            <CardDescription>
              Thank you for subscribing to the {selectedPlan?.name} plan. You now have access to all included features.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Button onClick={() => setLocation('/account')}>
              Go to My Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no plan is selected or not found
  if (!selectedPlan) {
    return (
      <div className="container max-w-4xl py-12">
        <Alert className="w-full max-w-md mx-auto mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid Plan</AlertTitle>
          <AlertDescription>
            The selected subscription plan was not found. Please choose a plan.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center">
          <Button onClick={() => setLocation('/subscriptions')}>
            View Subscription Plans
          </Button>
        </div>
      </div>
    );
  }

  // Show checkout form if client secret is available
  if (clientSecret) {
    return (
      <div className="container max-w-4xl py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Complete Your Subscription</h1>
          <p className="text-center text-muted-foreground">You're subscribing to the {selectedPlan.name} plan</p>
        </div>
        
        <div className="mb-8">
          <Card className="w-full max-w-md mx-auto mb-8">
            <CardHeader>
              <CardTitle>{selectedPlan.name} Plan</CardTitle>
              <CardDescription>
                {interval === 'annual' 
                  ? `${selectedPlan.annualPrice} billed annually (save 20%)` 
                  : `${selectedPlan.monthlyPrice} billed monthly`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="font-medium">Included features:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedPlan.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <StripeCheckout
          clientSecret={clientSecret}
          onSuccess={handlePaymentSuccess}
          onCancel={handleCancel}
          title="Payment Details"
          description={`Complete your ${selectedPlan.name} subscription payment`}
          submitButtonText="Subscribe Now"
        />
      </div>
    );
  }

  // Fallback - should not reach here but just in case
  return (
    <div className="container max-w-4xl py-12 text-center">
      <Alert className="w-full max-w-md mx-auto mb-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>
          We couldn't set up your subscription checkout. Please try again.
        </AlertDescription>
      </Alert>
      
      <Button onClick={() => setLocation('/subscriptions')}>
        Back to Subscription Plans
      </Button>
    </div>
  );
};

export default SubscriptionCheckoutPage;