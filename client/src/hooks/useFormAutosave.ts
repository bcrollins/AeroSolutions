import { useEffect, useState, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { debounce } from '@/lib/utils';

export interface AutosaveOptions<T> {
  /**
   * The form instance from react-hook-form
   */
  form: UseFormReturn<T>;
  
  /**
   * Function to save the form data
   */
  onSave: (data: T) => Promise<void> | void;
  
  /**
   * Debounce delay in milliseconds
   * @default 1000
   */
  delay?: number;
  
  /**
   * Whether to show success toast notifications
   * @default false
   */
  showSuccessToast?: boolean;
  
  /**
   * Whether to show error toast notifications
   * @default true
   */
  showErrorToast?: boolean;
  
  /**
   * Enable/disable autosave functionality
   * @default true
   */
  enabled?: boolean;
  
  /**
   * Custom success message
   * @default "Changes saved"
   */
  successMessage?: string;
  
  /**
   * Custom error message
   * @default "Failed to save changes"
   */
  errorMessage?: string;
}

export function useFormAutosave<T>({
  form,
  onSave,
  delay = 1000,
  showSuccessToast = false,
  showErrorToast = true,
  enabled = true,
  successMessage = "Changes saved",
  errorMessage = "Failed to save changes"
}: AutosaveOptions<T>) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const previousValuesRef = useRef<T | null>(null);
  const saveCountRef = useRef(0);

  // Configure debounced save function
  const debouncedSave = useRef(
    debounce(async (data: T) => {
      if (!enabled) return;
      
      try {
        setIsSaving(true);
        await onSave(data);
        
        // Update last saved timestamp
        const now = new Date();
        setLastSavedAt(now);
        
        // Show success toast if enabled
        if (showSuccessToast) {
          toast({
            title: successMessage,
            type: 'success',
          });
        }
        
        // Update save counter
        saveCountRef.current += 1;
        
        // Store current values as previous
        previousValuesRef.current = data;
      } catch (error) {
        // Show error toast if enabled
        if (showErrorToast) {
          const errorMsg = error instanceof Error ? error.message : errorMessage;
          toast({
            title: 'Error',
            description: errorMsg,
            type: 'destructive',
          });
        }
        console.error('Autosave error:', error);
      } finally {
        setIsSaving(false);
      }
    }, delay)
  ).current;

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // Watch form values and trigger save when they change
  useEffect(() => {
    if (!enabled) return;
    
    const subscription = form.watch((data) => {
      const currentValues = data as T;
      
      // Skip save if values haven't changed
      if (
        previousValuesRef.current && 
        JSON.stringify(previousValuesRef.current) === JSON.stringify(currentValues)
      ) {
        return;
      }
      
      // Trigger save with debounce
      debouncedSave(currentValues);
    });
    
    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, [form, debouncedSave, enabled]);

  // Force manual save
  const saveNow = async (): Promise<boolean> => {
    if (!enabled) return false;
    
    // Cancel any pending debounced saves
    debouncedSave.cancel();
    
    // Get current form values
    const currentValues = form.getValues() as T;
    
    try {
      setIsSaving(true);
      await onSave(currentValues);
      
      // Update last saved timestamp
      const now = new Date();
      setLastSavedAt(now);
      
      // Show success toast if enabled
      if (showSuccessToast) {
        toast({
          title: successMessage,
          type: 'success',
        });
      }
      
      // Update save counter
      saveCountRef.current += 1;
      
      // Store current values as previous
      previousValuesRef.current = currentValues;
      
      return true;
    } catch (error) {
      // Show error toast if enabled
      if (showErrorToast) {
        const errorMsg = error instanceof Error ? error.message : errorMessage;
        toast({
          title: 'Error',
          description: errorMsg,
          type: 'destructive',
        });
      }
      console.error('Manual save error:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    lastSavedAt,
    saveCount: saveCountRef.current,
    saveNow,
  };
}