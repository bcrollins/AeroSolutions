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
    hover: { scale: 1.05 }
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
        {/* Minimalistic circular background */}
        <circle 
          cx="50" 
          cy="50" 
          r="40" 
          fill="#1E3A8A" /* Midnight Blue */
        />
        
        {/* Minimalistic 'R' */}
        <path 
          d="M35,30 H55 C65,30 72,37 72,45 C72,53 65,60 55,60 L52,60 L58,70 H48 L42,60 H42 V70 H35 Z M42,37 V53 H52 C58,53 65,49 65,45 C65,41 58,37 52,37 Z" 
          fill="#FFFFFF" 
          stroke="none"
        />
        
        {/* Simple golden accent */}
        <circle 
          cx="50" 
          cy="50" 
          r="35" 
          fill="none" 
          stroke="#D4A017" /* Golden Amber */
          strokeWidth="1.5"
          strokeDasharray="3,3"
        />
      </svg>
    </Component>
  );
};

export default ROLLINSXLogo;