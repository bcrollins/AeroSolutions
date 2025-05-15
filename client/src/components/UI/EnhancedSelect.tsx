import React, { useState, forwardRef } from 'react';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

interface EnhancedSelectProps {
  id: string;
  label?: string;
  placeholder?: string;
  options: SelectOption[] | SelectGroup[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  labelClassName?: string;
  showErrorIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isGrouped?: boolean;
  fullWidth?: boolean;
}

/**
 * Enhanced select component with custom styling and animations
 */
export const EnhancedSelect = forwardRef<HTMLButtonElement, EnhancedSelectProps>(({
  id,
  label,
  placeholder = 'Select an option',
  options,
  value,
  onChange,
  error,
  hint,
  disabled = false,
  required = false,
  className = '',
  triggerClassName = '',
  contentClassName = '',
  labelClassName = '',
  showErrorIcon = true,
  size = 'md',
  isGrouped = false,
  fullWidth = true
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Size classes
  const sizeClasses = {
    sm: { height: 'h-8', text: 'text-xs', padding: 'px-3' },
    md: { height: 'h-10', text: 'text-sm', padding: 'px-4' },
    lg: { height: 'h-12', text: 'text-base', padding: 'px-5' }
  };
  
  const handleValueChange = (newValue: string) => {
    onChange(newValue);
  };
  
  return (
    <div className={`${fullWidth ? 'w-full' : 'inline-block'} ${className}`}>
      {label && (
        <Label 
          htmlFor={id} 
          className={`mb-1.5 block text-sm font-medium ${
            isFocused ? 'text-primary' : ''
          } ${error ? 'text-destructive' : ''} ${labelClassName}`}
        >
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      
      <Select 
        value={value} 
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger 
          id={id}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full ${sizeClasses[size].height} ${sizeClasses[size].text}
            transition-all duration-200
            ${error ? 'border-destructive focus:ring-destructive/20' : ''}
            ${isFocused ? 'ring-4 ring-primary/10' : ''}
            ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
            ${triggerClassName}
          `}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        >
          <SelectValue placeholder={placeholder} />
          <motion.div
            animate={{ rotate: isFocused ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute right-3 pointer-events-none"
          >
            <ChevronDown className="h-4 w-4 opacity-50" />
          </motion.div>
        </SelectTrigger>
        
        <SelectContent
          position="popper"
          className={`max-h-[300px] overflow-auto p-1 ${contentClassName}`}
          sideOffset={4}
        >
          {isGrouped ? (
            // Render grouped options
            (options as SelectGroup[]).map((group) => (
              <SelectGroup key={group.label}>
                <SelectLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
                  {group.label}
                </SelectLabel>
                {group.options.map((option) => (
                  <EnhancedSelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    icon={option.icon}
                    description={option.description}
                    isSelected={value === option.value}
                    size={size}
                  >
                    {option.label}
                  </EnhancedSelectItem>
                ))}
              </SelectGroup>
            ))
          ) : (
            // Render flat options
            (options as SelectOption[]).map((option) => (
              <EnhancedSelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                icon={option.icon}
                description={option.description}
                isSelected={value === option.value}
                size={size}
              >
                {option.label}
              </EnhancedSelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      
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

EnhancedSelect.displayName = 'EnhancedSelect';

// Enhanced select item component
interface EnhancedSelectItemProps {
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
  isSelected: boolean;
  size: 'sm' | 'md' | 'lg';
}

const EnhancedSelectItem = ({
  children,
  value,
  disabled,
  icon,
  description,
  isSelected,
  size
}: EnhancedSelectItemProps) => {
  // Size classes for items
  const sizeClasses = {
    sm: { padding: 'py-1 px-2', text: 'text-xs' },
    md: { padding: 'py-1.5 px-2', text: 'text-sm' },
    lg: { padding: 'py-2 px-3', text: 'text-base' }
  };
  
  return (
    <SelectItem
      value={value}
      disabled={disabled}
      className={`
        relative flex items-center rounded-md cursor-pointer
        ${sizeClasses[size].padding} ${sizeClasses[size].text}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isSelected ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'}
        transition-colors duration-150 focus:bg-accent focus:text-accent-foreground
        data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary
      `}
    >
      <div className="flex items-center min-w-0">
        {icon && <span className="mr-2 flex-shrink-0">{icon}</span>}
        <div className="flex-1 min-w-0">
          <div className="truncate">{children}</div>
          {description && (
            <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {description}
            </div>
          )}
        </div>
      </div>
      
      {isSelected && (
        <Check className="h-4 w-4 ml-2 text-primary flex-shrink-0" />
      )}
    </SelectItem>
  );
};

export default EnhancedSelect;