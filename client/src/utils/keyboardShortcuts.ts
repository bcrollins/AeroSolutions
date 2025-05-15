/**
 * Keyboard Shortcuts Utility
 * 
 * This module provides a centralized system for registering and handling keyboard shortcuts
 * throughout the application, improving accessibility and power user experience.
 */

// Store all the registered keyboard shortcuts
let shortcuts: KeyboardShortcut[] = [];
let enabled: Record<string, boolean> = {};
let initialized = false;

// The categories of keyboard shortcuts
export type ShortcutCategory = 
  'navigation' | 
  'content' | 
  'accessibility' | 
  'ui' | 
  'search';

// Keyboard shortcut definition
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

/**
 * Register a new keyboard shortcut
 * @param shortcut The keyboard shortcut to register
 */
export const registerShortcut = (shortcut: KeyboardShortcut): void => {
  const id = shortcut.id || generateShortcutId(shortcut);
  
  // Check if shortcut already exists
  const existingIndex = shortcuts.findIndex(s => s.id === id);
  
  if (existingIndex !== -1) {
    // Update existing shortcut
    shortcuts[existingIndex] = { ...shortcut, id };
  } else {
    // Add new shortcut
    shortcuts.push({ ...shortcut, id });
    // Enable by default
    enabled[id] = true;
  }
  
  console.log(`Registered keyboard shortcut: ${id} (${formatShortcutKey(shortcut)})`);
};

/**
 * Unregister a keyboard shortcut by ID
 * @param id The ID of the shortcut to unregister
 */
export const unregisterShortcut = (id: string): void => {
  shortcuts = shortcuts.filter(s => s.id !== id);
  delete enabled[id];
};

/**
 * Generate a unique ID for a shortcut based on its properties
 * @param shortcut The shortcut to generate an ID for
 * @returns A unique ID string
 */
const generateShortcutId = (shortcut: KeyboardShortcut): string => {
  const modifiers = [
    shortcut.ctrlKey ? 'ctrl' : '',
    shortcut.shiftKey ? 'shift' : '',
    shortcut.altKey ? 'alt' : '',
    shortcut.metaKey ? 'meta' : '',
  ].filter(Boolean).join('-');
  
  return `${shortcut.category}-${modifiers}-${shortcut.key}`;
};

/**
 * Set whether a shortcut is enabled
 * @param id The ID of the shortcut
 * @param enabled Whether the shortcut should be enabled
 */
export const setShortcutEnabled = (id: string, isEnabled: boolean): void => {
  if (shortcuts.some(s => s.id === id)) {
    enabled[id] = isEnabled;
  }
};

/**
 * Toggle whether a shortcut is enabled and return the new state
 * @param id The ID of the shortcut
 * @returns The new enabled state
 */
export const toggleShortcutEnabled = (id: string): boolean => {
  if (shortcuts.some(s => s.id === id)) {
    enabled[id] = !enabled[id];
    return enabled[id];
  }
  return false;
};

/**
 * Check if a shortcut is enabled
 * @param id The ID of the shortcut
 * @returns Whether the shortcut is enabled
 */
export const isShortcutEnabled = (id: string): boolean => {
  return enabled[id] !== false; // Default to true if not set
};

/**
 * Get all registered shortcuts
 * @returns All shortcuts
 */
export const getAllShortcuts = (): KeyboardShortcut[] => {
  return [...shortcuts];
};

/**
 * Get shortcuts by category
 * @param category The category to filter by
 * @returns Shortcuts in the specified category
 */
export const getShortcutsByCategory = (category: ShortcutCategory): KeyboardShortcut[] => {
  return shortcuts.filter(s => s.category === category);
};

/**
 * Handle keyboard events and trigger shortcut actions
 * @param event The keyboard event
 */
const handleKeyDown = (event: KeyboardEvent): void => {
  // Don't trigger shortcuts when typing in inputs, textareas, etc.
  if (event.target instanceof HTMLInputElement || 
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target as HTMLElement).isContentEditable) {
    return;
  }
  
  // Find matching shortcuts
  const matchingShortcuts = shortcuts.filter(shortcut => {
    const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
    const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey;
    const shiftMatch = !!shortcut.shiftKey === event.shiftKey;
    const altMatch = !!shortcut.altKey === event.altKey;
    const metaMatch = !!shortcut.metaKey === event.metaKey;
    
    return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch;
  });
  
  // Execute enabled shortcuts
  matchingShortcuts.forEach(shortcut => {
    if (enabled[shortcut.id] !== false) { // Default to enabled if not set
      event.preventDefault();
      shortcut.action();
    }
  });
};

/**
 * Initialize the keyboard shortcuts system
 */
export const initKeyboardShortcuts = (): void => {
  if (!initialized && typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown);
    initialized = true;
    console.log('Keyboard shortcuts initialized');
  }
};

/**
 * Clean up the keyboard shortcuts system
 */
export const cleanupKeyboardShortcuts = (): void => {
  if (initialized && typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeyDown);
    initialized = false;
    console.log('Keyboard shortcuts cleaned up');
  }
};

/**
 * Format a shortcut key for display
 * @param shortcut The shortcut to format
 * @returns A formatted string representation
 */
export const formatShortcutKey = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];
  
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.metaKey) parts.push('⌘');
  
  // Format special keys or use the key value
  let key = shortcut.key;
  if (key === ' ') key = 'Space';
  else if (key === 'ArrowUp') key = '↑';
  else if (key === 'ArrowDown') key = '↓';
  else if (key === 'ArrowLeft') key = '←';
  else if (key === 'ArrowRight') key = '→';
  else if (key.length === 1) key = key.toUpperCase();
  
  parts.push(key);
  
  return parts.join(' + ');
};

/**
 * React hook to register a keyboard shortcut with automatic cleanup
 * @param key The key for the shortcut
 * @param callback The action to perform
 * @param options Additional options for the shortcut
 */
export const useKeyboardShortcut = (
  key: string,
  callback: () => void,
  options?: {
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    description?: string;
    category?: ShortcutCategory;
    id?: string;
    enabled?: boolean;
  }
) => {
  // Ensure the keyboard shortcuts system is initialized
  if (!initialized) {
    initKeyboardShortcuts();
  }
  
  const shortcut: KeyboardShortcut = {
    id: options?.id || `${key}-${Date.now()}`,
    key,
    description: options?.description || `Shortcut for ${key}`,
    category: options?.category || 'ui',
    action: callback,
    ctrlKey: options?.ctrlKey,
    shiftKey: options?.shiftKey,
    altKey: options?.altKey,
    metaKey: options?.metaKey,
  };
  
  // Register the shortcut when the component mounts
  registerShortcut(shortcut);
  
  // Set initial enabled state
  if (options?.enabled !== undefined) {
    setShortcutEnabled(shortcut.id, options.enabled);
  }
  
  // Clean up the shortcut when the component unmounts
  return () => {
    unregisterShortcut(shortcut.id);
  };
};

// Initialize the shortcuts system if we're in a browser environment
if (typeof window !== 'undefined') {
  initKeyboardShortcuts();
}

export default {
  registerShortcut,
  unregisterShortcut,
  getAllShortcuts,
  getShortcutsByCategory,
  formatShortcutKey,
  setShortcutEnabled,
  toggleShortcutEnabled,
  isShortcutEnabled,
  initKeyboardShortcuts,
  cleanupKeyboardShortcuts,
  useKeyboardShortcut,
};