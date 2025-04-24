import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface TourStep {
  targetSelector: string;
  title: string;
  content: React.ReactNode;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  onNext?: () => void;
  onPrevious?: () => void;
}

interface GuidedTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  showOverlay?: boolean;
  startAt?: number;
}

const GuidedTour: React.FC<GuidedTourProps> = ({
  steps,
  isOpen,
  onClose,
  onComplete,
  showOverlay = true,
  startAt = 0,
}) => {
  const [currentStep, setCurrentStep] = useState(startAt);
  const [popperStyles, setPopperStyles] = useState<React.CSSProperties>({});
  const [targetStyles, setTargetStyles] = useState<React.CSSProperties>({});
  const [arrowStyles, setArrowStyles] = useState<React.CSSProperties>({});
  const popperRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Reset state when tour is opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(startAt);
    }
  }, [isOpen, startAt]);

  useEffect(() => {
    if (!isOpen || !steps.length) return;

    const calculatePosition = () => {
      const step = steps[currentStep];
      const target = document.querySelector(step.targetSelector);

      if (!target || !popperRef.current) {
        // If target element not found, show error
        toast({
          title: 'Tour error',
          description: `Element "${step.targetSelector}" not found`,
          type: 'default'
        });
        return;
      }

      const targetRect = target.getBoundingClientRect();
      const placement = step.placement || 'bottom';

      // Get window dimensions
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Highlight target
      setTargetStyles({
        position: 'absolute',
        top: `${targetRect.top}px`,
        left: `${targetRect.left}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
        zIndex: 1000,
        boxShadow: '0 0 0 4000px rgba(0, 0, 0, 0.5)',
        borderRadius: '4px',
      });

      // Calculate popper position
      let top = 0;
      let left = 0;
      let arrowTop = 0;
      let arrowLeft = 0;
      const popperWidth = 320; // Fixed width for popper
      const arrowSize = 8; // Size of the arrow
      const margin = 12; // Margin between target and popper

      switch (placement) {
        case 'top':
          top = targetRect.top - margin;
          left = targetRect.left + targetRect.width / 2 - popperWidth / 2;
          arrowTop = '100%'; // Using percentage values for CSS positioning
          arrowLeft = '50%'; // Using percentage values for CSS positioning
          break;
        case 'right':
          top = targetRect.top + targetRect.height / 2 - 100;
          left = targetRect.right + margin;
          arrowTop = '50%'; // Using percentage values for CSS positioning
          arrowLeft = `-${arrowSize}px`; // String template for CSS values
          break;
        case 'bottom':
          top = targetRect.bottom + margin;
          left = targetRect.left + targetRect.width / 2 - popperWidth / 2;
          arrowTop = `-${arrowSize}px`; // String template for CSS values
          arrowLeft = '50%'; // Using percentage values for CSS positioning
          break;
        case 'left':
          top = targetRect.top + targetRect.height / 2 - 100;
          left = targetRect.left - popperWidth - margin;
          arrowTop = '50%'; // Using percentage values for CSS positioning
          arrowLeft = '100%'; // Using percentage values for CSS positioning
          break;
      }

      // Adjust if popper goes off screen
      if (left < 20) left = 20;
      if (left + popperWidth > windowWidth - 20) left = windowWidth - popperWidth - 20;
      if (top < 20) top = 20;
      if (top + 200 > windowHeight - 20) top = windowHeight - 200 - 20;

      setPopperStyles({
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        width: `${popperWidth}px`,
        zIndex: 1001,
      });

      setArrowStyles({
        position: 'absolute',
        top: arrowTop,
        left: arrowLeft,
        transform: 'translate(-50%, -50%)',
        width: `${arrowSize * 2}px`,
        height: `${arrowSize * 2}px`,
        backgroundColor: 'white',
        borderRadius: '2px',
        zIndex: 1000,
      });
    };

    // Calculate position initially and on window resize
    calculatePosition();
    window.addEventListener('resize', calculatePosition);

    // Scroll target into view
    const target = document.querySelector(steps[currentStep].targetSelector);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }

    return () => {
      window.removeEventListener('resize', calculatePosition);
    };
  }, [currentStep, isOpen, steps, toast]);

  if (!isOpen || steps.length === 0) return null;

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handlePrevious = () => {
    if (isFirstStep) return;
    
    // Execute onPrevious callback if provided
    if (currentStepData.onPrevious) {
      currentStepData.onPrevious();
    }
    
    setCurrentStep(currentStep - 1);
  };

  const handleNext = () => {
    // Execute onNext callback if provided
    if (currentStepData.onNext) {
      currentStepData.onNext();
    }
    
    if (isLastStep) {
      if (onComplete) onComplete();
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      {showOverlay && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
          onClick={onClose}
        />
      )}

      {/* Target highlight */}
      <div style={targetStyles} />

      {/* Tooltip */}
      <div 
        ref={popperRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
        style={popperStyles}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-lg">{currentStepData.title}</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <div className="my-2 text-sm text-gray-600 dark:text-gray-300">
            {currentStepData.content}
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button 
                size="sm" 
                onClick={handleNext}
                className="gap-1"
              >
                {isLastStep ? 'Finish' : 'Next'}
                {!isLastStep && <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        <div style={arrowStyles} />
      </div>
    </div>
  );
};

export default GuidedTour;