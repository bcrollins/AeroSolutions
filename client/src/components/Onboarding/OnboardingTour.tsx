import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import SoundButton from '@/components/UI/SoundButton';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import useLocalStorage from '../../hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';
import { useSoundEffects } from '../../hooks/use-sound-effects';
import useKeyboardSound from '../../hooks/use-keyboard-sound';

// Define the structure of a tour step
interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  position: 'top' | 'right' | 'bottom' | 'left';
}

// Define common props for the component
interface OnboardingTourProps {
  forceTour?: boolean;
}

// Create a global function to restart the tour
// This will be called from other components
let globalRestartTour: () => void = () => {};

export const restartOnboardingTour = () => {
  globalRestartTour();
};

export default function OnboardingTour({ forceTour = false }: OnboardingTourProps) {
  // Tour steps data - could be moved to a config file
  const tourSteps: TourStep[] = [
    {
      id: 'dashboard-intro',
      title: 'Welcome to RXAI Platform',
      description: 'This guided tour will help you get familiar with our platform\'s key features. We\'ll show you how to navigate and make the most of your experience.',
      target: 'body', // Start with full-screen intro
      position: 'bottom'
    },
    {
      id: 'dashboard-navigation',
      title: 'Smart Navigation',
      description: 'The sidebar gives you quick access to all areas of the platform. You can collapse it for more workspace when needed.',
      target: '.main-sidebar',
      position: 'right'
    },
    {
      id: 'command-palette',
      title: 'Command Palette',
      description: 'Press ⌘K (Mac) or Ctrl+K (Windows) to quickly access any feature, page, or action without clicking around.',
      target: '.command-palette-button',
      position: 'bottom'
    },
    {
      id: 'dashboard-cards',
      title: 'Smart Dashboard',
      description: 'Your personalized dashboard displays your progress, recommended courses, and activity. Cards automatically update as you use the platform.',
      target: '.dashboard-grid',
      position: 'top'
    },
    {
      id: 'theme-switcher',
      title: 'Customize Your Experience',
      description: 'Change theme, colors, and accessibility settings to make the platform work for you.',
      target: '.theme-toggle',
      position: 'bottom'
    },
    {
      id: 'search-feature',
      title: 'Powerful Search',
      description: 'Quickly find content, courses, or tools with our AI-powered search feature.',
      target: '.search-input',
      position: 'bottom'
    },
    {
      id: 'notifications',
      title: 'Stay Updated',
      description: 'We\'ll notify you about new courses, updates to your subscriptions, and platform improvements.',
      target: '.notifications-button',
      position: 'left'
    },
    {
      id: 'help-center',
      title: 'Get Help Anytime',
      description: 'Our help center and live chat support are available 24/7 if you need assistance.',
      target: '.help-button',
      position: 'left'
    }
  ];

  // Get from local storage or set default values
  const [currentStepIndex, setCurrentStepIndex] = useLocalStorage<number>('onboarding-step-index', 0);
  const [showTour, setShowTour] = useLocalStorage<boolean>('show-onboarding-tour', true);
  const [hasCompletedTour, setHasCompletedTour] = useLocalStorage<boolean>('completed-onboarding-tour', false);
  
  // Additional state
  const [isElementVisible, setIsElementVisible] = useState(false);
  const [elementPosition, setElementPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const highlightedElementRef = useRef<Element | null>(null);
  const { toast } = useToast();
  const { playSound, isEnabled: soundEnabled } = useSoundEffects();

  // Show the tour if forced or if the user hasn't completed it
  useEffect(() => {
    if (forceTour) {
      setShowTour(true);
    } else if (hasCompletedTour && !forceTour) {
      setShowTour(false);
    }
  }, [forceTour, hasCompletedTour, setShowTour]);
  
  // Set up the global restart function
  useEffect(() => {
    // Define the restart function
    globalRestartTour = () => {
      // Reset to first step
      setCurrentStepIndex(0);
      // Show the tour
      setShowTour(true);
      
      // Play a sound if enabled
      if (soundEnabled) playSound('notification');
      
      toast({
        title: "Tour restarted",
        description: "Let's explore the platform features again!",
        variant: "default"
      });
    };
    
    // Clean up when component unmounts
    return () => {
      globalRestartTour = () => {};
    };
  }, [setCurrentStepIndex, setShowTour, toast]);

  // Find the target element and calculate its position
  useEffect(() => {
    if (!showTour) return;

    const currentStep = tourSteps[currentStepIndex];
    
    // For the intro step, we don't need to highlight any element
    if (currentStep.target === 'body') {
      setIsElementVisible(true);
      setElementPosition({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
        width: 0,
        height: 0
      });
      return;
    }

    // Find the target element
    const targetElement = document.querySelector(currentStep.target);
    
    if (targetElement) {
      highlightedElementRef.current = targetElement;
      
      // Add highlight class to the target element
      targetElement.classList.add('tour-highlight');
      
      // Calculate element position
      const rect = targetElement.getBoundingClientRect();
      setElementPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });
      
      setIsElementVisible(true);
      
      // Scroll element into view
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    } else {
      // If element not found, move to next step
      setIsElementVisible(false);
      console.warn(`Target element "${currentStep.target}" not found for tour step ${currentStepIndex}`);
    }

    // Cleanup function to remove highlight class
    return () => {
      if (highlightedElementRef.current) {
        highlightedElementRef.current.classList.remove('tour-highlight');
        highlightedElementRef.current = null;
      }
    };
  }, [showTour, currentStepIndex, tourSteps]);

  // Handle next step
  const handleNextStep = () => {
    if (currentStepIndex < tourSteps.length - 1) {
      if (soundEnabled) playSound('click');
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      completeTour();
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      if (soundEnabled) playSound('click');
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // Handle completing the tour
  const completeTour = () => {
    if (soundEnabled) playSound('complete');
    setShowTour(false);
    setHasCompletedTour(true);
    
    // Remove highlight from any element
    if (highlightedElementRef.current) {
      highlightedElementRef.current.classList.remove('tour-highlight');
    }
    
    toast({
      title: "Tour completed!",
      description: "You can restart the tour anytime from the help menu.",
      variant: "default"
    });
  };

  // Skip the tour
  const skipTour = () => {
    if (soundEnabled) playSound('notification');
    setShowTour(false);
    setHasCompletedTour(true);
    
    // Remove highlight from any element
    if (highlightedElementRef.current) {
      highlightedElementRef.current.classList.remove('tour-highlight');
    }
    
    toast({
      title: "Tour skipped",
      description: "You can restart the tour anytime from the help menu.",
      variant: "default"
    });
  };

  // If tour is not showing, don't render anything
  if (!showTour) return null;

  const currentStep = tourSteps[currentStepIndex];
  const isLastStep = currentStepIndex === tourSteps.length - 1;
  const isFirstStep = currentStepIndex === 0;
  
  // Add keyboard navigation with sound effects
  useKeyboardSound({
    onEnter: handleNextStep,
    onEsc: skipTour,
    enabled: showTour
  });
  
  // Handle arrow keys for navigation
  useEffect(() => {
    if (!showTour) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !isLastStep) {
        if (soundEnabled) playSound('click');
        handleNextStep();
      } else if (e.key === 'ArrowLeft' && !isFirstStep) {
        if (soundEnabled) playSound('click');
        handlePrevStep();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTour, isFirstStep, isLastStep, soundEnabled, playSound]);

  // Calculate tooltip position based on element position and specified position
  const getTooltipPosition = () => {
    const padding = 20; // Space between element and tooltip
    const tooltipWidth = 320; // Estimated tooltip width
    const tooltipHeight = 200; // Estimated tooltip height
    
    if (currentStep.target === 'body') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    switch (currentStep.position) {
      case 'top':
        return {
          top: `${elementPosition.top - tooltipHeight - padding}px`,
          left: `${elementPosition.left + elementPosition.width / 2 - tooltipWidth / 2}px`
        };
      case 'right':
        return {
          top: `${elementPosition.top + elementPosition.height / 2 - tooltipHeight / 2}px`,
          left: `${elementPosition.left + elementPosition.width + padding}px`
        };
      case 'bottom':
        return {
          top: `${elementPosition.top + elementPosition.height + padding}px`,
          left: `${elementPosition.left + elementPosition.width / 2 - tooltipWidth / 2}px`
        };
      case 'left':
        return {
          top: `${elementPosition.top + elementPosition.height / 2 - tooltipHeight / 2}px`,
          left: `${elementPosition.left - tooltipWidth - padding}px`
        };
      default:
        return {
          top: `${elementPosition.top + elementPosition.height + padding}px`,
          left: `${elementPosition.left}px`
        };
    }
  };

  return (
    <AnimatePresence>
      {showTour && isElementVisible && (
        <motion.div
          className="fixed inset-0 z-[1000] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div 
            className="pointer-events-auto absolute" 
            style={getTooltipPosition()}
          >
            <Card className="w-[320px] shadow-lg border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                  {currentStep.title}
                  <SoundButton 
                    variant="ghost" 
                    size="icon" 
                    onClick={skipTour}
                    className="h-6 w-6"
                    soundEffect="notification"
                  >
                    <X className="h-4 w-4" />
                  </SoundButton>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{currentStep.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {currentStepIndex + 1} of {tourSteps.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!isFirstStep && (
                    <SoundButton 
                      variant="outline" 
                      size="sm" 
                      onClick={handlePrevStep}
                      soundEffect="click"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back
                    </SoundButton>
                  )}
                  <SoundButton 
                    variant="default" 
                    size="sm" 
                    onClick={handleNextStep}
                    soundEffect={isLastStep ? 'complete' : 'click'}
                  >
                    {isLastStep ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Finish
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </SoundButton>
                </div>
              </CardFooter>
            </Card>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}