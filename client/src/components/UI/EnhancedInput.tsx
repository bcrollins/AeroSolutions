import React, { useState, forwardRef, InputHTMLAttributes, ReactNode, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AlertCircle, Check, Eye, EyeOff, X } from 'lucide-react';

interface EnhancedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  showSuccessIcon?: boolean;
  showErrorIcon?: boolean;
  showClearButton?: boolean;
  onClear?: () => void;
  isPassword?: boolean;
  labelClassName?: string;
  inputClassName?: string;
  containerClassName?: string;
  strength?: 'weak' | 'medium' | 'strong' | null;
  animateLabel?: boolean;
  onTextChange?: (value: string) => void;
}

/**
 * Enhanced input component with animations, icons, and validation states
 */
const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(({
  id,
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  showSuccessIcon = false,
  showErrorIcon = true,
  showClearButton = false,
  onClear,
  isPassword = false,
  labelClassName = '',
  inputClassName = '',
  containerClassName = '',
  strength = null,
  animateLabel = true,
  disabled,
  required,
  className,
  value,
  onChange,
  onTextChange,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  // Create a mutable ref object that won't trigger TypeScript errors
  const inputRef = { current: null as HTMLInputElement | null };
  
  // Forward the ref
  const handleRef = (el: HTMLInputElement) => {
    // Handle function ref
    if (typeof ref === 'function') {
      ref(el);
    } 
    // Handle object ref
    else if (ref && typeof ref === 'object' && 'current' in ref) {
      // Safe assignment using a mutable ref
      (ref as { current: HTMLInputElement | null }).current = el;
    }
    
    // Update our internal ref without TypeScript error
    if (el) {
      // Using a safe non-readonly ref
      inputRef.current = el;
    }
  };
  
  // Update internal state when value prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (onChange) {
      onChange(e);
    }
    
    if (onTextChange) {
      onTextChange(newValue);
    }
  };
  
  // Handle input clearing
  const handleClear = () => {
    setInputValue('');
    
    if (inputRef.current) {
      inputRef.current.value = '';
      
      // Create and dispatch change event
      const event = new Event('change', { bubbles: true });
      inputRef.current.dispatchEvent(event);
      
      // Focus input after clearing
      inputRef.current.focus();
    }
    
    if (onClear) {
      onClear();
    }
    
    if (onTextChange) {
      onTextChange('');
    }
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Determine validation state
  const hasValue = inputValue !== '';
  const isValid = hasValue && !error;
  const isInvalid = hasValue && !!error;
  
  // Determine input type
  const inputType = isPassword 
    ? (showPassword ? 'text' : 'password')
    : props.type || 'text';
  
  // Calculate classes for different states
  const labelClass = cn(
    'text-sm font-medium mb-1.5 block transition-all duration-200',
    isFocused ? 'text-primary' : 'text-foreground',
    error ? 'text-destructive' : '',
    disabled ? 'opacity-60' : '',
    labelClassName
  );
  
  const inputContainerClass = cn(
    'flex items-center relative rounded-md overflow-hidden',
    disabled ? 'opacity-60 cursor-not-allowed' : '',
    containerClassName
  );
  
  const inputClass = cn(
    'flex-1 pr-8',
    leftIcon ? 'pl-9' : '',
    (isValid && showSuccessIcon) || (isInvalid && showErrorIcon) || showClearButton || isPassword 
      ? 'pr-10' 
      : '',
    isFocused ? 'ring-4 ring-primary/10 border-primary' : '',
    error ? 'border-destructive focus:ring-destructive/10' : '',
    inputClassName
  );
  
  // Prepare password toggle icon
  const passwordToggleIcon = showPassword 
    ? <EyeOff className="h-4 w-4 text-gray-500" /> 
    : <Eye className="h-4 w-4 text-gray-500" />;
  
  // Prepare right section elements
  const renderRightSection = () => {
    // Password toggle takes precedence
    if (isPassword) {
      return (
        <button
          type="button"
          className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
          onClick={togglePasswordVisibility}
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          disabled={disabled}
        >
          {passwordToggleIcon}
        </button>
      );
    }
    
    // Clear button
    if (showClearButton && hasValue) {
      return (
        <button
          type="button"
          className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
          onClick={handleClear}
          tabIndex={-1}
          aria-label="Clear input"
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </button>
      );
    }
    
    // Success icon
    if (isValid && showSuccessIcon) {
      return (
        <span className="absolute right-3 text-green-500">
          <Check className="h-4 w-4" />
        </span>
      );
    }
    
    // Error icon
    if (isInvalid && showErrorIcon) {
      return (
        <span className="absolute right-3 text-destructive">
          <AlertCircle className="h-4 w-4" />
        </span>
      );
    }
    
    // Custom right icon
    if (rightIcon) {
      return (
        <span className="absolute right-3">
          {rightIcon}
        </span>
      );
    }
    
    return null;
  };
  
  // Password strength indicator
  const renderStrengthIndicator = () => {
    if (!isPassword || !strength || !hasValue) return null;
    
    const strengthColors = {
      weak: 'bg-red-500',
      medium: 'bg-yellow-500',
      strong: 'bg-green-500'
    };
    
    const strengthLabels = {
      weak: 'Weak',
      medium: 'Medium',
      strong: 'Strong'
    };
    
    return (
      <div className="mt-1 flex items-center">
        <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ 
              width: strength === 'weak' ? '33%' : strength === 'medium' ? '66%' : '100%' 
            }}
            transition={{ duration: 0.3 }}
            className={`h-full ${strengthColors[strength]}`}
          />
        </div>
        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
          {strengthLabels[strength]}
        </span>
      </div>
    );
  };
  
  // Floating label animation variants
  const floatingLabelVariants = {
    focused: {
      y: -22,
      x: 0,
      scale: 0.85,
      color: error ? 'var(--destructive)' : 'var(--primary)',
    },
    blurred: {
      y: 0,
      x: 0,
      scale: 1,
      color: 'var(--muted-foreground)',
    }
  };
  
  return (
    <div className={`mb-4 ${className}`}>
      {/* Regular or animated label */}
      {label && !animateLabel && (
        <Label 
          htmlFor={id} 
          className={labelClass}
        >
          {label} {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      {/* Input container */}
      <div className={inputContainerClass}>
        {/* Left icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {leftIcon}
          </div>
        )}
        
        {/* Input element */}
        <div className="relative w-full">
          {/* Animated floating label */}
          {label && animateLabel && (
            <motion.label
              htmlFor={id}
              initial={hasValue || isFocused ? 'focused' : 'blurred'}
              animate={hasValue || isFocused ? 'focused' : 'blurred'}
              variants={floatingLabelVariants}
              className={`absolute left-3 origin-left transition-none pointer-events-none ${
                hasValue || isFocused ? 'text-xs' : 'text-base'
              }`}
            >
              {label} {required && <span className="text-destructive">*</span>}
            </motion.label>
          )}
          
          <Input
            id={id}
            ref={handleRef}
            type={inputType}
            value={inputValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={inputClass}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            {...props}
          />
        </div>
        
        {/* Right section (icons, buttons) */}
        {renderRightSection()}
      </div>
      
      {/* Password strength indicator */}
      {renderStrengthIndicator()}
      
      {/* Error or hint message */}
      <AnimatePresence>
        {(error || hint) && (
          <motion.div
            id={error ? `${id}-error` : `${id}-hint`}
            className={`flex items-start mt-1.5 text-xs ${
              error ? 'text-destructive' : 'text-muted-foreground'
            }`}
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {error && showErrorIcon && (
              <AlertCircle className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
            )}
            <span>{error || hint}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

EnhancedInput.displayName = 'EnhancedInput';

export default EnhancedInput;