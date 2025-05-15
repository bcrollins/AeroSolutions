import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MicroInteractionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  repeat?: number | boolean;
  as?: React.ElementType;
}

// Slide In Animation
interface SlideInProps extends MicroInteractionProps {
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
}

export const SlideIn = ({ 
  children, 
  className = '', 
  delay = 0, 
  duration = 0.5, 
  direction = 'up', 
  distance = 20,
  as = motion.div 
}: SlideInProps) => {
  const Component = as;
  
  const getDirectionValues = () => {
    switch (direction) {
      case 'left': return { x: -distance, y: 0 };
      case 'right': return { x: distance, y: 0 };
      case 'up': return { x: 0, y: -distance };
      case 'down': return { x: 0, y: distance };
      default: return { x: 0, y: -distance };
    }
  };
  
  const { x, y } = getDirectionValues();
  
  return (
    <Component
      initial={{ x, y, opacity: 0 }}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{ 
        duration, 
        delay, 
        ease: 'easeOut' 
      }}
      data-animation="slide-in"
      className={cn(className)}
    >
      {children}
    </Component>
  );
};

// Fade In Animation
export const FadeIn = ({ 
  children, 
  className = '', 
  delay = 0, 
  duration = 0.5,
  as = motion.div 
}: MicroInteractionProps) => {
  const Component = as;
  
  return (
    <Component
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        duration, 
        delay, 
        ease: 'easeInOut' 
      }}
      data-animation="fade-in"
      className={cn(className)}
    >
      {children}
    </Component>
  );
};

// Scale In Animation
interface ScaleInProps extends MicroInteractionProps {
  from?: number;
}

export const ScaleIn = ({ 
  children, 
  className = '', 
  delay = 0, 
  duration = 0.5,
  from = 0.95,
  as = motion.div 
}: ScaleInProps) => {
  const Component = as;
  
  return (
    <Component
      initial={{ scale: from, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        duration, 
        delay, 
        ease: 'easeOut' 
      }}
      data-animation="scale-in"
      className={cn(className)}
    >
      {children}
    </Component>
  );
};

// Float Animation
interface FloatProps extends MicroInteractionProps {
  amplitude?: number;
}

export const Float = ({ 
  children, 
  className = '', 
  delay = 0, 
  duration = 2,
  amplitude = 10,
  repeat = true,
  as = motion.div 
}: FloatProps) => {
  const Component = as;
  
  return (
    <Component
      animate={{ 
        y: [0, -amplitude, 0],
      }}
      transition={{ 
        duration, 
        delay, 
        ease: "easeInOut",
        repeat: repeat ? Infinity : 0,
        repeatType: "loop"
      }}
      data-animation="float"
      className={cn(className)}
    >
      {children}
    </Component>
  );
};

// Pulse Animation
interface PulseProps extends MicroInteractionProps {
  scale?: number;
}

export const Pulse = ({ 
  children, 
  className = '', 
  delay = 0, 
  duration = 1.5,
  scale = 1.05,
  repeat = true,
  as = motion.div 
}: PulseProps) => {
  const Component = as;
  
  return (
    <Component
      animate={{ 
        scale: [1, scale, 1],
      }}
      transition={{ 
        duration, 
        delay, 
        ease: "easeInOut",
        repeat: repeat ? Infinity : 0,
        repeatType: "loop"
      }}
      data-animation="pulse"
      className={cn(className)}
    >
      {children}
    </Component>
  );
};

// Stagger Children Animation
interface StaggerProps extends MicroInteractionProps {
  staggerDelay?: number;
}

export const Stagger = ({ 
  children, 
  className = '', 
  delay = 0, 
  staggerDelay = 0.1,
  as = motion.div 
}: StaggerProps) => {
  const Component = as;
  
  return (
    <Component
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay
          }
        },
        hidden: {}
      }}
      data-animation="stagger"
      className={cn(className)}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        
        return React.cloneElement(child, {
          variants: {
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 20 }
          },
          transition: { duration: 0.5 }
        });
      })}
    </Component>
  );
};

// Rotate Animation
interface RotateProps extends MicroInteractionProps {
  degrees?: number;
}

export const Rotate = ({ 
  children, 
  className = '', 
  delay = 0, 
  duration = 5,
  degrees = 360,
  repeat = true,
  as = motion.div 
}: RotateProps) => {
  const Component = as;
  
  return (
    <Component
      animate={{ 
        rotate: degrees
      }}
      transition={{ 
        duration, 
        delay, 
        ease: "linear",
        repeat: repeat ? Infinity : 0,
        repeatType: "loop"
      }}
      data-animation="rotate"
      className={cn(className)}
    >
      {children}
    </Component>
  );
};

// Shimmer Animation
export const Shimmer = ({ 
  children, 
  className = '', 
  delay = 0, 
  duration = 2,
  repeat = true,
  as = motion.div 
}: MicroInteractionProps) => {
  const Component = as;
  
  return (
    <Component
      className={cn(
        "relative overflow-hidden",
        className
      )}
      data-animation="shimmer"
    >
      {children}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
        animate={{ x: ['0%', '200%'] }}
        transition={{
          duration,
          delay,
          ease: "easeInOut",
          repeat: repeat ? Infinity : 0,
          repeatDelay: 0.5
        }}
      />
    </Component>
  );
};

// Attention Animation (Shake or Bounce)
interface AttentionProps extends MicroInteractionProps {
  type?: 'shake' | 'bounce';
  intensity?: number;
}

export const Attention = ({ 
  children, 
  className = '', 
  delay = 0, 
  duration = 0.4,
  type = 'shake',
  intensity = 5,
  repeat = false,
  as = motion.div 
}: AttentionProps) => {
  const Component = as;
  
  const variants = {
    shake: {
      animate: { 
        x: [0, -intensity, intensity, -intensity, intensity, 0],
      },
      transition: { 
        duration, 
        delay, 
        ease: "easeInOut",
        repeat: repeat ? Infinity : 0,
        repeatDelay: 3
      }
    },
    bounce: {
      animate: { 
        y: [0, -intensity, 0],
      },
      transition: { 
        duration, 
        delay, 
        ease: "easeOut",
        repeat: repeat ? Infinity : 0,
        repeatDelay: 3
      }
    }
  };
  
  return (
    <Component
      animate={variants[type].animate}
      transition={variants[type].transition}
      data-animation={`attention-${type}`}
      className={cn(className)}
    >
      {children}
    </Component>
  );
};

// Typing Animation
interface TypingProps extends MicroInteractionProps {
  text: string;
  typingSpeed?: number;
  cursorColor?: string;
}

export const Typing = ({ 
  className = '', 
  delay = 0, 
  text,
  typingSpeed = 40,
  cursorColor = 'currentColor',
  as = motion.div 
}: TypingProps) => {
  const Component = as;
  const [displayText, setDisplayText] = React.useState('');
  const [cursorVisible, setCursorVisible] = React.useState(true);
  
  React.useEffect(() => {
    let currentIndex = 0;
    let timer: NodeJS.Timeout;
    
    // Start typing after delay
    const delayTimer = setTimeout(() => {
      timer = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText(prev => prev + text.charAt(currentIndex));
          currentIndex++;
        } else {
          clearInterval(timer);
          // Start cursor blink after typing completes
          const cursorTimer = setInterval(() => {
            setCursorVisible(prev => !prev);
          }, 500);
          
          return () => clearInterval(cursorTimer);
        }
      }, typingSpeed);
    }, delay * 1000);
    
    return () => {
      clearTimeout(delayTimer);
      clearInterval(timer);
    };
  }, [text, delay, typingSpeed]);
  
  return (
    <Component
      data-animation="typing"
      className={cn("flex items-center", className)}
    >
      <span>{displayText}</span>
      <span 
        className="inline-block w-[0.1em] h-[1.2em] ml-0.5"
        style={{ 
          backgroundColor: cursorColor,
          opacity: cursorVisible ? 1 : 0,
          transition: 'opacity 0.2s'
        }}
      />
    </Component>
  );
};

// Export all animations as a group
const MicroAnimations = {
  SlideIn,
  FadeIn,
  ScaleIn,
  Float,
  Pulse,
  Stagger,
  Rotate,
  Shimmer,
  Attention,
  Typing
};

export default MicroAnimations;