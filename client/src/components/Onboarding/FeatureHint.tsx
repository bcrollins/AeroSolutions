import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { X, Lightbulb } from 'lucide-react';

interface FeatureHintProps {
  id: string;
  title: string;
  description: string;
  elementSelector?: string;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  persistent?: boolean;
  showAfter?: number; // Time in milliseconds to wait before showing
  children?: React.ReactNode;
}

/**
 * FeatureHint - Displays contextual hints for features
 */
const FeatureHint: React.FC<FeatureHintProps> = ({
  id,
  title,
  description,
  elementSelector,
  placement = 'bottom',
  className = '',
  persistent = false,
  showAfter = 1000,
  children,
}) => {
  const { preferences } = useOnboarding();
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  // Generate storage key for hint dismissal
  const storageKey = `rxai_hint_dismissed_${id}`;
  
  // Check if hint should be shown (based on user preferences and history)
  useEffect(() => {
    if (!preferences.showHints) return;
    
    // Check if hint was previously dismissed
    if (!persistent) {
      const isDismissed = localStorage.getItem(storageKey) === 'true';
      if (isDismissed) {
        setDismissed(true);
        return;
      }
    }
    
    // Delay showing the hint
    const timer = setTimeout(() => {
      setVisible(true);
    }, showAfter);
    
    return () => {
      clearTimeout(timer);
    };
  }, [preferences.showHints, persistent, storageKey, showAfter]);
  
  // Update hint position when it becomes visible
  useEffect(() => {
    if (!visible || !elementSelector) return;
    
    const calculatePosition = () => {
      const element = document.querySelector(elementSelector);
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      let newPosition = { top: 0, left: 0 };
      
      switch (placement) {
        case 'top':
          newPosition = {
            top: rect.top - 10,
            left: rect.left + rect.width / 2,
          };
          break;
        case 'right':
          newPosition = {
            top: rect.top + rect.height / 2,
            left: rect.right + 10,
          };
          break;
        case 'bottom':
          newPosition = {
            top: rect.bottom + 10,
            left: rect.left + rect.width / 2,
          };
          break;
        case 'left':
          newPosition = {
            top: rect.top + rect.height / 2,
            left: rect.left - 10,
          };
          break;
      }
      
      setPosition(newPosition);
    };
    
    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition);
    
    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
    };
  }, [visible, elementSelector, placement]);
  
  // Handle dismissal
  const handleDismiss = () => {
    setVisible(false);
    
    if (!persistent) {
      localStorage.setItem(storageKey, 'true');
      setDismissed(true);
    }
  };
  
  if (dismissed || !preferences.showHints) return null;
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`fixed z-50 ${className}`}
          style={
            elementSelector
              ? {
                  position: 'absolute',
                  top: position.top,
                  left: position.left,
                  transform: 
                    placement === 'top' ? 'translate(-50%, -100%)' : 
                    placement === 'right' ? 'translateY(-50%)' :
                    placement === 'bottom' ? 'translate(-50%, 0)' :
                    'translate(-100%, -50%)', // left
                }
              : {}
          }
        >
          <div className={`bg-white dark:bg-gray-800 border border-primary/20 rounded-lg shadow-lg p-3 max-w-xs ${!elementSelector ? 'relative' : ''}`}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={handleDismiss}
            >
              <X className="h-3 w-3" />
            </Button>
            
            <div className="flex items-start space-x-3">
              <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
                {children && <div className="mt-2">{children}</div>}
              </div>
            </div>
            
            {/* Arrow for positioned hints */}
            {elementSelector && (
              <div
                className={`absolute ${
                  placement === 'top'
                    ? 'bottom-[-8px] left-1/2 transform -translate-x-1/2 border-t border-l'
                    : placement === 'right'
                    ? 'left-[-8px] top-1/2 transform -translate-y-1/2 border-r border-t'
                    : placement === 'bottom'
                    ? 'top-[-8px] left-1/2 transform -translate-x-1/2 border-b border-r'
                    : 'right-[-8px] top-1/2 transform -translate-y-1/2 border-l border-b'
                } h-4 w-4 bg-white dark:bg-gray-800 border-primary/20 rotate-45`}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeatureHint;