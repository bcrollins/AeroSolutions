import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { 
  X, 
  Check, 
  ChevronUp, 
  ChevronDown,
  Zap,
  Star
} from 'lucide-react';
import { useDevice } from '@/hooks/use-device';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

interface PricingFeature {
  title: string;
  includedIn: ('free' | 'basic' | 'pro' | 'enterprise')[];
  highlight?: boolean;
}

interface PricingTier {
  id: string;
  name: string;
  price: number;
  priceUnit?: string; // "month" | "year" | "user" etc.
  description: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  mostPopular?: boolean;
  highlighted?: boolean;
  badge?: string;
}

interface StickyPricingComparisonProps {
  title?: string;
  description?: string;
  pricing: PricingTier[];
  showAfterScroll?: number;
  variant?: 'minimal' | 'default' | 'prominent';
  showToggleButton?: boolean;
  dismissible?: boolean;
  className?: string;
  expiryDays?: number; // Days to remember dismissal
  customDismissKey?: string;
  defaultExpanded?: boolean;
  autoCollapseOnMobile?: boolean;
}

/**
 * StickyPricingComparison - A sticky pricing comparison component that appears after scrolling
 * 
 * @example
 * <StickyPricingComparison
 *   title="Choose the Right Plan for You"
 *   description="Start with a free plan or upgrade for more features"
 *   pricing={[
 *     {
 *       id: "free",
 *       name: "Free",
 *       price: 0,
 *       description: "Basic access to AI courses",
 *       features: ["Limited course access", "Community support"],
 *       ctaText: "Sign Up Free",
 *       ctaHref: "/signup?plan=free"
 *     },
 *     // More pricing tiers...
 *   ]}
 *   showAfterScroll={600}
 * />
 */
export const StickyPricingComparison: React.FC<StickyPricingComparisonProps> = ({
  title = "Choose Your Plan",
  description,
  pricing,
  showAfterScroll = 600,
  variant = 'default',
  showToggleButton = true,
  dismissible = true,
  className = '',
  expiryDays = 7,
  customDismissKey,
  defaultExpanded = false,
  autoCollapseOnMobile = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isDismissed, setIsDismissed] = useState(false);
  const { isMobile } = useDevice();
  
  // Generate a unique key based on title for storage
  const dismissKey = customDismissKey || `sticky-pricing-dismissed-${title.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Check if already dismissed on mount
  useEffect(() => {
    if (dismissible) {
      const storedDismissalTime = localStorage.getItem(dismissKey);
      
      if (storedDismissalTime) {
        const dismissalTime = parseInt(storedDismissalTime, 10);
        const expiryTime = dismissalTime + (expiryDays * 24 * 60 * 60 * 1000);
        
        if (Date.now() < expiryTime) {
          setIsDismissed(true);
        } else {
          // Expired, remove from storage
          localStorage.removeItem(dismissKey);
        }
      }
    }
    
    // Auto-collapse on mobile if specified
    if (isMobile && autoCollapseOnMobile) {
      setIsExpanded(false);
    }
  }, [dismissKey, dismissible, expiryDays, isMobile, autoCollapseOnMobile]);
  
  // Show after scrolling
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      
      if (scrollPosition > showAfterScroll && !isDismissed) {
        setIsVisible(true);
      } else if (scrollPosition <= showAfterScroll) {
        setIsVisible(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial scroll position
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showAfterScroll, isDismissed]);
  
  const handleDismiss = () => {
    setIsDismissed(true);
    
    if (dismissible) {
      localStorage.setItem(dismissKey, Date.now().toString());
    }
  };
  
  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-background/95 border-t border-border';
      case 'prominent':
        return 'bg-primary/5 dark:bg-primary/10 border-t border-primary/20';
      default:
        return 'bg-background/95 shadow-lg border-t border-border/30';
    }
  };
  
  // Find the most popular plan to highlight
  const mostPopularPlan = pricing.find(tier => tier.mostPopular);
  
  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
        <motion.div
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 backdrop-blur-sm',
            getVariantStyles(),
            className
          )}
          initial={{ y: 300, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 300, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Header/Toggle Area */}
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">
                {title}
                {mostPopularPlan && (
                  <span className="ml-2 text-xs text-primary">
                    Most Popular: {mostPopularPlan.name}
                  </span>
                )}
              </h3>
              {description && (
                <p className="text-sm text-muted-foreground max-w-md">
                  {description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {showToggleButton && (
                <Button
                  variant="ghost" 
                  size="sm"
                  onClick={toggleExpanded}
                  aria-label={isExpanded ? "Collapse pricing comparison" : "Expand pricing comparison"}
                  className="flex items-center gap-1"
                >
                  <span className="hidden sm:inline">
                    {isExpanded ? "Hide" : "Compare Plans"}
                  </span>
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </Button>
              )}
              
              {dismissible && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={handleDismiss}
                  aria-label="Dismiss pricing comparison"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Expanded Pricing Cards */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="container mx-auto px-4 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {pricing.map((tier) => (
                      <PricingCard key={tier.id} tier={tier} variant={variant} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Pricing card component
const PricingCard: React.FC<{ 
  tier: PricingTier; 
  variant: 'minimal' | 'default' | 'prominent';
}> = ({ tier, variant }) => {
  return (
    <Card 
      className={cn(
        'flex flex-col h-full overflow-hidden transition-all duration-200',
        tier.highlighted && 'border-primary shadow-md',
        tier.mostPopular && 'scale-[1.02] shadow-lg border-primary/50'
      )}
    >
      {tier.badge && (
        <div className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 text-center">
          {tier.badge}
        </div>
      )}
      
      <CardHeader className={cn(
        tier.mostPopular && 'bg-primary/5 dark:bg-primary/10',
        'pb-2'
      )}>
        <CardTitle className="flex items-center justify-between">
          {tier.name}
          {tier.mostPopular && (
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          )}
        </CardTitle>
        <CardDescription>{tier.description}</CardDescription>
        <div className="mt-1">
          <span className="text-2xl font-bold">
            {tier.price === 0 ? 'Free' : `$${tier.price}`}
          </span>
          {tier.price > 0 && tier.priceUnit && (
            <span className="text-sm text-muted-foreground ml-1">
              /{tier.priceUnit}
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow py-3">
        <ul className="space-y-2 text-sm">
          {tier.features.map((feature, index) => (
            <li 
              key={index} 
              className="flex items-start gap-2"
            >
              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Link href={tier.ctaHref} className="w-full">
          <Button 
            className={cn(
              'w-full',
              tier.mostPopular && 'bg-primary hover:bg-primary/90'
            )}
            variant={tier.mostPopular ? 'default' : 'outline'}
          >
            {tier.ctaText}
            {tier.mostPopular && <Zap className="ml-1 h-4 w-4" />}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default StickyPricingComparison;