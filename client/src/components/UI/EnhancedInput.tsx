import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedInputProps {
  id: string;
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  success?: boolean;
  hint?: string;
  required?: boolean;
  autoComplete?: string;
  className?: string;
  maxLength?: number;
  showCharCount?: boolean;
  validateOnChange?: boolean;
  validate?: (value: string) => { valid: boolean; message?: string } | undefined;
}

/**
 * Enhanced input component with real-time validation feedback and animations
 */
export default function EnhancedInput({
  id,
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  success,
  hint,
  required = false,
  autoComplete,
  className = '',
  maxLength,
  showCharCount = false,
  validateOnChange = false,
  validate
}: EnhancedInputProps) {
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>(undefined);
  const [isValid, setIsValid] = useState<boolean | undefined>(undefined);
  
  // Handle validation
  useEffect(() => {
    if (validate && (touched || validateOnChange)) {
      const result = validate(value);
      if (result) {
        setIsValid(result.valid);
        setLocalError(result.valid ? undefined : result.message);
      }
    }
  }, [value, validate, touched, validateOnChange]);
  
  // Reset validation state when error prop changes
  useEffect(() => {
    if (error !== undefined) {
      setLocalError(error);
      setIsValid(!error);
    }
  }, [error]);
  
  // Update validation state when success prop changes
  useEffect(() => {
    if (success !== undefined) {
      setIsValid(success);
    }
  }, [success]);
  
  const handleInputFocus = () => {
    setFocused(true);
  };
  
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    setTouched(true);
    if (onBlur) onBlur(e);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
  };
  
  // Determine the state for styling
  const inputState = localError ? 'error' : isValid ? 'success' : 'default';
  
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex justify-between items-baseline mb-1.5">
        <Label 
          htmlFor={id} 
          className={`text-sm font-medium transition-colors duration-200 ${
            focused ? 'text-primary' : ''
          }`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        
        {showCharCount && maxLength && (
          <span className={`text-xs ${value.length > maxLength ? 'text-red-500' : 'text-gray-500'}`}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      
      <div className="relative">
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className={`transition-all duration-200 ${
            inputState === 'error' 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
              : inputState === 'success' 
              ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20' 
              : ''
          } ${focused ? 'shadow-sm scale-[1.01] bg-white' : ''}`}
          aria-invalid={inputState === 'error'}
          aria-describedby={`${id}-feedback`}
          required={required}
        />
        
        <AnimatePresence>
          {(isValid || localError) && (
            <motion.div 
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {isValid && !localError ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <AnimatePresence>
        {(localError || hint) && (
          <motion.div
            id={`${id}-feedback`}
            className={`flex items-start mt-1 text-xs ${
              localError ? 'text-red-500' : 'text-gray-500'
            }`}
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {localError ? (
              <AlertCircle className="h-3.5 w-3.5 mr-1 mt-0.5 flex-shrink-0" />
            ) : hint ? (
              <HelpCircle className="h-3.5 w-3.5 mr-1 mt-0.5 flex-shrink-0" />
            ) : null}
            <span>{localError || hint}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}