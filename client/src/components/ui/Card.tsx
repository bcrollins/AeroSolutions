import React from 'react';
import { designSystem } from '@/styles/designSystem';

interface EnhancedCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  headerAction?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'flat' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  hoverEffect?: boolean;
  elevated?: boolean;
}

/**
 * Enhanced Card component with Apple-inspired aesthetics
 * 
 * Features:
 * - Clean, minimal design
 * - Optional header with title and action
 * - Support for hover effects
 * - Glass morphism effect option
 * - Consistent spacing and radiuses
 */
export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  title,
  subtitle,
  footer,
  headerAction,
  className = '',
  variant = 'default',
  padding = 'md',
  onClick,
  hoverEffect = false,
  elevated = false
}) => {
  // Base classes
  const baseClasses = 'rounded-lg transition-all overflow-hidden';
  
  // Variant classes
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    glass: 'backdrop-blur-md bg-white/70 dark:bg-gray-800/70 border border-gray-200/50 dark:border-gray-700/50',
    flat: 'bg-gray-50 dark:bg-gray-900 border-none',
    outlined: 'bg-transparent border border-gray-200 dark:border-gray-700'
  };
  
  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };
  
  // Elevation classes
  const elevationClass = elevated 
    ? 'shadow-md hover:shadow-lg'
    : '';
  
  // Hover effect
  const hoverClass = hoverEffect 
    ? 'hover:translate-y-[-2px] hover:shadow-md cursor-pointer' 
    : '';
  
  // Clickable
  const clickableClass = onClick ? 'cursor-pointer' : '';
  
  // Combine all classes
  const cardClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${elevationClass}
    ${hoverClass}
    ${clickableClass}
    ${className}
  `;
  
  // Handle header padding differently
  const bodyPaddingClass = padding !== 'none' ? paddingClasses[padding] : '';
  const headerPaddingClass = padding !== 'none' 
    ? `px-${padding === 'sm' ? '3' : padding === 'md' ? '4' : '6'} pt-${padding === 'sm' ? '3' : padding === 'md' ? '4' : '6'} pb-0` 
    : '';
  const footerPaddingClass = padding !== 'none' 
    ? `px-${padding === 'sm' ? '3' : padding === 'md' ? '4' : '6'} pt-2 pb-${padding === 'sm' ? '3' : padding === 'md' ? '4' : '6'}` 
    : '';

  // Render the header if title or headerAction is provided
  const renderHeader = () => {
    if (!title && !headerAction) return null;
    
    return (
      <div className={`flex justify-between items-center mb-4 ${headerPaddingClass}`}>
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {headerAction && (
          <div className="flex-shrink-0">
            {headerAction}
          </div>
        )}
      </div>
    );
  };
  
  // Render the footer if provided
  const renderFooter = () => {
    if (!footer) return null;
    
    return (
      <div className={`mt-4 border-t border-gray-100 dark:border-gray-700 ${footerPaddingClass}`}>
        {footer}
      </div>
    );
  };

  return (
    <div 
      className={cardClasses}
      onClick={onClick}
    >
      {renderHeader()}
      <div className={bodyPaddingClass}>
        {children}
      </div>
      {renderFooter()}
    </div>
  );
};

// Re-export from shadcn
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default EnhancedCard;