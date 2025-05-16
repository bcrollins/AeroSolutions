import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
  withHover?: boolean;
  hoverScale?: number;
  hoverRotate?: number;
  initialAnimation?: 'fade' | 'slide' | 'scale' | 'none';
  animateOnScroll?: boolean;
}

/**
 * A beautiful animated card component with various animation options
 */
const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  delay = 0,
  onClick,
  withHover = true,
  hoverScale = 1.02,
  hoverRotate = 0,
  initialAnimation = 'fade',
  animateOnScroll = false
}) => {
  const [isVisible, setIsVisible] = useState(!animateOnScroll);

  // Animation variants
  const getInitialAnimationVariants = () => {
    switch (initialAnimation) {
      case 'fade':
        return {
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: { 
              duration: 0.6,
              delay: delay * 0.15,
              ease: [0.25, 0.1, 0.25, 1]
            }
          }
        };
        
      case 'slide':
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
              duration: 0.5,
              delay: delay * 0.15,
              ease: [0.25, 0.1, 0.25, 1]
            }
          }
        };
        
      case 'scale':
        return {
          hidden: { opacity: 0, scale: 0.9 },
          visible: { 
            opacity: 1, 
            scale: 1,
            transition: { 
              duration: 0.4,
              delay: delay * 0.15,
              ease: [0.34, 1.56, 0.64, 1]
            }
          }
        };
        
      case 'none':
      default:
        return {
          hidden: { opacity: 1 },
          visible: { opacity: 1 }
        };
    }
  };

  // Get hover animation
  const getHoverAnimation = () => {
    if (!withHover) return {};
    
    return {
      scale: hoverScale,
      rotate: hoverRotate,
      transition: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }
    };
  };

  // Intersection observer for scroll animation
  React.useEffect(() => {
    if (!animateOnScroll) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    const element = document.getElementById(`animated-card-${delay}`);
    if (element) observer.observe(element);
    
    return () => {
      if (element) observer.unobserve(element);
    };
  }, [animateOnScroll, delay]);

  return (
    <motion.div
      id={`animated-card-${delay}`}
      className={cn(
        'rounded-lg overflow-hidden bg-card border border-border shadow-sm',
        onClick && 'cursor-pointer',
        className
      )}
      initial={animateOnScroll ? "hidden" : "visible"}
      animate={isVisible ? "visible" : "hidden"}
      variants={getInitialAnimationVariants()}
      whileHover={getHoverAnimation()}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;