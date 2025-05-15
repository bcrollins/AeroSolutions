import { useCallback, useEffect, useRef, useState } from 'react';
import { useSoundEffects } from './use-sound-effects';

type ShortcutCallback = (e: KeyboardEvent) => void;
type KeyMap = Record<string, ShortcutCallback>;

interface KeyboardShortcutsOptions {
  globalMode?: boolean; // Whether shortcuts work globally or only when no input is focused
  enableHighlighting?: boolean; // Visual highlighting for active shortcut keys
}

/**
 * Apple-inspired keyboard shortcuts hook
 * 
 * This hook allows adding keyboard shortcuts to any component with Apple-style
 * visual feedback and sound effects.
 * 
 * Example usage:
 * ```
 * const { registerShortcut, isShortcutPressed } = useKeyboardShortcuts();
 * 
 * useEffect(() => {
 *   registerShortcut('/', () => {
 *     searchInputRef.current?.focus();
 *   });
 * }, [registerShortcut]);
 * ```
 */
export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const { globalMode = false, enableHighlighting = true } = options;
  const keyMap = useRef<KeyMap>({});
  const pressedKeys = useRef<Set<string>>(new Set());
  const [activeShortcuts, setActiveShortcuts] = useState<Record<string, boolean>>({});
  const { playSound } = useSoundEffects();

  // Register a keyboard shortcut
  const registerShortcut = useCallback((key: string, callback: ShortcutCallback) => {
    const normalizedKey = key.toLowerCase();
    keyMap.current[normalizedKey] = callback;
    
    // Add to active shortcuts for highlighting
    if (enableHighlighting) {
      setActiveShortcuts(prev => ({
        ...prev,
        [normalizedKey]: false
      }));
    }
  }, [enableHighlighting]);
  
  // Check if a shortcut key is currently pressed
  const isShortcutPressed = useCallback((key: string) => {
    const normalizedKey = key.toLowerCase();
    return !!activeShortcuts[normalizedKey];
  }, [activeShortcuts]);
  
  // Handle global keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Normalize key to lowercase
      const key = e.key.toLowerCase();
      
      // Check if this key is registered as a shortcut
      if (!keyMap.current[key]) return;
      
      // In non-global mode, ignore shortcuts when form elements are focused
      if (!globalMode) {
        const activeElement = document.activeElement;
        const isFormElement = activeElement instanceof HTMLInputElement || 
                              activeElement instanceof HTMLTextAreaElement || 
                              activeElement instanceof HTMLSelectElement ||
                              activeElement?.isContentEditable;
                              
        if (isFormElement) return;
      }
      
      // Add to pressed keys set
      pressedKeys.current.add(key);
      
      // Update active state for highlighting (visual feedback)
      if (enableHighlighting) {
        setActiveShortcuts(prev => ({
          ...prev,
          [key]: true
        }));
      }
      
      // Prevent default browser behavior for this key
      e.preventDefault();
      
      // Play a subtle sound effect based on the key type
      // Different sounds for different actions (navigation, search, etc.)
      if (key === 'escape') {
        playSound('notification');
      } else if (key === 'arrowleft' || key === 'arrowright') {
        playSound('click'); // Use click sound for navigation
      } else if (key === '/') {
        playSound('click'); // Use click sound for focus
      } else {
        playSound('click');
      }
      
      // Execute the callback
      keyMap.current[key](e);
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Remove from pressed keys
      pressedKeys.current.delete(key);
      
      // Update active state for highlighting
      if (enableHighlighting && activeShortcuts[key]) {
        setActiveShortcuts(prev => ({
          ...prev,
          [key]: false
        }));
      }
    };
    
    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [enableHighlighting, globalMode, activeShortcuts, playSound]);
  
  return {
    registerShortcut,
    isShortcutPressed,
    activeShortcuts
  };
}

export default useKeyboardShortcuts;