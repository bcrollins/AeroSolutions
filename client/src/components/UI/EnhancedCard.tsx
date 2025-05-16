import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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
const EnhancedCard: React.FC<EnhancedCardProps> = ({
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
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  // Variant classes
  const variantClasses = {
    default: 'bg-card text-card-foreground',
    glass: 'bg-white/10 dark:bg-black/10 backdrop-blur-md border-white/20 dark:border-white/10',
    bordered: 'border-2 border-primary/20',
    elevated: 'shadow-xl',
    interactive: 'cursor-pointer transition-all hover:shadow-md'
  };

  // Hover effect styles based on the selected effect
  const getHoverStyles = () => {
    if (!hover) return {};

    switch (hoverEffect) {
      case 'lift':
        return { y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' };
      case 'glow':
        return { boxShadow: '0 0 15px rgba(var(--primary), 0.5)' };
      case 'scale':
        return { scale: 1.02 };
      case 'highlight':
        return { borderColor: 'rgba(var(--primary), 0.8)' };
      case 'none':
      default:
        return {};
    }
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <Card className={cn('overflow-hidden', className, variantClasses[variant], sizeClasses[size])}>
        {title && (
          <CardHeader className="p-6 pb-0">
            <Skeleton className="h-8 w-1/2 mb-2" />
            {description && <Skeleton className="h-4 w-3/4" />}
          </CardHeader>
        )}
        <CardContent className={cn('flex flex-col gap-4', sizeClasses[size])}>
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
        {footer && (
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        )}
      </Card>
    );
  }

  // If animations are disabled, render a regular Card
  if (noAnimation) {
    return (
      <Card 
        className={cn(
          'overflow-hidden transition-all duration-300', 
          className, 
          variantClasses[variant], 
          onClick && 'cursor-pointer',
          hover && hoverEffect === 'highlight' && 'hover:border-primary/80'
        )}
        onClick={onClick}
      >
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent className={sizeClasses[size]}>
          {children}
        </CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    );
  }

  // Animated card with Framer Motion
  return (
    <motion.div
      className={cn(
        'overflow-hidden rounded-lg border bg-card text-card-foreground', 
        className, 
        variantClasses[variant],
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
      whileHover={hover ? getHoverStyles() : {}}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={sizeClasses[size]}>
        {children}
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </motion.div>
  );
};

export default EnhancedCard;