import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { FadeIn, ButtonPress } from '@/components/UI/MicroInteractions';

// Define tour steps by page route
const tourStepsByRoute: Record<string, TourStep[]> = {
  '/': [
    {
      id: 'home-welcome',
      title: 'Welcome to RXAI',
      description: 'Your journey into AI education starts here. This tour will guide you through the key features of our platform.',
      target: '.hero-section', // CSS selector for element to highlight
      position: 'bottom',
    },
    {
      id: 'home-courses',
      title: 'Featured Courses',
      description: 'Explore our handpicked collection of cutting-edge AI courses designed for all skill levels.',
      target: '.featured-courses',
      position: 'bottom',
    },
    {
      id: 'home-navigation',
      title: 'Easy Navigation',
      description: 'Access all platform features from the main navigation bar at the top.',
      target: 'nav',
      position: 'bottom',
    },
  ],
  '/dashboard': [
    {
      id: 'dashboard-welcome',
      title: 'Your Personal Dashboard',
      description: 'Track your progress, view achievements, and discover new courses all in one place.',
      target: 'header',
      position: 'bottom',
    },
    {
      id: 'dashboard-stats',
      title: 'Learning Statistics',
      description: 'These cards show your current progress and achievements at a glance.',
      target: '.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4',
      position: 'bottom',
    },
    {
      id: 'dashboard-courses',
      title: 'Your Courses',
      description: 'Access all your enrolled courses here and continue where you left off.',
      target: '.space-y-6:has(h2)',
      position: 'right',
    },
    {
      id: 'dashboard-activity',
      title: 'Recent Activity',
      description: 'Track your recent accomplishments and upcoming events in these panels.',
      target: '.space-y-6:has(>div>div>div.h-5.w-5.text-primary)',
      position: 'left',
    },
  ],
  '/courses': [
    {
      id: 'courses-catalog',
      title: 'Course Catalog',
      description: 'Browse our full collection of courses and filter by category, difficulty, or duration.',
      target: '.course-catalog',
      position: 'top',
    },
    {
      id: 'courses-search',
      title: 'Search & Filter',
      description: 'Quickly find courses that match your interests and skill level.',
      target: '.search-filters',
      position: 'bottom',
    },
    {
      id: 'courses-enrollment',
      title: 'Enrollment',
      description: 'Click the "Enroll" button to start learning. You can track your progress from your dashboard.',
      target: '.enroll-button',
      position: 'left',
    },
  ],
};

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  position: 'top' | 'right' | 'bottom' | 'left';
}

interface OnboardingTourProps {
  forceTour?: boolean;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ forceTour = false }) => {
  const [location] = useLocation();
  const [hasCompletedTour, setHasCompletedTour] = useLocalStorage('rxai-completed-tour', false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [targetElement, setTargetElement] = useState<DOMRect | null>(null);
  const [steps, setSteps] = useState<TourStep[]>([]);

  // Check if tour should be shown for the current page
  useEffect(() => {
    const routeKey = Object.keys(tourStepsByRoute).find(route => 
      route === location || (route === '/' && location === '')
    ) || '';
    
    if (routeKey && (forceTour || !hasCompletedTour)) {
      setSteps(tourStepsByRoute[routeKey]);
      setActiveStep(0);
      
      // Slight delay to ensure page has rendered
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [location, forceTour, hasCompletedTour]);

  // Find and track the target element position
  useEffect(() => {
    if (!isVisible || steps.length === 0 || activeStep >= steps.length) return;
    
    const currentStep = steps[activeStep];
    const targetEl = document.querySelector(currentStep.target);
    
    if (targetEl) {
      const updateTargetPosition = () => {
        setTargetElement(targetEl.getBoundingClientRect());
      };
      
      updateTargetPosition();
      
      // Update position on resize
      window.addEventListener('resize', updateTargetPosition);
      
      return () => {
        window.removeEventListener('resize', updateTargetPosition);
      };
    } else {
      // If element not found, move to next step
      goToNextStep();
    }
  }, [steps, activeStep, isVisible]);

  // Calculate tour card position based on target element and specified position
  const calculatePosition = (): React.CSSProperties => {
    if (!targetElement) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    const currentStep = steps[activeStep];
    const margin = 16; // Space between target and tour card
    
    let top, left;
    
    switch (currentStep.position) {
      case 'top':
        top = targetElement.top - margin;
        left = targetElement.left + (targetElement.width / 2);
        return { 
          bottom: `calc(100vh - ${top}px)`, 
          left: `${left}px`, 
          transform: 'translateX(-50%)',
        };
      case 'right':
        top = targetElement.top + (targetElement.height / 2);
        left = targetElement.right + margin;
        return { 
          top: `${top}px`, 
          left: `${left}px`, 
          transform: 'translateY(-50%)',
        };
      case 'bottom':
        top = targetElement.bottom + margin;
        left = targetElement.left + (targetElement.width / 2);
        return { 
          top: `${top}px`, 
          left: `${left}px`, 
          transform: 'translateX(-50%)',
        };
      case 'left':
        top = targetElement.top + (targetElement.height / 2);
        left = targetElement.left - margin;
        return { 
          top: `${top}px`, 
          right: `calc(100vw - ${left}px)`, 
          transform: 'translateY(-50%)',
        };
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  const completeTour = () => {
    setIsVisible(false);
    setHasCompletedTour(true);
  };

  const goToNextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      completeTour();
    }
  };

  const goToPrevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const skipTour = () => {
    completeTour();
  };

  if (!isVisible || steps.length === 0 || activeStep >= steps.length) return null;

  const currentStep = steps[activeStep];
  const position = calculatePosition();
  
  // Add highlight effect to target element
  useEffect(() => {
    if (targetElement) {
      const targetEl = document.querySelector(currentStep.target);
      if (targetEl) {
        // Add temporary highlight class
        targetEl.classList.add('tour-highlight');
        // Clean up by removing highlight when tour moves or ends
        return () => {
          targetEl.classList.remove('tour-highlight');
        };
      }
    }
  }, [targetElement, currentStep]);

  return (
    <>
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-black/40 z-[999]" 
        onClick={skipTour}
      />
      
      {/* Tour card */}
      <FadeIn>
        <div 
          className="fixed z-[1000] w-[320px] max-w-[90vw]"
          style={position}
        >
          <Card className="shadow-xl border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  {currentStep.title}
                </CardTitle>
                <ButtonPress>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={skipTour}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </ButtonPress>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {currentStep.description}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <div className="flex items-center gap-1">
                {steps.map((_, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === activeStep 
                        ? "w-5 bg-primary" 
                        : i < activeStep 
                          ? "w-1.5 bg-primary/60" 
                          : "w-1.5 bg-gray-300 dark:bg-gray-600"
                    )}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                {activeStep > 0 && (
                  <ButtonPress>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPrevStep}
                      className="h-8"
                    >
                      Back
                    </Button>
                  </ButtonPress>
                )}
                <ButtonPress>
                  <Button
                    size="sm"
                    onClick={goToNextStep}
                    className="h-8 flex items-center gap-1"
                  >
                    {activeStep === steps.length - 1 ? (
                      <>
                        Finish
                        <CheckCircle className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </ButtonPress>
              </div>
            </CardFooter>
          </Card>
        </div>
      </FadeIn>
    </>
  );
};

export default OnboardingTour;