import { useEffect, useCallback, useRef } from 'react';

type KeyCombination = string | string[];
type KeyHandler = (event: KeyboardEvent) => void;
type Options = {
  /**
   * Disable the keyboard shortcut
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Only trigger when these elements have focus
   */
  allowedElements?: string[];
  
  /**
   * Prevent default browser behavior
   * @default true
   */
  preventDefault?: boolean;
  
  /**
   * Ignore shortcuts when a form element is focused
   * @default true
   */
  ignoreFormElements?: boolean;
  
  /**
   * Prevent event propagation
   * @default false
   */
  stopPropagation?: boolean;
  
  /**
   * Only fire once until key is released
   * @default true
   */
  fireOncePerPress?: boolean;
  
  /**
   * Callback fired before the shortcut is triggered
   */
  onBeforeShortcut?: (event: KeyboardEvent) => boolean;
};

/**
 * Hook to handle keyboard shortcuts
 * 
 * @param keyCombination Single key or combination like ['Shift', 'A'] or 'Escape'
 * @param handler Function to execute when keys are pressed
 * @param options Configuration options
 */
export function useKeyboardShortcut(
  keyCombination: KeyCombination,
  handler: KeyHandler,
  options: Options = {}
) {
  const {
    disabled = false,
    allowedElements = [],
    preventDefault = true,
    ignoreFormElements = true,
    stopPropagation = false,
    fireOncePerPress = true,
    onBeforeShortcut,
  } = options;

  // Store the handler in a ref so we don't need to re-bind on every render
  const handlerRef = useRef<KeyHandler>(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  // Track whether the key is currently pressed
  const keyPressedRef = useRef(false);

  // Parse the key combination
  const keys = Array.isArray(keyCombination) 
    ? keyCombination.map(k => k.toLowerCase()) 
    : [keyCombination.toLowerCase()];
    
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return;

      // Skip if already pressed and fireOncePerPress is enabled
      if (fireOncePerPress && keyPressedRef.current) return;

      // Check if all the keys in the combination are pressed
      const currentKey = event.key.toLowerCase();
      const isShiftPressed = event.shiftKey;
      const isCtrlPressed = event.ctrlKey;
      const isAltPressed = event.altKey;
      const isMetaPressed = event.metaKey;

      // Build array of currently pressed modifier keys
      const currentlyPressed = [];
      
      if (isShiftPressed) currentlyPressed.push('shift');
      if (isCtrlPressed) currentlyPressed.push('control');
      if (isAltPressed) currentlyPressed.push('alt');
      if (isMetaPressed) currentlyPressed.push('meta');
      
      // Add the current key
      currentlyPressed.push(currentKey);

      // Check if all required keys are pressed
      const allKeysPressed = keys.every(key => 
        currentlyPressed.includes(key)
      );

      // Check if only the required keys are pressed (no extra modifiers)
      const hasExtraModifiers = currentlyPressed.length > keys.length;

      if (!allKeysPressed || hasExtraModifiers) return;

      // Skip if focused element is a form element and ignoreFormElements is true
      if (ignoreFormElements) {
        const activeElement = document.activeElement;
        const formElements = ['INPUT', 'TEXTAREA', 'SELECT'];
        const isFormElement = activeElement && formElements.includes(activeElement.tagName);
        const isContentEditable = activeElement && activeElement.hasAttribute('contenteditable');
        
        if (isFormElement || isContentEditable) return;
      }
      
      // Check if we should only trigger for specific elements
      if (allowedElements.length > 0) {
        const activeElement = document.activeElement;
        if (!activeElement) return;

        const isAllowedElement = allowedElements.some(selector => {
          if (selector.startsWith('#')) {
            // ID selector
            return activeElement.id === selector.substring(1);
          } else if (selector.startsWith('.')) {
            // Class selector
            return activeElement.classList.contains(selector.substring(1));
          } else {
            // Tag selector
            return activeElement.tagName.toLowerCase() === selector.toLowerCase();
          }
        });

        if (!isAllowedElement) return;
      }

      // Allow for custom condition checks
      if (onBeforeShortcut && !onBeforeShortcut(event)) return;

      // Prevent default browser behavior if required
      if (preventDefault) event.preventDefault();
      if (stopPropagation) event.stopPropagation();

      // Set key as pressed
      keyPressedRef.current = true;

      // Call the handler
      handlerRef.current(event);
    },
    [
      keys, 
      disabled, 
      preventDefault, 
      stopPropagation, 
      ignoreFormElements, 
      allowedElements, 
      fireOncePerPress, 
      onBeforeShortcut
    ]
  );
  
  const handleKeyUp = useCallback(() => {
    keyPressedRef.current = false;
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);
}

/**
 * Predefined key combinations for common actions
 */
export const KeyboardShortcuts = {
  // Navigation
  DASHBOARD: ['Control', 'd'],
  SETTINGS: ['Control', ','],
  HELP: ['Control', 'h'],
  
  // Actions
  SAVE: ['Control', 's'],
  PRINT: ['Control', 'p'],
  NEW: ['Control', 'n'],
  REFRESH: ['F5'],
  
  // Accessibility
  SKIP_TO_CONTENT: ['Tab'],
  FOCUS_SEARCH: ['Control', 'k'],
  CLOSE_DIALOG: ['Escape'],
  
  // Custom ROLLINSX shortcuts
  TOGGLE_DARK_MODE: ['Control', 'Shift', 'd'],
  OPEN_NOTIFICATIONS: ['Control', 'Shift', 'n'],
};