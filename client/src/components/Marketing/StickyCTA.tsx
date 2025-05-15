import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import { useDevice } from '@/hooks/use-device';

interface StickyCTAProps {
  title: string;
  description?: string;
  buttonText: string;
  buttonHref: string;
  variant?: 'default' | 'minimal' | 'prominent';
  position?: 'bottom' | 'top';
  dismissible?: boolean;
  showAfterScroll?: number; // Number of pixels to scroll before showing
  expiryDays?: number; // Number of days to remember dismissal
  className?: string;
  hideOnMobile?: boolean;
  customDismissKey?: string; // Custom storage key for dismissal state
  secondaryButton?: {
    text: string;
    href: string;
  };
}

/**
 * StickyCTA - A sticky call-to-action component that appears after scrolling
 * 
 * @example
 * <StickyCTA
 *   title="Get Started with RXAI Today"
 *   description="Access premium AI courses and resources"
 *   buttonText="Start Free Trial"
 *   buttonHref="/signup"
 *   showAfterScroll={300}
 *   variant="prominent"
 * />
 */
export const StickyCTA: React.FC<StickyCTAProps> = ({
  title,
  description,
  buttonText,
  buttonHref,
  variant = 'default',
  position = 'bottom',
  dismissible = true,
  showAfterScroll = 300,
  expiryDays = 7,
  className = '',
  hideOnMobile = false,
  customDismissKey,
  secondaryButton,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { isMobile } = useDevice();
  
  // Generate a unique key based on title and expiry time
  const dismissKey = customDismissKey || `sticky-cta-dismissed-${title.toLowerCase().replace(/\s+/g, '-')}`;
  
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
  }, [dismissKey, dismissible, expiryDays]);
  
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
  
  // Hide on mobile if specified
  if (hideOnMobile && isMobile) {
    return null;
  }
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-background/95 shadow-sm border-t border-border';
      case 'prominent':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-background shadow-lg border border-border/30';
    }
  };
  
  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
        <motion.div
          className={cn(
            'fixed z-50 left-0 right-0 px-4 py-3 backdrop-blur-sm',
            position === 'bottom' ? 'bottom-0' : 'top-0',
            getVariantStyles(),
            className
          )}
          initial={{ y: position === 'bottom' ? 100 : -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: position === 'bottom' ? 100 : -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="container flex items-center justify-between gap-4 mx-auto">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                'text-sm font-semibold sm:text-base',
                variant === 'prominent' ? 'text-primary-foreground' : ''
              )}>
                {title}
              </h3>
              {description && (
                <p className={cn(
                  'text-xs sm:text-sm line-clamp-1',
                  variant === 'prominent' ? 'text-primary-foreground/80' : 'text-muted-foreground'
                )}>
                  {description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {secondaryButton && (
                <Link href={secondaryButton.href}>
                  <Button
                    variant={variant === 'prominent' ? 'secondary' : 'outline'}
                    size="sm"
                    className="hidden sm:inline-flex"
                  >
                    {secondaryButton.text}
                  </Button>
                </Link>
              )}
              
              <Link href={buttonHref}>
                <Button
                  variant={variant === 'prominent' ? 'secondary' : 'default'}
                  size="sm"
                  className={cn(
                    variant === 'prominent' && 'bg-background text-foreground hover:bg-background/90'
                  )}
                >
                  {buttonText}
                </Button>
              </Link>
              
              {dismissible && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-7 w-7',
                    variant === 'prominent' ? 'text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10' : ''
                  )} 
                  onClick={handleDismiss}
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyCTA;