import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

interface ScrollToTopProps {
  threshold?: number;
  right?: number;
  bottom?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

/**
 * Scroll to top button that appears when user scrolls down
 */
export default function ScrollToTop({
  threshold = 300,
  right = 20,
  bottom = 20,
  size = 'md',
  color = 'white',
  backgroundColor = 'var(--color-primary)',
  showLabel = false,
  label = 'Top',
  className = ''
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Size map for different button sizes
  const sizeMap = {
    sm: { button: 'h-8 w-8', icon: 'h-4 w-4', text: 'text-xs' },
    md: { button: 'h-10 w-10', icon: 'h-5 w-5', text: 'text-sm' },
    lg: { button: 'h-12 w-12', icon: 'h-6 w-6', text: 'text-base' }
  };

  // Check scroll position
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [threshold]);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          style={{ 
            position: 'fixed', 
            right: `${right}px`, 
            bottom: `${bottom}px`,
            backgroundColor,
            color,
            zIndex: 50
          }}
          className={`${
            showLabel ? 'px-4' : ''
          } ${
            sizeMap[size].button
          } rounded-full shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 ${className}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronUp className={sizeMap[size].icon} strokeWidth={2.5} />
          {showLabel && (
            <span className={`ml-1 ${sizeMap[size].text} font-medium`}>{label}</span>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}