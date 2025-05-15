import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface EnhancedTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  description?: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  skipDelayDuration?: number;
  asChild?: boolean;
  interactive?: boolean;
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error';
  size?: 'default' | 'large' | 'tight' | 'fit';
  animationDuration?: number;
  image?: string;
  maxWidth?: number;
  showArrow?: boolean;
  persistent?: boolean; // Keep showing after click
}

/**
 * Enhanced tooltip component with animations, illustrations, and interactive options
 */
export function EnhancedTooltip({
  children,
  content,
  description,
  side = 'top',
  align = 'center',
  delayDuration = 300,
  skipDelayDuration = 500,
  asChild = false,
  interactive = false,
  variant = 'default',
  size = 'default', 
  animationDuration = 0.2,
  image,
  maxWidth = 320,
  showArrow = true,
  persistent = false
}: EnhancedTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Set appropriate variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'info':
        return 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/70 dark:border-blue-900 dark:text-blue-300';
      case 'success':
        return 'bg-green-50 text-green-900 border-green-200 dark:bg-green-950/70 dark:border-green-900 dark:text-green-300';
      case 'warning':
        return 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/70 dark:border-amber-900 dark:text-amber-300';
      case 'error':
        return 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950/70 dark:border-red-900 dark:text-red-300';
      default:
        return '';
    }
  };
  
  // Set appropriate size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'large':
        return 'py-3 px-4 text-sm';
      case 'tight':
        return 'py-1 px-2 text-xs';
      case 'fit':
        return 'py-1.5 px-2.5 text-xs';
      default:
        return 'py-2 px-3 text-sm';
    }
  };
  
  // Handle click for persistent tooltips
  const handleClick = () => {
    if (persistent) {
      setIsOpen(prev => !prev);
    }
  };
  
  return (
    <TooltipProvider 
      delayDuration={delayDuration} 
      skipDelayDuration={skipDelayDuration}
    >
      <Tooltip open={persistent ? isOpen : undefined}>
        <TooltipTrigger
          asChild={asChild}
          onClick={handleClick}
          className={asChild ? undefined : 'cursor-help'}
        >
          {children}
        </TooltipTrigger>
        
        <TooltipContent
          side={side}
          align={align}
          className={cn(
            "border shadow-md",
            getVariantStyles(),
            getSizeStyles(),
            interactive ? "cursor-auto select-text" : "",
            !showArrow && "tooltip-no-arrow"
          )}
          style={{ maxWidth }}
          sideOffset={5}
        >
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: animationDuration }}
            >
              {/* Main content */}
              <div className="flex flex-col gap-1">
                {typeof content === 'string' ? (
                  <div className="font-medium">{content}</div>
                ) : (
                  content
                )}
                
                {/* Optional description */}
                {description && (
                  <div className={cn(
                    "text-foreground/80 font-normal",
                    size === 'large' ? 'text-sm' : 'text-xs'
                  )}>
                    {description}
                  </div>
                )}
                
                {/* Optional image */}
                {image && (
                  <div className="mt-2 rounded-md overflow-hidden">
                    <img
                      src={image}
                      alt="Tooltip illustration"
                      className="max-w-full h-auto object-cover"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}