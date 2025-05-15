import React, { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Collection of reusable micro-interaction components based on Framer Motion
// with Apple-inspired design principles for the RXAI platform

interface FadeInProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  className?: string;
  once?: boolean;
}

export function FadeIn({ 
  children, 
  duration = 0.5, 
  delay = 0, 
  className = "", 
  once = false 
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
      viewport={{ once }}
    >
      {children}
    </motion.div>
  );
}

interface SlideInProps {
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down";
  duration?: number;
  delay?: number;
  className?: string;
  distance?: number;
  once?: boolean;
}

export function SlideIn({ 
  children, 
  direction = "up", 
  duration = 0.5, 
  delay = 0, 
  className = "", 
  distance = 30,
  once = false
}: SlideInProps) {
  
  const directionMap = {
    left: { x: -distance, y: 0 },
    right: { x: distance, y: 0 },
    up: { x: 0, y: -distance },
    down: { x: 0, y: distance }
  };
  
  const initial = directionMap[direction];
  
  return (
    <motion.div
      initial={{ ...initial, opacity: 0 }}
      animate={{ x: 0, y: 0, opacity: 1 }}
      exit={{ ...initial, opacity: 0 }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      viewport={{ once }}
    >
      {children}
    </motion.div>
  );
}

interface ScaleInProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  className?: string;
  scale?: number;
}

export function ScaleIn({ 
  children, 
  duration = 0.5, 
  delay = 0, 
  className = "",
  scale = 0.95 
}: ScaleInProps) {
  return (
    <motion.div
      initial={{ scale, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale, opacity: 0 }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerChildrenProps {
  children: ReactNode;
  staggerDelay?: number;
  containerClassName?: string;
  itemClassName?: string;
}

export function StaggerChildren({ 
  children, 
  staggerDelay = 0.1, 
  containerClassName = "",
  itemClassName = "" 
}: StaggerChildrenProps) {
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { ease: [0.16, 1, 0.3, 1] } }
  };
  
  // Wrap each child in a motion.div with the item variant
  const childrenWithMotion = React.Children.map(children, child => (
    <motion.div className={itemClassName} variants={item}>
      {child}
    </motion.div>
  ));
  
  return (
    <motion.div
      className={containerClassName}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {childrenWithMotion}
    </motion.div>
  );
}

interface FloatProps {
  children: ReactNode;
  amplitude?: number;
  duration?: number;
  className?: string;
}

export function Float({ 
  children, 
  amplitude = 10, 
  duration = 3,
  className = "" 
}: FloatProps) {
  return (
    <motion.div
      animate={{
        y: [`-${amplitude}px`, `${amplitude}px`, `-${amplitude}px`]
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface PulseProps {
  children: ReactNode;
  scale?: number;
  duration?: number;
  className?: string;
}

export function Pulse({ 
  children, 
  scale = 1.05, 
  duration = 2,
  className = "" 
}: PulseProps) {
  return (
    <motion.div
      animate={{
        scale: [1, scale, 1]
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ShimmerProps {
  children: ReactNode;
  className?: string;
}

export function Shimmer({ children, className = "" }: ShimmerProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
          animate={{ x: ["0%", "150%"] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            repeatDelay: 2
          }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface ButtonPressProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

export function ButtonPress({ 
  children, 
  className = "",
  scale = 0.97
}: ButtonPressProps) {
  return (
    <motion.div
      whileTap={{ scale }}
      transition={{ duration: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface HoverScaleProps {
  children: ReactNode;
  scale?: number;
  className?: string;
}

export function HoverScale({ 
  children, 
  scale = 1.03,
  className = "" 
}: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface RevealTextProps {
  text: string;
  className?: string;
  delay?: number;
  staggerChildren?: number;
}

export function RevealText({ 
  text, 
  className = "", 
  delay = 0,
  staggerChildren = 0.02
}: RevealTextProps) {
  // Split text into character spans
  const words = text.split(' ');
  
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren, delayChildren: delay * i }
    })
  };
  
  const child = {
    hidden: { y: '100%', opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { ease: [0.16, 1, 0.3, 1], duration: 0.4 }
    }
  };
  
  return (
    <motion.div
      className={`inline-block ${className}`}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block whitespace-nowrap mr-[0.25em]">
          {Array.from(word).map((char, index) => (
            <motion.span
              key={index}
              className="inline-block"
              variants={child}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.div>
  );
}

interface SkeletonProps {
  height?: string;
  width?: string;
  className?: string;
  rounded?: string;
}

export function Skeleton({ 
  height = "1.2em", 
  width = "100%", 
  className = "",
  rounded = "0.375rem"
}: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`}
      style={{ 
        height, 
        width,
        borderRadius: rounded 
      }}
    />
  );
}

interface CheckmarkProps {
  show: boolean;
  className?: string;
  size?: number;
}

export function Checkmark({ show, className = "", size = 24 }: CheckmarkProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.svg 
          className={className}
          width={size} 
          height={size} 
          viewBox="0 0 24 24"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <motion.path
            d="M5 13l4 4L19 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
          />
        </motion.svg>
      )}
    </AnimatePresence>
  );
}

interface CountUpProps {
  targetValue: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({ 
  targetValue, 
  duration = 2, 
  decimals = 0,
  prefix = "",
  suffix = "",
  className = ""
}: CountUpProps) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrameId: number;
    
    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      setCount(Math.floor(progress * targetValue));
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      }
    };
    
    animationFrameId = requestAnimationFrame(updateCount);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetValue, duration]);
  
  return (
    <div className={className}>
      {prefix}{count.toFixed(decimals)}{suffix}
    </div>
  );
}

// Export all components as a named collection for convenience
export const MicroInteractions = {
  FadeIn,
  SlideIn,
  ScaleIn,
  StaggerChildren,
  Float,
  Pulse,
  Shimmer,
  ButtonPress,
  HoverScale,
  RevealText,
  Skeleton,
  Checkmark,
  CountUp
};

export default MicroInteractions;