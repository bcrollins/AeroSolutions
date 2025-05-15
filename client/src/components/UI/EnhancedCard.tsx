import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface EnhancedCardProps {
  children?: ReactNode;
  title?: string | ReactNode;
  description?: string | ReactNode;
  image?: string;
  footer?: ReactNode;
  variant?: 'default' | 'glass' | 'minimal' | 'floating' | 'gradient' | 'bordered' | 'interactive';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  imageHeight?: number | string;
  aspectRatio?: string;
  badges?: ReactNode;
  animateEntrance?: boolean;
  delay?: number;
  tag?: string | ReactNode;
}

/**
 * Enhanced card component with various styles and animations
 */
export default function EnhancedCard({
  children,
  title,
  description,
  image,
  footer,
  variant = 'default',
  size = 'md',
  hover = true,
  clickable = false,
  onClick,
  className = '',
  headerClassName = '',
  contentClassName = '',
  footerClassName = '',
  imageHeight = 200,
  aspectRatio,
  badges,
  animateEntrance = false,
  delay = 0,
  tag
}: EnhancedCardProps) {
  // Size classes
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };
  
  // Variant classes
  let variantClasses = '';
  let hoverClasses = '';
  
  switch (variant) {
    case 'glass':
      variantClasses = 'bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border-white/20 dark:border-white/10';
      hoverClasses = hover ? 'hover:bg-white/95 dark:hover:bg-gray-900/90 hover:shadow-lg' : '';
      break;
    case 'minimal':
      variantClasses = 'bg-white dark:bg-gray-900 shadow-sm border-gray-100 dark:border-gray-800';
      hoverClasses = hover ? 'hover:border-gray-200 dark:hover:border-gray-700' : '';
      break;
    case 'floating':
      variantClasses = 'bg-white dark:bg-gray-900 shadow-lg border-0';
      hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1' : '';
      break;
    case 'gradient':
      variantClasses = 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-0 shadow-md';
      hoverClasses = hover ? 'hover:shadow-lg' : '';
      break;
    case 'bordered':
      variantClasses = 'bg-white dark:bg-gray-900 border-2 border-primary/20';
      hoverClasses = hover ? 'hover:border-primary/40' : '';
      break;
    case 'interactive':
      variantClasses = 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm';
      hoverClasses = hover ? 'hover:shadow-md hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10' : '';
      break;
    default: // default variant
      variantClasses = 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800';
      hoverClasses = hover ? 'hover:shadow-md' : '';
  }
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
        delay
      }
    }
  };
  
  // Handle click events
  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };
  
  // Wrapper component that adds motion if animateEntrance is true
  const CardWrapper = ({ children }: { children: ReactNode }) => {
    if (animateEntrance) {
      return (
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="w-full h-full"
        >
          {children}
        </motion.div>
      );
    }
    return <>{children}</>;
  };
  
  return (
    <CardWrapper>
      <Card 
        className={`overflow-hidden transition-all duration-300 ${variantClasses} ${hoverClasses} ${className} ${clickable ? 'cursor-pointer' : ''}`}
        onClick={handleClick}
      >
        {/* Optional image */}
        {image && (
          <div 
            className="relative w-full overflow-hidden"
            style={{ 
              height: imageHeight,
              aspectRatio: aspectRatio
            }}
          >
            <img 
              src={image} 
              alt={typeof title === 'string' ? title : 'Card image'}
              className="w-full h-full object-cover"
            />
            
            {/* Optional tag overlay */}
            {tag && (
              <div className="absolute top-2 left-2 z-10">
                {typeof tag === 'string' ? (
                  <span className="inline-block bg-primary text-white text-xs px-2 py-1 rounded-md font-medium">
                    {tag}
                  </span>
                ) : (
                  tag
                )}
              </div>
            )}
            
            {/* Optional badges overlay */}
            {badges && (
              <div className="absolute top-2 right-2 z-10">
                {badges}
              </div>
            )}
          </div>
        )}
        
        {/* Card header */}
        {(title || description) && (
          <CardHeader className={`${sizeClasses[size]} ${headerClassName}`}>
            {title && (
              typeof title === 'string' ? (
                <CardTitle>{title}</CardTitle>
              ) : (
                title
              )
            )}
            
            {description && (
              typeof description === 'string' ? (
                <CardDescription>{description}</CardDescription>
              ) : (
                description
              )
            )}
          </CardHeader>
        )}
        
        {/* Card content */}
        {children && (
          <CardContent className={`${size !== 'lg' && (title || description) ? 'pt-0' : ''} ${sizeClasses[size]} ${contentClassName}`}>
            {children}
          </CardContent>
        )}
        
        {/* Card footer */}
        {footer && (
          <CardFooter className={`${sizeClasses[size]} ${footerClassName}`}>
            {footer}
          </CardFooter>
        )}
      </Card>
    </CardWrapper>
  );
}