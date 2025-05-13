import { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe } from '@/utils/stripe';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CheckoutFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
  processingButtonText?: string;
  successButtonText?: string;
  submitButtonText?: string;
}

const CheckoutForm = ({
  clientSecret,
  onSuccess,
  onCancel,
  processingButtonText = 'Processing...',
  successButtonText = 'Payment Successful',
  submitButtonText = 'Subscribe Now'
}: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Check if payment has completed successfully
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) return;
      
      switch (paymentIntent.status) {
        case 'succeeded':
          setIsSuccess(true);
          onSuccess();
          toast({
            title: 'Payment successful',
            description: 'Thank you for your subscription!',
          });
          break;
        case 'processing':
          toast({
            title: 'Payment processing',
            description: 'Your payment is processing.',
          });
          break;
        case 'requires_payment_method':
          // Show the payment form
          break;
        default:
          setErrorMessage('Something went wrong. Please try again.');
          break;
      }
    });
  }, [stripe, clientSecret, onSuccess, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href, // URL to redirect to after payment
      },
      redirect: 'if_required', // Only redirect if 3D Secure is required
    });

    // If the payment doesn't require extra authentication steps, we can handle the result here
    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setErrorMessage(error.message || 'An unexpected error occurred.');
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
      
      toast({
        title: 'Payment failed',
        description: error.message || 'There was an issue with your payment.',
        variant: 'destructive',
      });
    } else {
      // Payment succeeded
      setIsSuccess(true);
      onSuccess();
      toast({
        title: 'Payment successful',
        description: 'Thank you for your subscription!',
      });
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {errorMessage && (
        <div className="text-red-500 mb-4 p-2 bg-red-50 border border-red-100 rounded-md">
          {errorMessage}
        </div>
      )}
      
      <div className="mb-6">
        <PaymentElement />
      </div>
      
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading || isSuccess}
        >
          Cancel
        </Button>
        
        <Button 
          type="submit" 
          disabled={isLoading || !stripe || !elements || isSuccess}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {processingButtonText}
            </>
          ) : isSuccess ? (
            <>{successButtonText}</>
          ) : (
            <>{submitButtonText}</>
          )}
        </Button>
      </div>
    </form>
  );
};

interface StripeCheckoutProps {
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  processingButtonText?: string;
  successButtonText?: string;
  submitButtonText?: string;
}

export const StripeCheckout = ({
  clientSecret,
  onSuccess,
  onCancel,
  title = 'Complete your subscription',
  description = 'Please enter your payment details to complete your subscription.',
  processingButtonText,
  successButtonText,
  submitButtonText,
}: StripeCheckoutProps) => {
  const [stripePromise, setStripePromise] = useState(() => getStripe());

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm 
            clientSecret={clientSecret}
            onSuccess={onSuccess}
            onCancel={onCancel}
            processingButtonText={processingButtonText}
            successButtonText={successButtonText}
            submitButtonText={submitButtonText}
          />
        </Elements>
      </CardContent>
      <CardFooter className="text-xs text-gray-500 flex justify-center">
        <div className="text-center">
          Your payment is processed securely by Stripe. We do not store your card details.
        </div>
      </CardFooter>
    </Card>
  );
};

export default StripeCheckout;