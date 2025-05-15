/**
 * Keyboard Shortcuts Utility
 * 
 * This module provides a centralized system for registering and handling keyboard shortcuts
 * throughout the application, improving accessibility and power user experience.
 */

import { useEffect } from 'react';

// Define shortcut types and interfaces
export interface KeyboardShortcut {
  id: string;
  key: string;
  description: string;
  category: ShortcutCategory;
  action: () => void;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  global?: boolean;
}

export type ShortcutCategory = 
  'navigation' | 
  'content' | 
  'accessibility' | 
  'ui' | 
  'search';

// Registry of all registered shortcuts
const shortcutRegistry: Map<string, KeyboardShortcut> = new Map();

// Array of enabled shortcuts (for toggling)
let enabledShortcuts: Set<string> = new Set();

// Register a new keyboard shortcut
export const registerShortcut = (shortcut: KeyboardShortcut): void => {
  const id = shortcut.id || generateShortcutId(shortcut);
  shortcutRegistry.set(id, shortcut);
  enabledShortcuts.add(id);
};

// Unregister a keyboard shortcut
export const unregisterShortcut = (id: string): void => {
  shortcutRegistry.delete(id);
  enabledShortcuts.delete(id);
};

// Generate a shortcut ID if not provided
const generateShortcutId = (shortcut: KeyboardShortcut): string => {
  const modifiers = [
    shortcut.ctrlKey && 'ctrl',
    shortcut.shiftKey && 'shift',
    shortcut.altKey && 'alt',
    shortcut.metaKey && 'meta'
  ].filter(Boolean).join('+');
  
  return modifiers ? `${modifiers}+${shortcut.key}` : shortcut.key;
};

// Enable or disable a shortcut
export const setShortcutEnabled = (id: string, enabled: boolean): void => {
  if (enabled) {
    enabledShortcuts.add(id);
  } else {
    enabledShortcuts.delete(id);
  }
};

// Toggle shortcut state
export const toggleShortcutEnabled = (id: string): boolean => {
  const isEnabled = enabledShortcuts.has(id);
  setShortcutEnabled(id, !isEnabled);
  return !isEnabled;
};

// Check if a shortcut is enabled
export const isShortcutEnabled = (id: string): boolean => {
  return enabledShortcuts.has(id);
};

// Get all registered shortcuts
export const getAllShortcuts = (): KeyboardShortcut[] => {
  return Array.from(shortcutRegistry.values());
};

// Get all shortcuts for a specific category
export const getShortcutsByCategory = (category: ShortcutCategory): KeyboardShortcut[] => {
  return Array.from(shortcutRegistry.values())
    .filter(shortcut => shortcut.category === category);
};

// Handle keyboard events
const handleKeyDown = (event: KeyboardEvent): void => {
  // Skip if the event target is an input element or contentEditable
  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement ||
    event.target instanceof HTMLSelectElement ||
    (event.target instanceof HTMLElement && event.target.isContentEditable)
  ) {
    return;
  }
  
  // Check each registered shortcut
  for (const [id, shortcut] of shortcutRegistry) {
    // Skip disabled shortcuts
    if (!enabledShortcuts.has(id)) {
      continue;
    }
    
    // Check if the key and modifiers match
    const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
    const ctrlMatches = Boolean(event.ctrlKey) === Boolean(shortcut.ctrlKey);
    const shiftMatches = Boolean(event.shiftKey) === Boolean(shortcut.shiftKey);
    const altMatches = Boolean(event.altKey) === Boolean(shortcut.altKey);
    const metaMatches = Boolean(event.metaKey) === Boolean(shortcut.metaKey);
    
    // If all conditions match, execute the action
    if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
      event.preventDefault();
      shortcut.action();
      break;
    }
  }
};

// Initialize the keyboard shortcuts system
export const initKeyboardShortcuts = (): void => {
  window.addEventListener('keydown', handleKeyDown);
  console.log('Keyboard shortcuts system initialized');
};

// Cleanup the keyboard shortcuts system
export const cleanupKeyboardShortcuts = (): void => {
  window.removeEventListener('keydown', handleKeyDown);
};

// Format a keyboard shortcut for display
export const formatShortcutKey = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];
  
  // Add modifiers
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.metaKey) parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Win');
  
  // Format the key
  let key = shortcut.key;
  
  // Special key formatting
  switch (key.toLowerCase()) {
    case 'arrowup': key = '↑'; break;
    case 'arrowdown': key = '↓'; break;
    case 'arrowleft': key = '←'; break;
    case 'arrowright': key = '→'; break;
    case 'enter': key = '↵'; break;
    case 'escape': key = 'Esc'; break;
    case 'delete': key = 'Del'; break;
    case ' ': key = 'Space'; break;
    default:
      // Capitalize single character keys
      if (key.length === 1) {
        key = key.toUpperCase();
      }
  }
  
  parts.push(key);
  
  return parts.join(' + ');
};

// React hook for using keyboard shortcuts
export const useKeyboardShortcut = (
  key: string,
  action: () => void,
  options: {
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    enabled?: boolean;
    description?: string;
    category?: ShortcutCategory;
    id?: string;
  } = {}
): void => {
  useEffect(() => {
    const id = options.id || generateShortcutId({
      id: '',
      key,
      action,
      description: options.description || '',
      category: options.category || 'ui',
      ctrlKey: options.ctrlKey,
      shiftKey: options.shiftKey,
      altKey: options.altKey,
      metaKey: options.metaKey
    });
    
    const shortcut: KeyboardShortcut = {
      id,
      key,
      action,
      description: options.description || 'No description',
      category: options.category || 'ui',
      ctrlKey: options.ctrlKey,
      shiftKey: options.shiftKey,
      altKey: options.altKey,
      metaKey: options.metaKey
    };
    
    registerShortcut(shortcut);
    
    if (options.enabled === false) {
      setShortcutEnabled(id, false);
    }
    
    return () => {
      unregisterShortcut(id);
    };
  }, [key, action, options]);
};

// Initialize on load
if (typeof window !== 'undefined') {
  initKeyboardShortcuts();
}