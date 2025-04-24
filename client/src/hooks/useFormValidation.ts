import { useState, useCallback } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UseFormReturn, useForm, FieldValues } from 'react-hook-form';

interface ValidationOptions<T extends FieldValues> {
  /**
   * The Zod schema to use for validation
   */
  schema: z.ZodType<T>;
  
  /**
   * Default values for the form
   */
  defaultValues?: Partial<T>;
  
  /**
   * Whether to validate on blur
   * @default true
   */
  validateOnBlur?: boolean;
  
  /**
   * Whether to validate on change
   * @default true
   */
  validateOnChange?: boolean;
  
  /**
   * Whether to validate on submit
   * @default true
   */
  validateOnSubmit?: boolean;
  
  /**
   * Whether to show errors as the user types
   * @default false
   */
  showErrorsOnChange?: boolean;
  
  /**
   * Mode for when to display errors
   * @default "onTouched"
   */
  errorDisplayMode?: 'onSubmit' | 'onBlur' | 'onTouched' | 'onChange' | 'all';
}

/**
 * Hook for advanced form validation using Zod
 */
export function useFormValidation<T extends FieldValues>({
  schema,
  defaultValues,
  validateOnBlur = true,
  validateOnChange = true,
  validateOnSubmit = true,
  showErrorsOnChange = false,
  errorDisplayMode = 'onTouched',
}: ValidationOptions<T>): UseFormReturn<T> {
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Create the form using react-hook-form and zod resolver
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as T,
    mode: errorDisplayMode === 'onChange' ? 'onChange' : 
          errorDisplayMode === 'onBlur' ? 'onBlur' : 
          errorDisplayMode === 'onTouched' ? 'onTouched' : 
          errorDisplayMode === 'all' ? 'all' : 'onSubmit',
  });

  // Enhanced handleSubmit that sets formSubmitted
  const originalHandleSubmit = form.handleSubmit;
  form.handleSubmit = ((onValid, onInvalid) => {
    return originalHandleSubmit((data) => {
      setFormSubmitted(true);
      if (onValid) {
        return onValid(data);
      }
    }, (errors) => {
      setFormSubmitted(true);
      if (onInvalid) {
        return onInvalid(errors);
      }
    });
  }) as UseFormReturn<T>['handleSubmit'];

  // Utility function to get all form errors
  const getFormErrors = useCallback(() => {
    return form.formState.errors;
  }, [form.formState.errors]);

  // Utility function to check if a specific field has an error
  const hasFieldError = useCallback((fieldName: keyof T) => {
    return !!form.formState.errors[fieldName as string];
  }, [form.formState.errors]);

  // Utility function to get a specific field error message
  const getFieldErrorMessage = useCallback((fieldName: keyof T): string | undefined => {
    const error = form.formState.errors[fieldName as string];
    return error?.message as string | undefined;
  }, [form.formState.errors]);

  // Add additional methods to the form
  Object.assign(form, {
    getFormErrors,
    hasFieldError,
    getFieldErrorMessage,
    isFormSubmitted: formSubmitted,
    resetSubmitState: () => setFormSubmitted(false),
  });

  return form as UseFormReturn<T> & {
    getFormErrors: () => Record<string, any>;
    hasFieldError: (fieldName: keyof T) => boolean;
    getFieldErrorMessage: (fieldName: keyof T) => string | undefined;
    isFormSubmitted: boolean;
    resetSubmitState: () => void;
  };
}

/**
 * Extended Zod validator for common validations
 */
export const extendedValidators = {
  /**
   * Phone number validation
   */
  phoneNumber: (message = 'Invalid phone number') => 
    z.string().refine(val => /^\+?[0-9\s\-()]{8,20}$/.test(val), { message }),
    
  /**
   * Password strength validation
   */
  strongPassword: (message = 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character') => 
    z.string().refine(val => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(val), { message }),
    
  /**
   * URL validation
   */
  url: (message = 'Invalid URL format') => 
    z.string().url({ message }),
    
  /**
   * Credit card validation
   */
  creditCard: (message = 'Invalid credit card number') => 
    z.string().refine(val => {
      // Remove spaces and dashes
      const ccNum = val.replace(/[\s-]/g, '');
      // Check if it's numeric and has valid length
      if (!/^\d{13,19}$/.test(ccNum)) return false;
      
      // Luhn algorithm for credit card validation
      let sum = 0;
      let double = false;
      for (let i = ccNum.length - 1; i >= 0; i--) {
        let digit = parseInt(ccNum.charAt(i));
        if (double) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        sum += digit;
        double = !double;
      }
      return sum % 10 === 0;
    }, { message }),
    
  /**
   * Date in the future validation
   */
  dateInFuture: (message = 'Date must be in the future') => 
    z.date().refine(val => val > new Date(), { message }),
    
  /**
   * Date in the past validation
   */
  dateInPast: (message = 'Date must be in the past') => 
    z.date().refine(val => val < new Date(), { message }),
    
  /**
   * Alphanumeric validation
   */
  alphanumeric: (message = 'Must contain only letters and numbers') => 
    z.string().refine(val => /^[a-zA-Z0-9]*$/.test(val), { message }),
};