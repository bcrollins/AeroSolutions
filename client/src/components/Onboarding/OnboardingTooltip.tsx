import React, { useRef, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingStep, useOnboarding } from '@/contexts/OnboardingContext';

interface OnboardingTooltipProps {
  className?: string;
}

/**
 * OnboardingTooltip - Displays a tooltip for the current onboarding step
 */
const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({ className }) => {
  const { 
    isOnboardingActive, 
    activeFlow,
    currentStep, 
    nextStep, 
    prevStep, 
    skipFlow, 
    endOnboarding
  } = useOnboarding();
  
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    transformOrigin: string;
  }>({
    top: 0,
    left: 0,
    transformOrigin: 'center center',
  });
  
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Update tooltip position based on the target element and placement
  useEffect(() => {
    if (!isOnboardingActive || !currentStep) return;
    
    const updatePosition = () => {
      if (currentStep.placement === 'center' || !currentStep.elementSelector) {
        // Center in the viewport
        setPosition({
          top: window.innerHeight / 2,
          left: window.innerWidth / 2,
          transformOrigin: 'center center',
        });
        return;
      }
      
      // Find the target element
      const targetElement = document.querySelector(currentStep.elementSelector);
      
      if (!targetElement) {
        console.warn(`Target element not found: ${currentStep.elementSelector}`);
        // Fall back to center positioning
        setPosition({
          top: window.innerHeight / 2,
          left: window.innerWidth / 2,
          transformOrigin: 'center center',
        });
        return;
      }
      
      // Get element's position and dimensions
      const rect = targetElement.getBoundingClientRect();
      const tooltipHeight = tooltipRef.current?.offsetHeight || 200;
      const tooltipWidth = tooltipRef.current?.offsetWidth || 320;
      
      // Calculate position based on placement
      let top = 0;
      let left = 0;
      let transformOrigin = '';
      
      switch (currentStep.placement) {
        case 'top':
          top = rect.top - tooltipHeight - 12;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          transformOrigin = 'bottom center';
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + 12;
          transformOrigin = 'left center';
          break;
        case 'bottom':
          top = rect.bottom + 12;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          transformOrigin = 'top center';
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - 12;
          transformOrigin = 'right center';
          break;
        default:
          top = rect.bottom + 12;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          transformOrigin = 'top center';
      }
      
      // Ensure tooltip stays within viewport
      if (left < 16) left = 16;
      if (left + tooltipWidth > window.innerWidth - 16) {
        left = window.innerWidth - tooltipWidth - 16;
      }
      
      if (top < 16) top = 16;
      if (top + tooltipHeight > window.innerHeight - 16) {
        top = window.innerHeight - tooltipHeight - 16;
      }
      
      setPosition({
        top,
        left,
        transformOrigin,
      });
    };
    
    // Update position initially and on window resize
    updatePosition();
    window.addEventListener('resize', updatePosition);
    
    // Highlight target element if needed
    if (currentStep.elementSelector) {
      const targetElement = document.querySelector(currentStep.elementSelector);
      if (targetElement) {
        targetElement.classList.add('onboarding-highlight');
      }
    }
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      
      // Remove highlight from target element
      if (currentStep.elementSelector) {
        const targetElement = document.querySelector(currentStep.elementSelector);
        if (targetElement) {
          targetElement.classList.remove('onboarding-highlight');
        }
      }
    };
  }, [isOnboardingActive, currentStep]);
  
  // Return null if onboarding is not active
  if (!isOnboardingActive || !currentStep || !activeFlow) return null;
  
  // Current step index and total steps
  const currentIndex = activeFlow.steps.findIndex(step => step.id === currentStep.id);
  const totalSteps = activeFlow.steps.length;
  
  // Calculate if it's the first or last step
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === totalSteps - 1;
  
  // Handle action button click
  const handleActionClick = () => {
    if (currentStep.action?.onClick) {
      currentStep.action.onClick();
    }
    nextStep();
  };
  
  // Handle skip button click
  const handleSkipClick = () => {
    if (activeFlow) {
      skipFlow(activeFlow.id);
    } else {
      endOnboarding();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none"
      aria-live="polite"
    >
      {/* Overlay */}
      <AnimatePresence>
        {isOnboardingActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 pointer-events-auto"
            onClick={currentStep.placement === 'center' ? undefined : handleSkipClick}
          />
        )}
      </AnimatePresence>
      
      {/* Tooltip */}
      <AnimatePresence>
        {isOnboardingActive && currentStep && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'absolute',
              top: position.top,
              left: position.left,
              transformOrigin: position.transformOrigin,
            }}
            className={cn('w-80 max-w-[calc(100vw-32px)] pointer-events-auto', className)}
          >
            <Card className="shadow-lg border-primary/20">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold">
                    {currentStep.title}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleSkipClick}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {currentStep.description}
                </p>
              </CardContent>
              <CardFooter className="border-t pt-3 flex flex-col gap-2">
                <div className="flex justify-between items-center w-full">
                  <div className="text-sm text-muted-foreground">
                    {currentIndex + 1} of {totalSteps}
                  </div>
                  <div className="flex items-center gap-2">
                    {!isFirstStep && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={prevStep}
                        className="h-8"
                      >
                        <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                        Back
                      </Button>
                    )}
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleActionClick}
                      className="h-8"
                    >
                      {currentStep.action?.label || (isLastStep ? 'Finish' : 'Next')}
                      {isLastStep ? null : <ArrowRight className="h-3.5 w-3.5 ml-1" />}
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingTooltip;