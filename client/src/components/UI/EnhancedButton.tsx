import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface EnhancedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'premium' | 'success' | 'warning';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  withRipple?: boolean;
  animated?: boolean;
  withHaptic?: boolean;
  className?: string;
  fullWidth?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Enhanced button component with loading states, animations and haptic feedback
 */
export default function EnhancedButton({
  children,
  variant = 'default',
  size = 'default',
  isLoading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  withRipple = true,
  animated = true,
  withHaptic = true,
  className = '',
  fullWidth = false,
  onClick,
  ...props
}: EnhancedButtonProps) {
  // Handle haptic feedback on click
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (withHaptic && navigator.vibrate && !props.disabled && !isLoading) {
      navigator.vibrate(15); // Subtle vibration
    }
    
    if (onClick && !isLoading && !props.disabled) {
      onClick(e);
    }
  };
  
  // Ripple effect state
  const [ripples, setRipples] = React.useState<{ x: number; y: number; size: number; id: number }[]>([]);
  let rippleCount = React.useRef(0);
  
  // Handle ripple effect
  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!withRipple || props.disabled || isLoading) return;
    
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate ripple size based on button size
    const size = Math.max(rect.width, rect.height) * 1.5;
    
    // Create new ripple
    const newRipple = { x, y, size, id: rippleCount.current };
    rippleCount.current += 1;
    
    setRipples((prevRipples) => [...prevRipples, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prevRipples) => prevRipples.filter((ripple) => ripple.id !== newRipple.id));
    }, 600);
  };
  
  // Determine class name based on variant
  let buttonClass = '';
  
  if (variant === 'premium') {
    buttonClass = 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700';
  } else if (variant === 'success') {
    buttonClass = 'bg-green-500 text-white hover:bg-green-600';
  } else if (variant === 'warning') {
    buttonClass = 'bg-amber-500 text-white hover:bg-amber-600';
  }
  
  return (
    <motion.div
      whileHover={animated && !props.disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={animated && !props.disabled && !isLoading ? { scale: 0.98 } : {}}
      className={`relative inline-block ${fullWidth ? 'w-full' : ''}`}
    >
      <Button
        variant={variant === 'premium' || variant === 'success' || variant === 'warning' ? 'default' : variant}
        size={size}
        disabled={isLoading || props.disabled}
        className={`
          relative overflow-hidden
          ${fullWidth ? 'w-full' : ''}
          ${buttonClass}
          ${className}
        `}
        onClick={(e) => {
          handleClick(e);
          handleRipple(e);
        }}
        {...props}
      >
        {/* Ripple effects */}
        {withRipple && ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/20 animate-ripple"
            style={{
              top: ripple.y - ripple.size / 2,
              left: ripple.x - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
            }}
          />
        ))}
        
        {/* Left icon */}
        {icon && iconPosition === 'left' && !isLoading && (
          <span className="mr-2 inline-flex">{icon}</span>
        )}
        
        {/* Loading spinner */}
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        
        {/* Button text */}
        {isLoading && loadingText ? loadingText : children}
        
        {/* Right icon */}
        {icon && iconPosition === 'right' && !isLoading && (
          <span className="ml-2 inline-flex">{icon}</span>
        )}
      </Button>
    </motion.div>
  );
}

// Add ripple animation to tailwind.config.ts
const addRippleAnimation = `
@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

.animate-ripple {
  animation: ripple 0.6s linear forwards;
}
`;

// Append styles when module loads
try {
  if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = addRippleAnimation;
    document.head.appendChild(styleElement);
  }
} catch (error) {
  console.error('Failed to append ripple animation styles:', error);
}