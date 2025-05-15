import { HTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import design from '@/styles/design-system'

const cardVariants = cva(
  "rounded-xl transition-all", 
  {
    variants: {
      variant: {
        default: "bg-white border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700",
        glass: "backdrop-blur-md bg-white/70 border border-white/20 shadow-lg dark:bg-gray-800/70 dark:border-gray-700/50",
        floating: "bg-gradient-to-b from-white to-gray-50 border border-gray-100 shadow-xl dark:from-gray-800 dark:to-gray-900 dark:border-gray-700/50",
        outline: "border border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600",
        plain: "bg-white dark:bg-gray-800",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-5",
        lg: "p-7",
        xl: "p-9",
      },
      animation: {
        none: "",
        lift: "hover:-translate-y-2 hover:shadow-lg",
        scale: "hover:scale-[1.03] hover:shadow-lg",
        glow: "hover:shadow-[0_0_30px_rgba(0,102,204,0.25)] dark:hover:shadow-[0_0_30px_rgba(77,148,255,0.25)]",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      animation: "none",
    },
  }
)

export interface CardProps 
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  as?: React.ElementType;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, animation, as: Component = "div", style, ...props }, ref) => {
    // Create card styles with design system tokens
    const baseStyles = {
      transition: `all ${design.animations.durations.slow} ${design.animations.easings.default}`,
    };

    return (
      <Component
        className={cn(cardVariants({ variant, padding, animation, className }))}
        ref={ref}
        style={{ ...baseStyles, ...style }}
        {...props}
      />
    )
  }
)

Card.displayName = "Card"

const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }