import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    variant?: 'default' | 'glass' | 'outline' | 'accent' | 'elevated'
  }
>(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
      variant === 'default' && "border-border bg-card",
      variant === 'glass' && "border-transparent bg-background/60 backdrop-blur-md",
      variant === 'outline' && "border-primary/10 bg-transparent",
      variant === 'accent' && "border-primary/20 bg-primary/5",
      variant === 'elevated' && "border-transparent bg-card shadow-md hover:shadow-lg",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { compact?: boolean }
>(({ className, compact, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5", 
      compact ? "p-4" : "p-6",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { 
    size?: 'sm' | 'md' | 'lg',
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  }
>(({ className, size = 'md', as: Comp = 'h3', ...props }, ref) => {
  const Element = Comp as any;
  return (
    <Element
      ref={ref}
      className={cn(
        "font-semibold leading-tight tracking-tight text-foreground",
        size === 'sm' && "text-lg",
        size === 'md' && "text-xl md:text-2xl",
        size === 'lg' && "text-2xl md:text-3xl",
        className
      )}
      {...props}
    />
  );
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { size?: 'xs' | 'sm' | 'md' }
>(({ className, size = 'sm', ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-muted-foreground", 
      size === 'xs' && "text-xs",
      size === 'sm' && "text-sm",
      size === 'md' && "text-base",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    compact?: boolean,
    noPadding?: boolean 
  }
>(({ className, compact, noPadding, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      noPadding ? "" : compact ? "p-4 pt-0" : "p-6 pt-0",
      className
    )} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    compact?: boolean,
    bordered?: boolean
  }
>(({ className, compact, bordered, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center",
      compact ? "p-4 pt-0" : "p-6 pt-0",
      bordered && "mt-4 border-t pt-4",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
