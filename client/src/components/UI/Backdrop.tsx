import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BackdropProps {
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
  blur?: 'none' | 'sm' | 'md' | 'lg';
  opacity?: number;
  animated?: boolean;
  zIndex?: number;
}

/**
 * A backdrop component that can be used behind modals or other UI elements
 * to create depth and focus on the foreground content
 */
const Backdrop: React.FC<BackdropProps> = ({
  children,
  className,
  onClick,
  blur = 'md',
  opacity = 0.7,
  animated = true,
  zIndex = 40
}) => {
  // Mapping blur values to actual CSS
  const blurValues = {
    none: '',
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg'
  };

  const backdropStyle = cn(
    'fixed inset-0 bg-black',
    blurValues[blur],
    className
  );

  // If animated is false, return a simple div
  if (!animated) {
    return (
      <div
        className={backdropStyle}
        onClick={onClick}
        style={{ opacity, zIndex }}
        aria-hidden="true"
      >
        {children}
      </div>
    );
  }

  // Otherwise return animated backdrop with Framer Motion
  return (
    <motion.div
      className={backdropStyle}
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ zIndex }}
      aria-hidden="true"
    >
      {children}
    </motion.div>
  );
};

export default Backdrop;