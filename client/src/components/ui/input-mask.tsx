import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Input, InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Masking patterns and tokens
const MASK_TOKENS = {
  // Numeric
  '9': /[0-9]/,       // Digit (required)
  '0': /[0-9]/,       // Digit (optional, preserves placeholder)
  '#': /[0-9]/,       // Digit (optional)
  
  // Alphabetic
  'A': /[A-Za-z]/,    // Letter (required)
  'a': /[A-Za-z]/,    // Letter (optional)
  
  // Alphanumeric
  'N': /[A-Za-z0-9]/, // Alphanumeric (required)
  'n': /[A-Za-z0-9]/, // Alphanumeric (optional)
  
  // Special
  'X': /./,           // Any character (required)
  'x': /./,           // Any character (optional)
  
  // Specific character sets
  'H': /[0-9A-Fa-f]/,  // Hexadecimal character
  'U': /[A-Z]/,        // Uppercase letter
  'L': /[a-z]/,        // Lowercase letter
  'Z': /[A-Z0-9]/,     // Uppercase alphanumeric
};

type InputMaskProps = Omit<InputProps, 'onChange'> & {
  /**
   * Mask pattern string (e.g., "999-999-9999" for phone number)
   */
  mask: string;
  
  /**
   * Value change handler
   */
  onChange?: (value: string, rawValue: string) => void;
  
  /**
   * Placeholder character
   * @default "_"
   */
  placeholderChar?: string;
  
  /**
   * Keep mask characters in returned value
   * @default false
   */
  keepMask?: boolean;
  
  /**
   * Fixed placeholder that doesn't change as user types
   */
  fixedPlaceholder?: string;
  
  /**
   * Custom validator for the full value
   */
  validator?: (value: string) => boolean;
  
  /**
   * Transform function applied after mask processing
   */
  transform?: (value: string) => string;
  
  /**
   * Process the value before displaying
   */
  processDisplay?: (value: string) => string;
  
  /**
   * Character map to override default MASK_TOKENS
   */
  charMap?: Record<string, RegExp>;
  
  /**
   * CSS class for the input wrapper
   */
  wrapperClassName?: string;
};

export const InputMask = React.forwardRef<HTMLInputElement, InputMaskProps>(
  ({ 
    mask, 
    onChange, 
    placeholderChar = '_', 
    keepMask = false,
    fixedPlaceholder,
    validator,
    transform,
    processDisplay,
    charMap,
    className,
    wrapperClassName,
    value: propValue = '',
    ...props 
  }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const mergedRef = useMergeRefs(ref, inputRef);
    
    // Combine default and custom charMap
    const tokenMap = useMemo(() => ({
      ...MASK_TOKENS,
      ...(charMap || {}),
    }), [charMap]);
    
    // Parse the mask to identify pattern literals and tokens
    const { maskArr, placeholderValue } = useMemo(() => {
      const arr: Array<{ token: string, isPattern: boolean }> = [];
      let placeholder = '';
      
      let i = 0;
      while (i < mask.length) {
        const char = mask[i];
        
        // Handle escape character
        if (char === '\\' && i + 1 < mask.length) {
          arr.push({ token: mask[i + 1], isPattern: false });
          placeholder += mask[i + 1];
          i += 2;
          continue;
        }
        
        // Check if this character is a pattern token
        const isPattern = Object.keys(tokenMap).includes(char);
        arr.push({ token: char, isPattern });
        
        // Build placeholder
        placeholder += isPattern ? placeholderChar : char;
        i++;
      }
      
      return { maskArr: arr, placeholderValue: placeholder };
    }, [mask, tokenMap, placeholderChar]);
    
    // Internal state for input value
    const [inputValue, setInputValue] = useState<string>(() => {
      return maskValue(String(propValue), maskArr, tokenMap);
    });
    
    // Build placeholder string
    const displayPlaceholder = useMemo(() => {
      return fixedPlaceholder || placeholderValue;
    }, [fixedPlaceholder, placeholderValue]);
    
    // Track cursor position
    const cursorPosition = useRef<number>(0);
    
    // Update internal state when prop value changes
    useEffect(() => {
      setInputValue(maskValue(String(propValue), maskArr, tokenMap));
    }, [propValue, maskArr, tokenMap]);
    
    // Apply mask to a raw value
    function maskValue(rawValue: string, maskArray: Array<{ token: string, isPattern: boolean }>, tokens: typeof MASK_TOKENS): string {
      let result = '';
      let rawIndex = 0;
      
      // Process each mask character
      for (let i = 0; i < maskArray.length; i++) {
        const { token, isPattern } = maskArray[i];
        
        if (rawIndex >= rawValue.length) {
          // We've used all raw input, add required static tokens
          if (!isPattern) {
            result += token;
          } else {
            break;
          }
        } else if (isPattern) {
          // This is a pattern token, check the next raw character against it
          const char = rawValue[rawIndex];
          const pattern = tokens[token];
          
          if (pattern.test(char)) {
            // Character matches pattern, add it to result
            result += char;
            rawIndex++;
          } else if (['0', '#', 'a', 'n', 'x'].includes(token)) {
            // Optional token, skip but don't consume raw character
            if (token === '0') {
              result += placeholderChar;
            }
            break;
          } else {
            // Required token but char doesn't match, keep looking for a match
            rawIndex++;
            i--; // Try this token against the next raw character
          }
        } else {
          // This is a literal character from the mask
          result += token;
          
          // If the raw value has this character, skip it
          if (rawValue[rawIndex] === token) {
            rawIndex++;
          }
        }
      }
      
      return result;
    }
    
    // Get raw value by stripping non-pattern characters
    function getRawValue(maskedValue: string): string {
      let result = '';
      let maskIndex = 0;
      
      for (let i = 0; i < maskedValue.length; i++) {
        if (maskIndex >= maskArr.length) break;
        
        const { token, isPattern } = maskArr[maskIndex];
        const char = maskedValue[i];
        
        if (isPattern) {
          // This position corresponds to a pattern token
          if (char !== placeholderChar) {
            result += char;
          }
        } else if (char === token) {
          // Skip mask literals
        } else {
          // Character doesn't match mask, include it
          result += char;
        }
        
        maskIndex++;
      }
      
      return result;
    }
    
    // Calculate next cursor position after masking
    function getNextCursorPosition(
      rawValue: string, 
      selectionStart: number, 
      direction: 'forward' | 'backward' = 'forward'
    ): number {
      // Find the next cursor position by simulating mask application
      const maskedValue = maskValue(rawValue, maskArr, tokenMap);
      let rawIndex = 0;
      let maskIndex = 0;
      let targetPos = selectionStart;
      
      // When going backward, adjust the target position
      if (direction === 'backward' && targetPos > 0) {
        targetPos--;
      }
      
      // Process the mask to find cursor position
      for (let i = 0; i < maskedValue.length; i++) {
        if (maskIndex >= maskArr.length) break;
        
        const { isPattern } = maskArr[maskIndex];
        
        if (isPattern) {
          if (rawIndex === targetPos) {
            return i;
          }
          rawIndex++;
        }
        
        maskIndex++;
      }
      
      // If we've consumed all raw input, position cursor at the end
      return maskedValue.length;
    }
    
    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      const currentSelectionStart = e.target.selectionStart || 0;
      
      // Extract raw input by comparing with mask pattern
      let rawValue = getRawValue(newValue);
      
      // Apply mask to raw input
      const maskedValue = maskValue(rawValue, maskArr, tokenMap);
      
      // Apply validator if provided
      if (validator && !validator(maskedValue)) {
        return;
      }
      
      // Apply transform if provided
      const displayValue = transform ? transform(maskedValue) : maskedValue;
      
      // Determine cursor position
      const direction = newValue.length < inputValue.length ? 'backward' : 'forward';
      const nextPosition = getNextCursorPosition(rawValue, currentSelectionStart, direction);
      
      // Save for when we set cursor position after render
      cursorPosition.current = nextPosition;
      
      // Update state
      setInputValue(displayValue);
      
      // Call onChange handler with masked and raw values
      if (onChange) {
        onChange(keepMask ? displayValue : rawValue, rawValue);
      }
    };
    
    // Set cursor position after value changes
    useEffect(() => {
      const input = inputRef.current;
      if (input) {
        input.setSelectionRange(cursorPosition.current, cursorPosition.current);
      }
    }, [inputValue]);
    
    // Display value formatting
    const displayValue = useMemo(() => {
      return processDisplay ? processDisplay(inputValue) : inputValue;
    }, [inputValue, processDisplay]);
    
    return (
      <div className={cn("relative", wrapperClassName)}>
        <Input
          ref={mergedRef}
          value={displayValue}
          onChange={handleChange}
          placeholder={displayPlaceholder}
          className={className}
          {...props}
        />
      </div>
    );
  }
);

InputMask.displayName = 'InputMask';

// Predefined masks
export const DATE_MASK = '99/99/9999';
export const TIME_MASK = '99:99';
export const DATETIME_MASK = '99/99/9999 99:99';
export const PHONE_MASK = '(999) 999-9999';
export const SSN_MASK = '999-99-9999';
export const CREDIT_CARD_MASK = '9999 9999 9999 9999';
export const ZIP_CODE_MASK = '99999-9999';
export const CURRENCY_MASK = '$999,999.99';
export const PERCENT_MASK = '99.99%';
export const IP_ADDRESS_MASK = '999.999.999.999';

/**
 * Utility function to format a credit card number with spaces
 */
export function formatCreditCard(value: string): string {
  return value.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/**
 * Utility function to format a number as currency
 * @param value The number to format
 * @param currency The currency symbol (default: '$')
 * @param locale The locale to use (default: 'en-US')
 */
export function formatCurrency(value: number | string, currency = '$', locale = 'en-US'): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return `${currency}0.00`;
  
  return num.toLocaleString(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Helper to merge multiple refs
function useMergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return useCallback((value: T) => {
    refs.forEach(ref => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T>).current = value;
      }
    });
  }, [refs]);
}