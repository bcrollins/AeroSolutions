import React, { useState, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const inputVariants = cva(
  "w-full rounded-md text-sm transition-all duration-200 focus-visible:outline-none",
  {
    variants: {
      variant: {
        default: "border border-input bg-background shadow-sm focus-visible:ring-1 focus-visible:ring-ring",
        outline: "border border-input bg-transparent hover:border-primary/50 focus-visible:border-primary",
        glass: "border border-white/20 bg-white/10 backdrop-blur-md text-white placeholder:text-white/50 focus-visible:border-white/30",
        ghost: "border-none bg-transparent focus-visible:bg-accent/5",
        minimal: "border-b border-input pb-1 rounded-none bg-transparent focus-visible:border-primary",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 py-1 text-xs",
        lg: "h-12 px-5 py-3 text-base",
      },
      state: {
        default: "",
        error: "border-destructive focus-visible:ring-destructive text-destructive",
        success: "border-green-500 focus-visible:ring-green-500 text-green-700",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default",
    },
  }
);

export interface EnhancedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  isAnimated?: boolean;
  onEnterPressed?: () => void;
  withPasswordToggle?: boolean;
}

const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ 
    className, 
    variant, 
    size, 
    state,
    label, 
    helperText, 
    errorMessage, 
    leadingIcon, 
    trailingIcon, 
    isAnimated = true,
    onEnterPressed,
    withPasswordToggle = false,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const hasError = state === 'error' || !!errorMessage;
    const isSuccess = state === 'success';
    const hasValue = props.value !== undefined && props.value !== '';

    // Check if it's a password field with toggle
    const inputType = withPasswordToggle 
      ? isPasswordVisible ? 'text' : 'password' 
      : props.type;

    // Handle input focus
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (props.onFocus) props.onFocus(e);
    };

    // Handle input blur
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (props.onBlur) props.onBlur(e);
    };

    // Handle key press for Enter key
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onEnterPressed) {
        onEnterPressed();
      }
      if (props.onKeyPress) props.onKeyPress(e);
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    return (
      <div className="space-y-2 w-full">
        {label && (
          <motion.label 
            className={cn(
              "block text-sm font-medium mb-1.5 transition-colors",
              hasError ? "text-destructive" : (isFocused ? "text-primary" : "text-foreground")
            )}
            initial={false}
            animate={{ 
              y: isAnimated && isFocused ? -2 : 0,
              color: hasError 
                ? "hsl(var(--destructive))" 
                : (isFocused ? "hsl(var(--primary))" : "hsl(var(--foreground))")
            }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}
        
        <div className="relative">
          {leadingIcon && (
            <div className="absolute left-3 inset-y-0 flex items-center text-muted-foreground">
              {leadingIcon}
            </div>
          )}
          
          <input
            className={cn(
              inputVariants({ variant, size, state, className }),
              leadingIcon && "pl-10",
              (trailingIcon || withPasswordToggle) && "pr-10",
              hasError && "border-destructive focus-visible:ring-destructive",
              isSuccess && "border-green-500 focus-visible:ring-green-500"
            )}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            type={inputType}
            {...props}
          />
          
          {withPasswordToggle && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 inset-y-0 flex items-center text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
          
          {trailingIcon && !withPasswordToggle && (
            <div className="absolute right-3 inset-y-0 flex items-center text-muted-foreground">
              {trailingIcon}
            </div>
          )}
          
          {isAnimated && (
            <motion.div
              className={cn(
                "absolute bottom-0 left-0 h-0.5 bg-primary",
                hasError && "bg-destructive",
                isSuccess && "bg-green-500"
              )}
              initial={{ width: 0 }}
              animate={{ width: isFocused ? '100%' : '0%' }}
              transition={{ duration: 0.3 }}
            />
          )}
        </div>
        
        {(helperText || errorMessage) && (
          <div className="mt-1.5">
            {hasError ? (
              <div className="flex items-center text-xs text-destructive">
                <AlertCircle size={14} className="mr-1.5" />
                <span>{errorMessage}</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

EnhancedInput.displayName = "EnhancedInput";

export { EnhancedInput, inputVariants };