import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  transition?: 'fade' | 'slide' | 'scale' | 'none';
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  delay?: number;
  staggerChildren?: boolean;
  staggerDelay?: number;
  onAnimationComplete?: () => void;
}

/**
 * Animation wrapper for page transitions
 */
export default function PageTransition({
  children,
  className = '',
  transition = 'fade',
  direction = 'right',
  duration = 0.4,
  delay = 0,
  staggerChildren = false,
  staggerDelay = 0.1,
  onAnimationComplete
}: PageTransitionProps) {
  const [location] = useLocation();
  
  // Slide animations based on direction
  const slideVariants = {
    left: {
      initial: { x: 20, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -20, opacity: 0 }
    },
    right: {
      initial: { x: -20, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 20, opacity: 0 }
    },
    up: {
      initial: { y: 20, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -20, opacity: 0 }
    },
    down: {
      initial: { y: -20, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 20, opacity: 0 }
    }
  };
  
  // Define animation variants
  const getVariants = () => {
    switch (transition) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
      case 'slide':
        return slideVariants[direction];
      case 'scale':
        return {
          initial: { scale: 0.95, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.95, opacity: 0 }
        };
      case 'none':
      default:
        return {
          initial: {},
          animate: {},
          exit: {}
        };
    }
  };
  
  const variants = getVariants();
  
  // Add staggered children animations if enabled
  const containerVariants = staggerChildren
    ? {
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay
          }
        },
        exit: { opacity: 0 }
      }
    : {};
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={staggerChildren ? containerVariants : variants}
        transition={{
          duration,
          delay: staggerChildren ? 0 : delay,
          ease: [0.16, 1, 0.3, 1], // Ease out expo (Apple-like)
        }}
        onAnimationComplete={onAnimationComplete}
        className={className}
      >
        {staggerChildren ? (
          // If staggering children, we apply animation to each child
          React.Children.map(children, (child, i) => {
            if (!React.isValidElement(child)) return child;
            
            return (
              <motion.div
                key={i}
                variants={variants}
                transition={{
                  duration,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {child}
              </motion.div>
            );
          })
        ) : (
          // Otherwise just return the children
          children
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Section transition for animating page sections as they appear in viewport
 */
export function SectionTransition({
  children,
  className = '',
  transition = 'fade',
  direction = 'up',
  duration = 0.5,
  delay = 0,
  threshold = 0.1,
  staggerChildren = false,
  staggerDelay = 0.1,
  triggerOnce = true
}: PageTransitionProps & {
  threshold?: number;
  triggerOnce?: boolean;
}) {
  // Slide animations based on direction
  const slideVariants = {
    left: {
      hidden: { x: -50, opacity: 0 },
      visible: { x: 0, opacity: 1 }
    },
    right: {
      hidden: { x: 50, opacity: 0 },
      visible: { x: 0, opacity: 1 }
    },
    up: {
      hidden: { y: 50, opacity: 0 },
      visible: { y: 0, opacity: 1 }
    },
    down: {
      hidden: { y: -50, opacity: 0 },
      visible: { y: 0, opacity: 1 }
    }
  };
  
  // Define animation variants
  const getVariants = () => {
    switch (transition) {
      case 'fade':
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        };
      case 'slide':
        return slideVariants[direction];
      case 'scale':
        return {
          hidden: { scale: 0.9, opacity: 0 },
          visible: { scale: 1, opacity: 1 }
        };
      case 'none':
      default:
        return {
          hidden: {},
          visible: {}
        };
    }
  };
  
  const variants = getVariants();
  
  // Container variants for staggered children
  const containerVariants = staggerChildren
    ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay
          }
        }
      }
    : {};
  
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: triggerOnce, threshold }}
      variants={staggerChildren ? containerVariants : variants}
      transition={{
        duration,
        delay: staggerChildren ? 0 : delay,
        ease: [0.16, 1, 0.3, 1], // Ease out expo (Apple-like)
      }}
      className={className}
    >
      {staggerChildren ? (
        // If staggering children, apply animation to each child
        React.Children.map(children, (child, i) => {
          if (!React.isValidElement(child)) return child;
          
          return (
            <motion.div
              key={i}
              variants={variants}
              transition={{
                duration,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {child}
            </motion.div>
          );
        })
      ) : (
        // Otherwise just return the children
        children
      )}
    </motion.div>
  );
}