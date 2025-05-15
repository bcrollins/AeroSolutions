import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SlideIn, ButtonPress } from '@/components/UI/MicroInteractions';

interface StickyCTAProps {
  title: string;
  description?: string;
  ctaText: string;
  ctaLink: string;
  position?: 'bottom' | 'top';
  showAfterScroll?: number; // Pixels scrolled before showing
  dismissible?: boolean;
  variant?: 'primary' | 'secondary' | 'minimal';
  className?: string;
}

const variantStyles = {
  primary: 'bg-primary text-white',
  secondary: 'bg-secondary border border-border',
  minimal: 'bg-background/80 backdrop-blur-md border border-border shadow-sm'
};

/**
 * StickyCTA - A sticky call-to-action component that appears after scrolling
 * 
 * @example
 * <StickyCTA 
 *   title="Get Started Today"
 *   description="Sign up for our Pro plan and save 20%"
 *   ctaText="Upgrade Now"
 *   ctaLink="/pricing"
 *   position="bottom"
 *   showAfterScroll={300}
 *   dismissible={true}
 * />
 */
export const StickyCTA = ({
  title,
  description,
  ctaText,
  ctaLink,
  position = 'bottom',
  showAfterScroll = 300,
  dismissible = true,
  variant = 'primary',
  className
}: StickyCTAProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  
  // Check if the user has dismissed this CTA before
  useEffect(() => {
    const hasBeenDismissed = localStorage.getItem('ctaDismissed');
    
    if (hasBeenDismissed === 'true') {
      setIsDismissed(true);
    }
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > showAfterScroll && !isDismissed) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfterScroll, isDismissed]);
  
  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('ctaDismissed', 'true');
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
            'fixed left-0 right-0 z-50 w-full px-4 py-3 sm:px-6 md:py-4',
            positionClasses[position],
            variantStyles[variant],
            className
          )}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="mr-8">
              <h3 className="text-base font-semibold sm:text-lg md:text-xl">{title}</h3>
              {description && (
                <p className="mt-1 text-sm opacity-90 md:text-base">{description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <ButtonPress>
                <Button asChild className="font-medium">
                  <a href={ctaLink}>{ctaText}</a>
                </Button>
              </ButtonPress>
              
              {dismissible && (
                <ButtonPress>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDismiss}
                    className="ml-2 flex-shrink-0 text-current opacity-80 hover:opacity-100"
                    aria-label="Dismiss"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </ButtonPress>
              )}
            </div>
          </div>
        </SlideIn>
      )}
    </AnimatePresence>
  );
};

export default StickyCTA;