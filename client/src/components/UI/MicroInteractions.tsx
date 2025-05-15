import React, { ReactNode, forwardRef } from 'react';
import { motion, AnimatePresence, MotionProps, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

// Fade In animation
interface FadeInProps extends MotionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  once?: boolean;
  style?: React.CSSProperties;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  className,
  delay = 0,
  duration = 0.3,
  direction = 'none',
  distance = 20,
  once = true,
  style,
  ...props
}) => {
  const getDirectionOffset = () => {
    switch (direction) {
      case 'up':
        return { y: distance };
      case 'down':
        return { y: -distance };
      case 'left':
        return { x: distance };
      case 'right':
        return { x: -distance };
      default:
        return {};
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...getDirectionOffset() }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...getDirectionOffset() }}
      transition={{ 
        duration, 
        delay,
        ease: 'easeOut'
      }}
      viewport={{ once }}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Scale In animation
interface ScaleInProps extends MotionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  initialScale?: number;
  once?: boolean;
  style?: React.CSSProperties;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  className,
  delay = 0,
  duration = 0.3,
  initialScale = 0.95,
  once = true,
  style,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: initialScale }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: initialScale }}
      transition={{ 
        duration, 
        delay,
        ease: [0.23, 1, 0.32, 1] // Ease out cubic
      }}
      viewport={{ once }}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Button Press animation (for interactive elements)
interface ButtonPressProps extends MotionProps {
  children: ReactNode;
  className?: string;
  scale?: number;
  style?: React.CSSProperties;
  as?: React.ElementType;
}

export const ButtonPress = forwardRef<HTMLDivElement, ButtonPressProps>(({
  children,
  className,
  scale = 0.97,
  style,
  as = motion.div,
  ...props
}, ref) => {
  const Component = as as any;
  
  return (
    <Component
      ref={ref}
      whileTap={{ scale }}
      whileHover={{ scale: 1.02 }}
      transition={{ 
        duration: 0.15,
        ease: 'easeInOut'
      }}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
});

ButtonPress.displayName = 'ButtonPress';

// Hover Scale animation
interface HoverScaleProps extends MotionProps {
  children: ReactNode;
  className?: string;
  scale?: number;
  style?: React.CSSProperties;
  as?: React.ElementType;
}

export const HoverScale = forwardRef<HTMLDivElement, HoverScaleProps>(({
  children,
  className,
  scale = 1.05,
  style,
  as = motion.div,
  ...props
}, ref) => {
  const Component = as as any;
  
  return (
    <Component
      ref={ref}
      whileHover={{ scale }}
      transition={{ 
        duration: 0.2,
        ease: 'easeInOut'
      }}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
});

HoverScale.displayName = 'HoverScale';

// Float animation (subtle up-down movement)
interface FloatProps extends MotionProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  distance?: number;
  delay?: number;
  style?: React.CSSProperties;
}

export const Float: React.FC<FloatProps> = ({
  children,
  className,
  duration = 3,
  distance = 10,
  delay = 0,
  style,
  ...props
}) => {
  return (
    <motion.div
      animate={{ 
        y: [0, -distance/2, 0, distance/2, 0],
      }}
      transition={{ 
        duration,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
        delay,
      }}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Pulse animation
interface PulseProps extends MotionProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  scale?: number;
  delay?: number;
  style?: React.CSSProperties;
}

export const Pulse: React.FC<PulseProps> = ({
  children,
  className,
  duration = 2,
  scale = 1.05,
  delay = 0,
  style,
  ...props
}) => {
  return (
    <motion.div
      animate={{ 
        scale: [1, scale, 1],
      }}
      transition={{ 
        duration,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
        delay,
      }}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Stagger Children animation
interface StaggerChildrenProps extends MotionProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  childrenDelay?: number;
  childrenDuration?: number;
  direction?: 'forward' | 'reverse';
  animation?: 'fadeIn' | 'scaleIn';
  style?: React.CSSProperties;
}

export const StaggerChildren: React.FC<StaggerChildrenProps> = ({
  children,
  className,
  staggerDelay = 0.1,
  childrenDelay = 0,
  childrenDuration = 0.3,
  direction = 'forward',
  animation = 'fadeIn',
  style,
  ...props
}) => {
  // Convert children to array to handle them individually
  const childrenArray = React.Children.toArray(children);
  const orderedChildren = direction === 'forward' ? childrenArray : [...childrenArray].reverse();
  
  return (
    <div className={className} style={style} {...props}>
      {orderedChildren.map((child, index) => {
        const delay = childrenDelay + (index * staggerDelay);
        
        if (animation === 'fadeIn') {
          return (
            <FadeIn key={index} delay={delay} duration={childrenDuration}>
              {child}
            </FadeIn>
          );
        }
        
        return (
          <ScaleIn key={index} delay={delay} duration={childrenDuration}>
            {child}
          </ScaleIn>
        );
      })}
    </div>
  );
};

// Shimmer animation for loading states
interface ShimmerProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  gradient?: boolean;
}

export const Shimmer: React.FC<ShimmerProps> = ({
  className,
  width = '100%',
  height = '100%',
  borderRadius = '0.25rem',
  gradient = true,
}) => {
  return (
    <div 
      className={cn(
        'relative overflow-hidden bg-gray-200 dark:bg-gray-700',
        className
      )}
      style={{ 
        width, 
        height, 
        borderRadius,
      }}
    >
      {gradient && (
        <motion.div
          className="absolute inset-0 -translate-x-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
          }}
          animate={{ x: ['calc(-100%)', 'calc(100%)'] }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: 'linear',
            repeatType: 'loop',
          }}
        />
      )}
    </div>
  );
};

// Slide In animation
interface SlideInProps extends MotionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  once?: boolean;
  style?: React.CSSProperties;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  className,
  delay = 0,
  duration = 0.4,
  direction = 'up',
  distance = 50,
  once = true,
  style,
  ...props
}) => {
  const getDirectionOffset = () => {
    switch (direction) {
      case 'up':
        return { y: distance };
      case 'down':
        return { y: -distance };
      case 'left':
        return { x: distance };
      case 'right':
        return { x: -distance };
      default:
        return { y: distance };
    }
  };

  return (
    <motion.div
      initial={getDirectionOffset()}
      animate={{ x: 0, y: 0 }}
      exit={getDirectionOffset()}
      transition={{ 
        duration, 
        delay,
        ease: [0.23, 1, 0.32, 1] // Ease out cubic
      }}
      viewport={{ once }}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Expand animation (for accordions, dropdowns, etc.)
interface ExpandProps extends MotionProps {
  children: ReactNode;
  className?: string;
  isOpen: boolean;
  duration?: number;
  style?: React.CSSProperties;
}

export const Expand: React.FC<ExpandProps> = ({
  children,
  className,
  isOpen,
  duration = 0.3,
  style,
  ...props
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
          animate={{ 
            height: 'auto', 
            opacity: 1,
            transition: { 
              height: { duration, ease: [0.33, 1, 0.68, 1] },
              opacity: { duration: duration * 0.7, delay: duration * 0.3 }
            }
          }}
          exit={{ 
            height: 0, 
            opacity: 0,
            transition: { 
              height: { duration, ease: [0.33, 1, 0.68, 1] },
              opacity: { duration: duration * 0.4 }
            }
          }}
          className={className}
          style={style}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Flip animation
interface FlipProps extends MotionProps {
  children: ReactNode;
  className?: string;
  isFlipped: boolean;
  duration?: number;
  style?: React.CSSProperties;
}

export const Flip: React.FC<FlipProps> = ({
  children,
  className,
  isFlipped,
  duration = 0.6,
  style,
  ...props
}) => {
  return (
    <motion.div
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ 
        duration,
        ease: [0.23, 1, 0.32, 1] // Ease out cubic
      }}
      className={className}
      style={{ 
        ...style,
        perspective: '1200px',
        transformStyle: 'preserve-3d',
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Spring animation
interface SpringProps extends MotionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  stiffness?: number;
  damping?: number;
  style?: React.CSSProperties;
}

export const Spring: React.FC<SpringProps> = ({
  children,
  className,
  delay = 0,
  stiffness = 100,
  damping = 10,
  style,
  ...props
}) => {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: 'spring',
        stiffness,
        damping,
        delay,
      }}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Scroll progression animation
interface ScrollProgressProps {
  children: (progress: number) => ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({
  children,
  className,
  style,
}) => {
  const [scrollY, setScrollY] = React.useState(0);
  
  React.useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPosition = window.scrollY;
      
      const totalScroll = documentHeight - windowHeight;
      const progress = Math.min(Math.max(scrollPosition / totalScroll, 0), 1);
      
      setScrollY(progress);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className={className} style={style}>
      {children(scrollY)}
    </div>
  );
};

// Export all animations
export const MicroInteractions = {
  FadeIn,
  ScaleIn,
  ButtonPress,
  HoverScale,
  Float,
  Pulse,
  StaggerChildren,
  Shimmer,
  SlideIn,
  Expand,
  Flip,
  Spring,
  ScrollProgress,
};