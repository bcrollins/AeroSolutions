import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export interface ShortcutGroup {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
    action?: () => void;
  }[];
}

interface KeyboardShortcutsProps {
  groups: ShortcutGroup[];
  showHelpButton?: boolean;
  buttonClassName?: string;
  hotkey?: string;
  enableShortcuts?: boolean;
  children?: React.ReactNode;
}

/**
 * Keyboard shortcuts component with help dialog and Mac/Windows styling
 */
export default function KeyboardShortcuts({
  groups,
  showHelpButton = true,
  buttonClassName = '',
  hotkey = '?',
  enableShortcuts = true,
  children
}: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  
  // Detect if user is on Mac
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform));
    }
  }, []);
  
  // Register keyboard shortcuts
  useEffect(() => {
    if (!enableShortcuts) return;
    
    // Toggle help dialog when pressing the hotkey
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === hotkey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      
      // Register other shortcuts
      if (!isOpen) {
        for (const group of groups) {
          for (const shortcut of group.shortcuts) {
            // Only handle shortcuts with actions
            if (shortcut.action) {
              const keysPressed = shortcut.keys.map((key) => 
                key === 'Meta' ? (isMac ? 'Meta' : 'Control') : key
              );
              
              // Check if all required modifier keys are pressed
              const allModifiersPressed = keysPressed.every((key) => {
                if (key === 'Meta') return isMac ? e.metaKey : e.ctrlKey;
                if (key === 'Control') return e.ctrlKey;
                if (key === 'Alt') return e.altKey;
                if (key === 'Shift') return e.shiftKey;
                return e.key.toLowerCase() === key.toLowerCase();
              });
              
              // Get the main key (last one in the array)
              const mainKey = keysPressed[keysPressed.length - 1];
              const isMainKeyPressed = 
                ['Meta', 'Control', 'Alt', 'Shift'].includes(mainKey) ? 
                  true : 
                  e.key.toLowerCase() === mainKey.toLowerCase();
              
              // If all conditions are met, execute the action
              if (allModifiersPressed && isMainKeyPressed) {
                e.preventDefault();
                shortcut.action();
              }
            }
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [groups, hotkey, isMac, isOpen, enableShortcuts]);
  
  // Format a key for display based on platform
  const formatKey = (key: string): string => {
    if (key === 'Meta') return isMac ? '⌘' : 'Ctrl';
    if (key === 'Control') return isMac ? '⌃' : 'Ctrl';
    if (key === 'Alt') return isMac ? '⌥' : 'Alt';
    if (key === 'Shift') return isMac ? '⇧' : 'Shift';
    if (key === 'ArrowUp') return '↑';
    if (key === 'ArrowDown') return '↓';
    if (key === 'ArrowLeft') return '←';
    if (key === 'ArrowRight') return '→';
    if (key === 'Enter') return '↵';
    if (key === 'Escape') return 'Esc';
    if (key === 'Backspace') return '⌫';
    if (key === 'Delete') return 'Del';
    if (key === 'Tab') return '⇥';
    if (key === ' ') return 'Space';
    return key;
  };
  
  return (
    <>
      {/* Render children or help button */}
      {children ? (
        <div onClick={() => setIsOpen(true)}>
          {children}
        </div>
      ) : showHelpButton && (
        <Button 
          variant="ghost" 
          size="icon" 
          className={buttonClassName}
          onClick={() => setIsOpen(true)}
          aria-label="Keyboard shortcuts"
        >
          <Command className="h-5 w-5" />
        </Button>
      )}
      
      {/* Keyboard shortcuts dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl w-full max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold mb-1">Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 font-mono text-sm">{isMac ? '⌘' : 'Ctrl'} + {hotkey}</kbd> anytime to show this dialog
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
            <AnimatePresence>
              {groups.map((group, groupIndex) => (
                <motion.div 
                  key={group.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIndex * 0.1 }}
                  className="space-y-3"
                >
                  <h3 className="font-medium text-lg text-primary">{group.title}</h3>
                  <div className="space-y-2">
                    {group.shortcuts.map((shortcut, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: (groupIndex * 0.1) + (index * 0.05) }}
                        className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {shortcut.description}
                        </span>
                        <div className="flex gap-1">
                          {shortcut.keys.map((key, keyIndex) => (
                            <React.Fragment key={keyIndex}>
                              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 font-mono text-sm min-w-[28px] text-center">
                                {formatKey(key)}
                              </kbd>
                              {keyIndex < shortcut.keys.length - 1 && (
                                <span className="text-gray-400 mx-1">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Example usage:
export const defaultShortcuts: ShortcutGroup[] = [
  {
    title: 'General',
    shortcuts: [
      { keys: ['Meta', '?'], description: 'Show keyboard shortcuts' },
      { keys: ['Meta', 'k'], description: 'Open command palette' },
      { keys: ['/'], description: 'Focus search' },
      { keys: ['Escape'], description: 'Close modal/popover' },
    ]
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['g', 'h'], description: 'Go to home' },
      { keys: ['g', 'd'], description: 'Go to dashboard' },
      { keys: ['g', 's'], description: 'Go to settings' },
      { keys: ['g', 'p'], description: 'Go to profile' },
    ]
  },
  {
    title: 'Content',
    shortcuts: [
      { keys: ['Meta', 'Enter'], description: 'Save changes' },
      { keys: ['Meta', '.'], description: 'Open actions menu' },
      { keys: ['Meta', 'Shift', 'p'], description: 'Preview mode' },
    ]
  }
];