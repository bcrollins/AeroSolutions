import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import design from '@/styles/design-system';

/**
 * Advanced Apple-inspired button component that implements the RXAI design system
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary-hover active:bg-primary-active focus-visible:ring-primary/50",
        secondary: "bg-primary-50 text-primary hover:bg-primary-100 active:bg-primary-200 border border-primary-200 focus-visible:ring-primary/30",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-50 active:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 dark:active:bg-gray-700",
        ghost: "bg-transparent hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-800 dark:active:bg-gray-700",
        link: "bg-transparent underline-offset-4 hover:underline text-primary hover:text-primary-hover p-0 h-auto",
      },
      size: {
        xs: "text-xs px-2.5 py-1.5 h-7",
        sm: "text-sm px-3 py-2 h-9",
        md: "text-sm px-4 py-2 h-10",
        lg: "px-4 py-2.5 h-11",
        xl: "text-base px-5 py-3 h-12",
      },
      rounded: {
        default: "rounded-lg",
        full: "rounded-full",
        none: "rounded-none",
      },
      width: {
        auto: "",
        full: "w-full",
      },
      withIcon: {
        true: "inline-flex items-center gap-2",
        false: "",
      },
      animation: {
        none: "",
        lift: "hover:-translate-y-1 active:translate-y-0",
        scale: "hover:scale-105 active:scale-100",
        pulse: "hover:animate-pulse",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      rounded: "default",
      width: "auto",
      withIcon: false,
      animation: "lift",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const RXButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    rounded,
    width,
    withIcon, 
    animation,
    asChild = false,
    loading = false,
    icon,
    iconPosition = "left",
    disabled,
    children,
    style,
    ...props 
  }, ref) => {
    // Determine if we have an icon
    const hasIcon = !!icon || loading;

    // Loading spinner
    const loadingSpinner = (
      <svg 
        className="animate-spin -ml-1 mr-2 h-4 w-4" 
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
    );

    // Create button styles with design system tokens
    const baseStyles = {
      transition: `all ${design.animations.durations.normal} ${design.animations.easings.default}`,
      fontFamily: design.typography.fonts.base,
    };

    return (
      <button
        className={cn(
          buttonVariants({ 
            variant, 
            size, 
            rounded,
            width,
            withIcon: hasIcon,
            animation,
            className 
          })
        )}
        ref={ref}
        disabled={disabled || loading}
        style={{ ...baseStyles, ...style }}
        {...props}
      >
        {loading && loadingSpinner}
        {!loading && icon && iconPosition === "left" && (
          <span className="mr-2">{icon}</span>
        )}
        {children}
        {!loading && icon && iconPosition === "right" && (
          <span className="ml-2">{icon}</span>
        )}
      </button>
    );
  }
);

RXButton.displayName = "RXButton";

export { RXButton, buttonVariants };