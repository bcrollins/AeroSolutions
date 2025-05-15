import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SlideIn, ButtonPress } from '@/components/UI/MicroInteractions';

interface PricingTier {
  name: string;
  price: string;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
  ctaLink: string;
}

interface StickyPricingComparisonProps {
  title?: string;
  description?: string;
  tiers: PricingTier[];
  position?: 'bottom' | 'top';
  showAfterScroll?: number;
  dismissible?: boolean;
  className?: string;
}

/**
 * StickyPricingComparison - A sticky pricing comparison component that shows tiers side by side
 * 
 * @example
 * <StickyPricingComparison
 *   title="Compare Plans"
 *   description="Find the perfect plan for your needs"
 *   tiers={[
 *     {
 *       name: "Basic",
 *       price: "$19/mo",
 *       features: ["Feature 1", "Feature 2"],
 *       ctaText: "Get Started",
 *       ctaLink: "/pricing/basic"
 *     },
 *     {
 *       name: "Pro",
 *       price: "$49/mo",
 *       features: ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
 *       isPopular: true,
 *       ctaText: "Try Pro",
 *       ctaLink: "/pricing/pro"
 *     }
 *   ]}
 *   position="bottom"
 *   showAfterScroll={600}
 * />
 */
export const StickyPricingComparison = ({
  title = "Compare Our Plans",
  description,
  tiers,
  position = 'bottom',
  showAfterScroll = 600,
  dismissible = true,
  className
}: StickyPricingComparisonProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if the component has been dismissed before
  useEffect(() => {
    const hasBeenDismissed = localStorage.getItem('pricingComparisonDismissed');
    
    if (hasBeenDismissed === 'true') {
      setIsDismissed(true);
    }
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const pageHeight = document.body.scrollHeight;
      const viewportHeight = window.innerHeight;
      const scrollPercentage = (scrollPosition / (pageHeight - viewportHeight)) * 100;
      
      // Show after scroll position OR when user reaches 70% of the page
      if ((scrollPosition > showAfterScroll || scrollPercentage > 70) && !isDismissed) {
        setIsVisible(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfterScroll, isDismissed]);
  
  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pricingComparisonDismissed', 'true');
  };
  
  const positionClasses = {
    top: 'top-0',
    bottom: 'bottom-0'
  };
  
  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
        <SlideIn
          direction={position === 'bottom' ? 'up' : 'down'}
          className={cn(
            'fixed left-0 right-0 z-50 w-full bg-background/95 backdrop-blur-md border-t border-border shadow-lg',
            positionClasses[position],
            className
          )}
        >
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
                {description && (
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                )}
              </div>
              
              {dismissible && (
                <ButtonPress>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDismiss}
                    className="flex-shrink-0 opacity-70 hover:opacity-100"
                    aria-label="Dismiss"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </ButtonPress>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {tiers.map((tier, index) => (
                <div 
                  key={index}
                  className={cn(
                    "relative rounded-lg border bg-card p-4 shadow-sm",
                    tier.isPopular && "border-primary ring-1 ring-primary"
                  )}
                >
                  {tier.isPopular && (
                    <div className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      Popular
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h4 className="text-lg font-medium">{tier.name}</h4>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-2xl font-bold">{tier.price}</span>
                    </div>
                  </div>
                  
                  <ul className="mb-6 space-y-2 text-sm">
                    {tier.features.slice(0, 3).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {tier.features.length > 3 && (
                      <li className="flex items-center gap-2 text-muted-foreground">
                        <span>+{tier.features.length - 3} more features</span>
                      </li>
                    )}
                  </ul>
                  
                  <ButtonPress>
                    <Button 
                      variant={tier.isPopular ? "default" : "outline"}
                      className="w-full justify-between group"
                      asChild
                    >
                      <a href={tier.ctaLink}>
                        {tier.ctaText}
                        <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                      </a>
                    </Button>
                  </ButtonPress>
                </div>
              ))}
            </div>
          </div>
        </SlideIn>
      )}
    </AnimatePresence>
  );
};

export default StickyPricingComparison;