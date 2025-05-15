import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        // Apple-inspired variants
        primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg dark:bg-blue-500 dark:hover:bg-blue-600 dark:active:bg-blue-700",
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:active:bg-gray-500",
        accent: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 shadow-md hover:shadow-lg",
        outline: "border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-100 active:bg-gray-200 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 dark:active:bg-gray-700",
        ghost: "bg-transparent text-gray-900 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-gray-800 dark:active:bg-gray-700",
        link: "bg-transparent text-blue-600 underline-offset-4 hover:underline hover:bg-transparent dark:text-blue-400",
        glass: "backdrop-blur-md bg-white/20 border border-white/10 text-white shadow-lg hover:bg-white/30 active:bg-white/40 dark:bg-black/20 dark:border-white/5 dark:hover:bg-black/30 dark:active:bg-black/40",
        destructive: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 dark:active:bg-red-800",
      },
      size: {
        xs: "h-7 px-2 rounded-md text-xs",
        sm: "h-8 px-3 rounded-md text-sm",
        md: "h-10 px-4 rounded-md text-sm",
        lg: "h-11 px-6 rounded-md text-base",
        xl: "h-12 px-8 rounded-md text-lg",
        icon: "h-10 w-10 rounded-full",
      },
      animation: {
        none: "",
        subtle: "transition-all duration-200",
        lift: "transition-all duration-300 hover:-translate-y-1",
        scale: "transition-all duration-300 hover:scale-105",
        pulse: "transition-all hover:animate-pulse",
      },
      width: {
        auto: "w-auto",
        full: "w-full",
      },
      fontWeight: {
        regular: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      animation: "subtle",
      width: "auto",
      fontWeight: "medium",
    },
  }
);

export interface RXButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loadingText?: string;
}

const RXButton = forwardRef<HTMLButtonElement, RXButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    width,
    fontWeight,
    isLoading = false,
    leftIcon,
    rightIcon,
    loadingText,
    children,
    ...props 
  }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, animation, width, fontWeight, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
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
      </button>
    );
  }
);

RXButton.displayName = "RXButton";

export { RXButton, buttonVariants };