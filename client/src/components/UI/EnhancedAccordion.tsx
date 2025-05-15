import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface EnhancedAccordionItemProps {
  value: string;
  title: ReactNode;
  description?: string;
  children: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  iconPosition?: 'left' | 'right';
  highlight?: boolean;
  badge?: ReactNode;
}

interface EnhancedAccordionProps {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  defaultValue?: string | string[];
  className?: string;
  onChange?: (value: string | string[]) => void;
  children: ReactNode;
  animated?: boolean;
  variant?: 'default' | 'bordered' | 'separated' | 'minimal' | 'card';
}

/**
 * Enhanced accordion item with animations and customization
 */
export function EnhancedAccordionItem({
  value,
  title,
  description,
  children,
  icon,
  disabled = false,
  className = '',
  headerClassName = '',
  contentClassName = '',
  iconPosition = 'left',
  highlight = false,
  badge
}: EnhancedAccordionItemProps) {
  return (
    <AccordionItem
      value={value}
      disabled={disabled}
      className={cn(
        'border-b last-of-type:border-b-0',
        highlight ? 'bg-primary/5' : '',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        className
      )}
    >
      <AccordionTrigger
        className={cn(
          'flex items-center gap-3 py-4 transition-all',
          headerClassName
        )}
      >
        <div className="flex-1 flex items-center gap-3">
          {/* Icon on the left */}
          {icon && iconPosition === 'left' && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}
          
          {/* Title and description */}
          <div className="flex-1 text-left">
            <div className={cn(
              "text-base font-medium",
              typeof title !== 'string' ? 'flex items-center gap-2' : ''
            )}>
              {title}
              {badge && (
                <div className="ml-2">
                  {badge}
                </div>
              )}
            </div>
            {description && (
              <div className="text-muted-foreground text-sm mt-0.5">
                {description}
              </div>
            )}
          </div>
          
          {/* Icon on the right */}
          {icon && iconPosition === 'right' && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}
        </div>
        
        {/* The chevron icon comes from AccordionTrigger */}
      </AccordionTrigger>
      
      <AccordionContent className={contentClassName}>
        <div className="pt-1 pb-4">
          {children}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

/**
 * Enhanced accordion with animations and customization options
 */
export function EnhancedAccordion({
  type = 'single',
  collapsible = true,
  defaultValue,
  className = '',
  onChange,
  children,
  animated = true,
  variant = 'default'
}: EnhancedAccordionProps) {
  // Get variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'bordered':
        return 'border border-border rounded-md divide-y';
      case 'separated':
        return 'space-y-2 [&>*]:border [&>*]:border-border [&>*]:rounded-md [&>*]:mb-2 [&>*:last-child]:mb-0';
      case 'minimal':
        return '[&>*]:border-0 [&>*]:border-b-0';
      case 'card':
        return '[&>*]:bg-card [&>*]:border [&>*]:border-border [&>*]:rounded-lg [&>*]:mb-2 [&>*:last-child]:mb-0 [&>*]:shadow-sm';
      default:
        return 'border-border';
    }
  };
  
  return (
    <Accordion
      type={type}
      collapsible={collapsible}
      defaultValue={defaultValue}
      className={cn(getVariantStyles(), className)}
      onValueChange={onChange}
    >
      {/* Apply animations to children if enabled */}
      {animated
        ? React.Children.map(children, (child, index) => {
            if (!React.isValidElement(child)) return child;
            
            // Add motion props to accordion items
            return React.cloneElement(child, {
              ...child.props,
              // Override AccordionTrigger with a custom animated version
              children: React.Children.map(child.props.children, (itemChild) => {
                if (!React.isValidElement(itemChild)) return itemChild;
                
                if (itemChild.type === AccordionTrigger) {
                  // Replace trigger with animated version
                  return React.cloneElement(itemChild, {
                    ...itemChild.props,
                    className: cn(
                      itemChild.props.className,
                      'group flex flex-1 justify-between py-4 px-4 transition-all hover:underline [&[data-state=open]>svg]:rotate-180'
                    ),
                    children: (
                      <>
                        {itemChild.props.children}
                        <motion.div
                          initial={{ rotate: 0 }}
                          animate={{ rotate: itemChild.props['data-state'] === 'open' ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-shrink-0 ml-2"
                        >
                          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                        </motion.div>
                      </>
                    )
                  });
                }
                
                if (itemChild.type === AccordionContent) {
                  // Replace content with animated version
                  return React.cloneElement(itemChild, {
                    ...itemChild.props,
                    className: cn(
                      itemChild.props.className, 
                      'overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'
                    ),
                    children: (
                      <AnimatePresence initial={false}>
                        {itemChild.props['data-state'] === 'open' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {itemChild.props.children}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )
                  });
                }
                
                return itemChild;
              })
            });
          })
        : children
      }
    </Accordion>
  );
}