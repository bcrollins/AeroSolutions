import React from 'react';
import { cn } from '@/lib/utils';

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary';
  text?: string;
}

export function Loader({
  size = 'md',
  variant = 'default',
  text,
  className,
  ...props
}: LoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  const variantClasses = {
    default: 'border-muted-foreground/30 border-t-muted-foreground/90',
    primary: 'border-primary/30 border-t-primary',
  };

  return (
    <div className="flex flex-col items-center justify-center" {...props}>
      <div
        className={cn(
          'animate-spin rounded-full',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
      />
      {text && <p className="text-sm text-muted-foreground mt-2">{text}</p>}
    </div>
  );
}

export default Loader;