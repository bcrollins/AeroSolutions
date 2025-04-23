import React from 'react';
import { motion } from 'framer-motion';

interface ROLLINSXLogoProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const ROLLINSXLogo: React.FC<ROLLINSXLogoProps> = ({ 
  size = 'md', 
  animated = false,
  className = '' 
}) => {
  // Size mappings
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };
  
  // Animation variants
  const variants = {
    initial: { scale: 0.9, opacity: 0.5 },
    animate: { scale: 1, opacity: 1 },
    hover: { scale: 1.05, rotate: 5 }
  };
  
  // If animated, use motion.div, otherwise use regular div
  const Component = animated ? motion.div : 'div';
  
  // Props to pass to motion component
  const motionProps = animated ? {
    initial: 'initial',
    animate: 'animate',
    whileHover: 'hover',
    variants,
    transition: { duration: 0.3 }
  } : {};

  return (
    <Component 
      className={`${sizeMap[size]} ${className} relative flex items-center justify-center`}
      {...motionProps}
    >
      <svg 
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full"
        aria-label="ROLLINSX Logo"
      >
        {/* Main geometric shape */}
        <polygon 
          points="50,10 90,30 90,70 50,90 10,70 10,30" 
          fill="#1E3A8A" /* Midnight Blue */
        />
        
        {/* Letter R stylized */}
        <path 
          d="M30,30 H50 C60,30 70,35 70,45 C70,55 60,60 50,60 L55,70 H45 L40,60 H40 V70 H30 Z M40,40 V50 H50 C55,50 60,47.5 60,45 C60,42.5 55,40 50,40 Z" 
          fill="#D4A017" /* Golden Amber */
        />
        
        {/* Decorative elements */}
        <circle cx="20" cy="25" r="3" fill="#60A5FA" /> {/* Sky Blue */}
        <circle cx="80" cy="25" r="3" fill="#60A5FA" /> {/* Sky Blue */}
        <circle cx="20" cy="75" r="3" fill="#60A5FA" /> {/* Sky Blue */}
        <circle cx="80" cy="75" r="3" fill="#60A5FA" /> {/* Sky Blue */}
        
        {/* Define gradient for potential use */}
        <defs>
          <linearGradient id="rollinsxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" /> {/* Midnight Blue */}
            <stop offset="100%" stopColor="#60A5FA" /> {/* Sky Blue */}
          </linearGradient>
        </defs>
      </svg>
    </Component>
  );
};

export default ROLLINSXLogo;