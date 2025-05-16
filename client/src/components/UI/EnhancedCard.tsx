import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface EnhancedCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  footer?: ReactNode;
  variant?: 'default' | 'glass' | 'bordered' | 'elevated' | 'interactive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  onClick?: () => void;
  hover?: boolean;
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'highlight' | 'none';
  noAnimation?: boolean; // Option to disable animations for performance/accessibility
}

/**
 * Enhanced Card component with various appearance options and animations
 */
const EnhancedCard = ({
  children,
  className,
  title,
  description,
  footer,
  variant = 'default',
  size = 'md',
  isLoading = false,
  onClick,
  hover = true,
  hoverEffect = 'lift',
  noAnimation = false
}: EnhancedCardProps) => {
  // Size classes
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  // Variant classes
  const variantClasses = {
    default: 'bg-card',
    glass: 'bg-white/10 backdrop-blur-lg dark:bg-gray-900/50 border border-white/20',
    bordered: 'border-2',
    elevated: 'shadow-xl',
    interactive: 'cursor-pointer shadow-md transition-all duration-300'
  };

  // Hover effect classes
  const getHoverClasses = () => {
    if (!hover) return '';
    
    switch (hoverEffect) {
      case 'lift':
        return 'hover:-translate-y-1.5 hover:shadow-lg';
      case 'glow':
        return 'hover:shadow-[0_0_20px_rgba(0,120,255,0.3)]';
      case 'scale':
        return 'hover:scale-[1.02] origin-center';
      case 'highlight':
        return 'hover:border-primary hover:border-opacity-100';
      default:
        return '';
    }
  };

  const cardClasses = cn(
    'relative overflow-hidden rounded-lg transition-all duration-300',
    variantClasses[variant],
    hover && getHoverClasses(),
    onClick && 'cursor-pointer',
    isLoading && 'pointer-events-none animate-pulse',
    className
  );

  // Animation variants for the card when it enters the viewport
  const cardAnimationVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  // Wrap content with proper card components if title/description/footer are provided
  const wrappedContent = (
    <>
      {(title || description) && (
        <CardHeader className={cn(sizeClasses[size])}>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn(
        (!title && !description) && sizeClasses[size], 
        (title || description) && 'pt-0'
      )}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="border-t bg-muted/10 px-6 py-4">
          {footer}
        </CardFooter>
      )}
    </>
  );

  // Return either an animated card or a regular card
  if (noAnimation) {
    return (
      <Card className={cardClasses} onClick={onClick}>
        {wrappedContent}
      </Card>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={cardAnimationVariants}
      className="w-full"
    >
      <Card className={cardClasses} onClick={onClick}>
        {wrappedContent}
      </Card>
    </motion.div>
  );
};

export default EnhancedCard;