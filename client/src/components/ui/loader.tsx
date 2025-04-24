import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const loaderVariants = cva(
  "inline-block animate-spin rounded-full border-[3px] border-current border-t-transparent text-primary",
  {
    variants: {
      size: {
        xs: "h-4 w-4",
        sm: "h-6 w-6",
        md: "h-8 w-8",
        lg: "h-12 w-12",
        xl: "h-16 w-16",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

interface LoaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loaderVariants> {
  asChild?: boolean
}

const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(loaderVariants({ size }), className)}
        {...props}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    )
  }
)
Loader.displayName = "Loader"

interface LoadingStateProps {
  isLoading: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
  spinnerSize?: "xs" | "sm" | "md" | "lg" | "xl"
  spinnerClassName?: string
}

const LoadingState = ({
  isLoading,
  children,
  fallback,
  className,
  spinnerSize = "md",
  spinnerClassName,
}: LoadingStateProps) => {
  // If not loading, render children
  if (!isLoading) return <>{children}</>

  // If loading and fallback is provided, render fallback
  if (fallback) return <>{fallback}</>

  // If loading and no fallback, render default loader
  return (
    <div className={cn("flex items-center justify-center p-4", className)}>
      <Loader size={spinnerSize} className={spinnerClassName} />
    </div>
  )
}

const OverlayLoader = ({
  className,
  spinnerClassName,
  spinnerSize = "md",
  message,
}: {
  className?: string
  spinnerClassName?: string
  spinnerSize?: "xs" | "sm" | "md" | "lg" | "xl"
  message?: string
}) => {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm",
        className
      )}
    >
      <Loader size={spinnerSize} className={spinnerClassName} />
      {message && (
        <p className="mt-4 text-sm font-medium text-muted-foreground">{message}</p>
      )}
    </div>
  )
}

export { Loader, LoadingState, OverlayLoader }