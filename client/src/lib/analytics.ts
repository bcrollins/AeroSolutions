// Define the gtag function globally
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    return;
  }

  // Add Google Analytics script to the head
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(script2);
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  
  window.gtag('config', measurementId, {
    page_path: url
  });
};

// Track events
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Subscription-specific tracking events
export const trackSubscriptionEvents = {
  viewPricingPage: () => {
    trackEvent('view_pricing_page', 'subscription');
  },
  toggleBillingCycle: (cycle: 'monthly' | 'annual') => {
    trackEvent('toggle_billing_cycle', 'subscription', cycle);
  },
  selectPlan: (planName: string, planPrice: number, billingCycle: 'monthly' | 'annual') => {
    trackEvent('select_plan', 'subscription', planName, planPrice);
    
    // Also send as ecommerce event for more detailed analytics
    if (window.gtag) {
      window.gtag('event', 'select_item', {
        items: [{
          item_id: planName,
          item_name: planName,
          price: planPrice,
          item_category: 'subscription',
          item_variant: billingCycle
        }]
      });
    }
  },
  startSubscription: (planName: string, planPrice: number, billingCycle: 'monthly' | 'annual') => {
    trackEvent('start_subscription', 'subscription', planName, planPrice);
    
    // Send purchase event
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: 'subscription_' + Date.now(),
        value: planPrice,
        currency: 'USD',
        items: [{
          item_id: planName,
          item_name: planName,
          price: planPrice,
          item_category: 'subscription',
          item_variant: billingCycle
        }]
      });
    }
  },
  cancelSubscription: (planName: string, reason?: string) => {
    trackEvent('cancel_subscription', 'subscription', `${planName}${reason ? ': ' + reason : ''}`);
  }
};