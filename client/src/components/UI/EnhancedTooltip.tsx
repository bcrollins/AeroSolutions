import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useDevice } from '@/hooks/use-device';

interface EnhancedTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  description?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delay?: number;
  className?: string;
  contentClassName?: string;
  variant?: 'default' | 'info' | 'warning' | 'error' | 'success';
  icon?: React.ReactNode;
  showArrow?: boolean;
  asChild?: boolean;
  disableOnMobile?: boolean;
  maxWidth?: string | number;
  interactive?: boolean;
}

/**
 * EnhancedTooltip - Extended tooltip component with more styling options and animations
 * 
 * @example
 * <EnhancedTooltip
 *   content="This is a helpful tooltip"
 *   description="It provides additional context"
 *   variant="info"
 *   side="top"
 * >
 *   <Button>Hover Me</Button>
 * </EnhancedTooltip>
 */
export const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({
  children,
  content,
  description,
  side = 'top',
  align = 'center',
  delay = 0,
  className = '',
  contentClassName = '',
  variant = 'default',
  icon,
  showArrow = true,
  asChild = false,
  disableOnMobile = true,
  maxWidth = 250,
  interactive = false,
}) => {
  const { isMobile } = useDevice();
  
  // Disable tooltips on mobile devices if specified
  if (disableOnMobile && isMobile) {
    return <>{children}</>;
  }
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'info':
        return 'bg-blue-50 text-blue-900 border border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-900';
      case 'warning':
        return 'bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-900';
      case 'error':
        return 'bg-red-50 text-red-900 border border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-900';
      case 'success':
        return 'bg-green-50 text-green-900 border border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-900';
      default:
        return '';
    }
  };
  
  const AnimatedTooltipContent = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<typeof TooltipContent>
  >(({ className, ...props }, ref) => (
    <TooltipContent
      ref={ref}
      className={cn(
        "px-3 py-2 shadow-md",
        getVariantClasses(),
        contentClassName,
        className
      )}
      sideOffset={5}
      collisionPadding={10}
      style={{ 
        maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth 
      }}
      {...props}
    >
      <motion.div
        initial={{ opacity: 0, y: 5, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
      >
        <div className="flex gap-2">
          {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
          <div>
            <div className="font-medium">{content}</div>
            {description && <p className="text-xs opacity-80 mt-1">{description}</p>}
          </div>
        </div>
        {showArrow && <TooltipArrow className={getVariantClasses()} />}
      </motion.div>
    </TooltipContent>
  ));
  AnimatedTooltipContent.displayName = 'AnimatedTooltipContent';
  
  return (
    <TooltipProvider delayDuration={delay * 1000}>
      <Tooltip>
        <TooltipTrigger asChild={asChild} className={className}>
          {children}
        </TooltipTrigger>
        <AnimatedTooltipContent side={side} align={align} />
      </Tooltip>
    </TooltipProvider>
  );
};

// Custom arrow component
const TooltipArrow = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "absolute h-2 w-2 rotate-45",
      className
    )}
    style={{
      left: 'calc(50% - 4px)',
      bottom: '-4px'
    }}
  />
);

export default EnhancedTooltip;