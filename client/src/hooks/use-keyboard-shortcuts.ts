import { useEffect, useState } from 'react';
import { useSoundEffects } from './use-sound-effects';

// Types for keyboard shortcuts
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
  const { 
    globalMode = false, 
    enableHighlighting = true 
  } = options;
  
  const [keyMap, setKeyMap] = useState<KeyMap>({});
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const { playSound } = useSoundEffects();
  
  // Register a keyboard shortcut
  const registerShortcut = (key: string, callback: ShortcutCallback) => {
    setKeyMap(prev => ({ ...prev, [key.toLowerCase()]: callback }));
  };
  
  // Unregister a keyboard shortcut
  const unregisterShortcut = (key: string) => {
    setKeyMap(prev => {
      const newMap = { ...prev };
      delete newMap[key.toLowerCase()];
      return newMap;
    });
  };
  
  // Clear all keyboard shortcuts
  const clearShortcuts = () => {
    setKeyMap({});
  };
  
  // Check if a shortcut is currently pressed
  const isShortcutPressed = (key: string) => {
    return activeKeys.has(key.toLowerCase());
  };
  
  useEffect(() => {
    // Handle keydown events
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Skip if we're in an input element and not in global mode
      if (!globalMode && 
          (e.target instanceof HTMLInputElement || 
           e.target instanceof HTMLTextAreaElement || 
           (e.target instanceof HTMLElement && e.target.isContentEditable))) {
        return;
      }
      
      // If the key is registered as a shortcut
      if (keyMap[key]) {
        // Update active keys for highlighting
        if (enableHighlighting) {
          setActiveKeys(prev => new Set(prev).add(key));
        }
        
        // Prevent default browser behavior for this key
        e.preventDefault();
        
        // Play a subtle click sound for better feedback
        playSound('click');
        
        // Execute the callback
        keyMap[key](e);
      }
    };
    
    // Handle keyup events (for visual highlighting)
    const handleKeyUp = (e: KeyboardEvent) => {
      if (enableHighlighting) {
        const key = e.key.toLowerCase();
        setActiveKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }
    };
    
    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Clean up on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keyMap, globalMode, enableHighlighting, playSound]);
  
  return {
    registerShortcut,
    unregisterShortcut,
    clearShortcuts,
    isShortcutPressed,
    activeKeys: Array.from(activeKeys)
  };
}

export default useKeyboardShortcuts;