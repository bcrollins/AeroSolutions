import React, { ReactNode } from 'react';
import { 
  HoverCard, 
  HoverCardContent, 
  HoverCardTrigger 
} from '@/components/ui/hover-card';
import { motion } from 'framer-motion';

interface EnhancedTooltipProps {
  children: ReactNode;
  title?: string;
  description?: string;
  image?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delay?: number;
  className?: string;
  contentClassName?: string;
  showIcon?: boolean;
  icon?: ReactNode;
  customContent?: ReactNode;
}

/**
 * Enhanced tooltip component with animations and rich content support
 */
export default function EnhancedTooltip({
  children,
  title,
  description,
  image,
  side = 'top',
  align = 'center',
  delay = 0,
  className = '',
  contentClassName = '',
  showIcon = false,
  icon,
  customContent
}: EnhancedTooltipProps) {
  return (
    <HoverCard openDelay={delay} closeDelay={100}>
      <HoverCardTrigger asChild className={className}>
        <span className="inline-block">
          {children}
          {showIcon && (
            <span className="ml-1 inline-flex text-gray-400 hover:text-gray-500">
              {icon || <InformationIcon className="h-4 w-4" />}
            </span>
          )}
        </span>
      </HoverCardTrigger>
      
      <HoverCardContent 
        side={side} 
        align={align}
        className={`w-80 p-0 overflow-hidden shadow-xl border border-gray-200 
                   bg-white/95 backdrop-blur-sm dark:bg-gray-900/95 dark:border-gray-700 
                   rounded-xl ${contentClassName}`}
        sideOffset={5}
      >
        {customContent ? (
          customContent
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {image && (
              <div className="relative w-full h-32 overflow-hidden rounded-t-lg">
                <img 
                  src={image} 
                  alt={title || "Tooltip image"} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                {title && image && (
                  <div className="absolute bottom-0 left-0 w-full p-3">
                    <h4 className="text-white font-semibold text-lg">{title}</h4>
                  </div>
                )}
              </div>
            )}
            
            <div className="p-4">
              {!image && title && (
                <h4 className="font-semibold text-base text-gray-900 dark:text-white mb-1">{title}</h4>
              )}
              
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

// Simple information icon component
function InformationIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}