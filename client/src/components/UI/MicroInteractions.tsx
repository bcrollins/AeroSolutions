import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence, Variants } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Common animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  exit: { y: -20, opacity: 0, transition: { duration: 0.3 } }
};

const slideInLeft: Variants = {
  hidden: { x: -50, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { x: -50, opacity: 0, transition: { duration: 0.3 } }
};

const slideInRight: Variants = {
  hidden: { x: 50, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { x: 50, opacity: 0, transition: { duration: 0.3 } }
};

const scaleIn: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { scale: 0.8, opacity: 0, transition: { duration: 0.3 } }
};

/**
 * ButtonPress - Adds a subtle press animation to buttons
 */
export const ButtonPress: React.FC<React.ComponentProps<typeof motion.div>> = ({ 
  children, 
  className,
  ...props 
}) => {
  return (
    <motion.div
      className={cn("inline-block", className)}
      whileTap={{ scale: 0.97 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * HoverScale - Adds a subtle scale effect on hover
 */
export const HoverScale: React.FC<React.ComponentProps<typeof motion.div> & { scale?: number }> = ({ 
  children, 
  className,
  scale = 1.03,
  ...props 
}) => {
  return (
    <motion.div
      className={cn("inline-block", className)}
      whileHover={{ scale }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Float - Creates a subtle floating animation
 */
export const Float: React.FC<React.ComponentProps<typeof motion.div> & { 
  amplitude?: number;
  duration?: number;
}> = ({ 
  children, 
  className,
  amplitude = 10,
  duration = 4,
  ...props 
}) => {
  return (
    <motion.div
      className={cn(className)}
      animate={{ 
        y: [0, -amplitude, 0], 
      }}
      transition={{ 
        duration, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Pulse - Creates a pulse animation
 */
export const Pulse: React.FC<React.ComponentProps<typeof motion.div>> = ({ 
  children, 
  className,
  ...props 
}) => {
  return (
    <motion.div
      className={cn(className)}
      animate={{ 
        scale: [1, 1.05, 1],
        opacity: [0.8, 1, 0.8]
      }}
      transition={{ 
        duration: 2, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * StaggerChildren - Parent component that staggers animations of children
 */
export const StaggerChildren: React.FC<React.ComponentProps<typeof motion.div> & {
  staggerDelay?: number;
}> = ({ 
  children, 
  className,
  staggerDelay = 0.1,
  ...props 
}) => {
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * StaggerItem - Child item to be used within StaggerChildren
 */
export const StaggerItem: React.FC<React.ComponentProps<typeof motion.div>> = ({ 
  children, 
  className,
  ...props 
}) => {
  return (
    <motion.div
      className={cn(className)}
      variants={slideUp}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * RevealText - Reveals text one character at a time
 */
export const RevealText: React.FC<{
  text: string;
  className?: string;
  charDelay?: number;
  style?: React.CSSProperties;
}> = ({ 
  text, 
  className,
  charDelay = 0.05,
  style
}) => {
  return (
    <span className={cn(className)} style={style}>
      <StaggerChildren staggerDelay={charDelay}>
        {text.split('').map((char, index) => (
          <motion.span
            key={`${char}-${index}`}
            variants={{
              hidden: { opacity: 0, y: 5 },
              visible: { opacity: 1, y: 0 }
            }}
            style={{ display: 'inline-block', whiteSpace: 'pre' }}
          >
            {char}
          </motion.span>
        ))}
      </StaggerChildren>
    </span>
  );
};

/**
 * Skeleton component for loading states
 */
export const Skeleton: React.FC<{
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  pulsate?: boolean;
}> = ({ 
  className,
  width,
  height,
  circle = false,
  pulsate = true
}) => {
  const style: React.CSSProperties = {
    width,
    height,
    borderRadius: circle ? '50%' : '0.25rem',
  };

  return (
    <div 
      className={cn(
        "bg-neutral-200 dark:bg-neutral-800",
        pulsate && "animate-pulse",
        className
      )} 
      style={style}
    />
  );
};

/**
 * Animated checkmark component
 */
export const Checkmark: React.FC<{
  className?: string;
  checked?: boolean;
  size?: number;
}> = ({ 
  className,
  checked = true,
  size = 20
}) => {
  return (
    <div className={cn("relative", className)}>
      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="bg-primary rounded-full flex items-center justify-center"
            style={{ width: size, height: size }}
          >
            <Check 
              className="text-white" 
              size={size * 0.6} 
              strokeWidth={3} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * CountUp animation for numbers
 */
export const CountUp: React.FC<{
  end: number;
  start?: number;
  duration?: number;
  decimals?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  delay?: number;
}> = ({ 
  end, 
  start = 0, 
  duration = 2,
  decimals = 0,
  className,
  prefix = '',
  suffix = '',
  delay = 0
}) => {
  const [count, setCount] = useState(start);
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const endValue = end;
  
  const animate = (time: number) => {
    if (startTimeRef.current === undefined) {
      startTimeRef.current = time;
    }
    
    const elapsed = time - startTimeRef.current;
    const progress = Math.min(elapsed / (duration * 1000), 1);
    
    const currentCount = start + progress * (endValue - start);
    setCount(currentCount);
    
    if (progress < 1) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (delay) {
      timeout = setTimeout(() => {
        requestRef.current = requestAnimationFrame(animate);
      }, delay * 1000);
    } else {
      requestRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [end]);
  
  return (
    <span className={className}>
      {prefix}{count.toFixed(decimals)}{suffix}
    </span>
  );
};

/**
 * FadeIn - Fades in an element when it enters the viewport
 */
export const FadeIn: React.FC<React.ComponentProps<typeof motion.div> & {
  delay?: number;
  duration?: number;
}> = ({ 
  children, 
  className,
  delay = 0,
  duration = 0.5,
  ...props 
}) => {
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: { 
            duration,
            delay,
            ease: "easeOut"
          }
        },
        exit: { 
          opacity: 0,
          transition: { duration: 0.2 }
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * SlideIn - Slides in an element when it enters the viewport
 */
export const SlideIn: React.FC<React.ComponentProps<typeof motion.div> & {
  delay?: number;
  duration?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
}> = ({ 
  children, 
  className,
  delay = 0,
  duration = 0.5,
  direction = 'left',
  distance = 50,
  ...props 
}) => {
  const getDirectionValues = () => {
    switch (direction) {
      case 'left': return { x: -distance, y: 0 };
      case 'right': return { x: distance, y: 0 };
      case 'up': return { x: 0, y: -distance };
      case 'down': return { x: 0, y: distance };
      default: return { x: -distance, y: 0 };
    }
  };

  const { x, y } = getDirectionValues();

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: { x, y, opacity: 0 },
        visible: { 
          x: 0, 
          y: 0,
          opacity: 1, 
          transition: { 
            duration,
            delay,
            ease: "easeOut" 
          }
        },
        exit: { 
          x: x / 2, 
          y: y / 2,
          opacity: 0, 
          transition: { duration: 0.2 }
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * ScaleIn - Scales in an element when it enters the viewport
 */
export const ScaleIn: React.FC<React.ComponentProps<typeof motion.div> & {
  delay?: number;
  duration?: number;
  initialScale?: number;
}> = ({ 
  children, 
  className,
  delay = 0,
  duration = 0.5,
  initialScale = 0.8,
  ...props 
}) => {
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: { scale: initialScale, opacity: 0 },
        visible: { 
          scale: 1,
          opacity: 1, 
          transition: { 
            duration,
            delay,
            ease: "easeOut" 
          }
        },
        exit: { 
          scale: initialScale,
          opacity: 0, 
          transition: { duration: 0.2 }
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Shimmer - Creates a shimmer effect across an element
 */
export const Shimmer: React.FC<React.ComponentProps<typeof motion.div> & {
  duration?: number;
  delay?: number;
  angle?: number;
  width?: number;
}> = ({ 
  children, 
  className,
  duration = 2.5,
  delay = 0,
  angle = 45,
  width = 50,
  ...props 
}) => {
  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      {children}
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{
          background: `linear-gradient(${angle}deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)`,
          left: `-${width * 2}%`,
        }}
        animate={{
          left: `${100 + width}%`,
          transition: {
            duration,
            delay,
            repeat: Infinity,
            repeatDelay: 1,
            ease: "linear"
          }
        }}
        style={{ width: `${width}%` }}
      />
    </motion.div>
  );
};