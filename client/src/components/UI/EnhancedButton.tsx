import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useSoundEffects } from '@/hooks/use-sound-effects';

// Define button variants using CVA
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        premium: "bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20",
        apple: "bg-white/5 backdrop-blur-md border border-white/10 text-white shadow-sm hover:bg-white/10 dark:bg-black/5 dark:border-white/5 dark:hover:bg-black/10",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 py-1.5",
        lg: "h-11 rounded-md px-8 py-3",
        icon: "h-10 w-10",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
        spin: "animate-spin",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        lg: "rounded-lg",
        xl: "rounded-xl",
      },
      glow: {
        default: "",
        subtle: "shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]",
        strong: "shadow-[0_0_25px_rgba(var(--primary-rgb),0.5)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
      rounded: "default",
      glow: "default",
    },
  }
);

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  soundEffect?: 'click' | 'success' | 'error' | 'navigation';
  withRipple?: boolean;
  hoverScale?: number;
  hoverRotate?: number;
  hoverLift?: boolean;
}

const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    rounded,
    glow,
    children, 
    isLoading, 
    loadingText, 
    leftIcon, 
    rightIcon, 
    soundEffect = 'click',
    withRipple = true,
    hoverScale = 1,
    hoverRotate = 0,
    hoverLift = false,
    ...props 
  }, ref) => {
    // Access sound effects
    const { playSound, settings } = useSoundEffects();
    const soundEnabled = settings?.enabled || false;
    
    // State for ripple effect
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
    const [rippleCount, setRippleCount] = useState(0);

    // Handle ripple effect on button click
    const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!withRipple) return;
      
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newRipple = { x, y, id: rippleCount };
      setRipples([...ripples, newRipple]);
      setRippleCount(rippleCount + 1);
      
      // Remove ripple after animation completes
      setTimeout(() => {
        setRipples(prevRipples => prevRipples.filter(r => r.id !== newRipple.id));
      }, 1000);
    };
    
    // Handle click with sound effect
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      handleRipple(e);
      
      // Play sound if enabled
      if (soundEnabled && soundEffect) {
        playSound(soundEffect);
      }
      
      // Call original onClick if provided
      if (props.onClick) {
        props.onClick(e);
      }
    };

    // Hover animation variants
    const hoverAnimation = {
      scale: hoverScale,
      rotate: hoverRotate,
      y: hoverLift ? -5 : 0,
      transition: { duration: 0.2 }
    };
    
    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, animation, rounded, glow, className }))}
        ref={ref}
        onClick={handleClick}
        disabled={isLoading || props.disabled}
        whileHover={hoverScale !== 1 || hoverRotate !== 0 || hoverLift ? hoverAnimation : undefined}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText || children}
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
        
        {/* Ripple effect */}
        {withRipple && ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </motion.button>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";

export { EnhancedButton, buttonVariants };