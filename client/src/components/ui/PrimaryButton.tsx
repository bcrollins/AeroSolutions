import React from 'react';
import { designSystem } from '@/styles/designSystem';
import { useSoundEffects } from '@/hooks/use-sound-effects';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

/**
 * PrimaryButton component with Apple-inspired styling
 * 
 * Features:
 * - Clean, minimal design with subtle hover/active states
 * - Consistent border radius and padding
 * - Optional loading state with spinner
 * - Support for icons on either side
 * - Sound effects on interaction
 */
const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  variant = 'default',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  disabled,
  type = 'button',
  ...props
}) => {
  const { playSound } = useSoundEffects();
  
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500';
  
  // Size classes
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5 rounded-md',
    md: 'text-base px-4 py-2 rounded-md',
    lg: 'text-lg px-6 py-3 rounded-lg'
  };
  
  // Variant classes
  const variantClasses = {
    default: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:bg-primary-300',
    outline: 'bg-transparent border border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100 disabled:text-primary-300 disabled:border-primary-300',
    ghost: 'bg-transparent text-primary-600 hover:bg-primary-50 active:bg-primary-100 disabled:text-primary-300',
    danger: 'bg-error-main text-white hover:bg-error-dark active:bg-error-dark disabled:opacity-50'
  };
  
  // Calculate width
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Calculate loading state
  const loadingClass = loading ? 'opacity-80 cursor-wait' : '';
  
  // Combine all classes
  const buttonClasses = `
    ${baseClasses} 
    ${sizeClasses[size]} 
    ${variantClasses[variant]} 
    ${widthClass}
    ${loadingClass}
    ${className}
  `;
  
  // Handle click with sound effect
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      playSound('click');
      onClick && onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};

export default PrimaryButton;