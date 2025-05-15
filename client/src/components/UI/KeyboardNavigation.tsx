import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Command } from 'lucide-react';

// Keyboard shortcut type
export interface KeyboardShortcut {
  key: string;  // Single key or key combination like 'g'
  modifier?: 'ctrl' | 'alt' | 'shift' | 'meta'; // Keyboard modifier
  description: string;
  action: () => void;
  category?: string; // For grouping shortcuts
  isGlobal?: boolean; // If true, works everywhere. If false, only on specific routes
  routes?: string[]; // Routes where this shortcut is active
}

interface KeyboardNavigationProps {
  shortcuts: KeyboardShortcut[];
  showHelpKey?: string; // Key to show/hide help overlay
  helpModifier?: 'ctrl' | 'alt' | 'shift' | 'meta';
  showIndicator?: boolean; // Small indicator that keyboard navigation is available
}

/**
 * Enhanced keyboard navigation component for power users
 * Provides customizable keyboard shortcuts and help overlay
 */
export function KeyboardNavigation({
  shortcuts,
  showHelpKey = '?',
  helpModifier = 'shift',
  showIndicator = true
}: KeyboardNavigationProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  
  // Group shortcuts by category
  const shortcutsByCategory = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);
  
  // Update location when URL changes
  useEffect(() => {
    const updateLocation = () => {
      setLocation(window.location.pathname);
    };
    
    updateLocation();
    window.addEventListener('popstate', updateLocation);
    
    return () => {
      window.removeEventListener('popstate', updateLocation);
    };
  }, []);
  
  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle help overlay with shift+?
      if (e.key === showHelpKey && getModifierStatus(e, helpModifier)) {
        e.preventDefault();
        setShowHelp(prev => !prev);
        return;
      }
      
      // Don't trigger shortcuts if user is typing in an input
      if (isUserTyping()) return;
      
      // Don't process other shortcuts if help is showing
      if (showHelp) return;
      
      // Check if a shortcut matches
      for (const shortcut of shortcuts) {
        const keyMatches = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const modifierMatches = shortcut.modifier ? getModifierStatus(e, shortcut.modifier) : true;
        const routeMatches = shortcut.isGlobal || !shortcut.routes || shortcut.routes.some(route => 
          location === route || (route.endsWith('*') && location.startsWith(route.slice(0, -1)))
        );
        
        if (keyMatches && modifierMatches && routeMatches) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, showHelpKey, helpModifier, showHelp, location]);
  
  // Check if user is typing in an input field
  const isUserTyping = () => {
    const activeElement = document.activeElement;
    return (
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement ||
      (activeElement instanceof HTMLElement && activeElement.isContentEditable)
    );
  };
  
  // Check if a modifier key is pressed
  const getModifierStatus = (e: KeyboardEvent, modifier: 'ctrl' | 'alt' | 'shift' | 'meta') => {
    switch (modifier) {
      case 'ctrl': return e.ctrlKey;
      case 'alt': return e.altKey;
      case 'shift': return e.shiftKey;
      case 'meta': return e.metaKey;
      default: return false;
    }
  };
  
  // Format key for display (e.g., "meta+k" becomes "⌘K" on Mac)
  const formatKeyForDisplay = (key: string, modifier?: 'ctrl' | 'alt' | 'shift' | 'meta') => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    let modifierSymbol = '';
    if (modifier) {
      switch (modifier) {
        case 'ctrl': modifierSymbol = isMac ? '⌃' : 'Ctrl+'; break;
        case 'alt': modifierSymbol = isMac ? '⌥' : 'Alt+'; break;
        case 'shift': modifierSymbol = isMac ? '⇧' : 'Shift+'; break;
        case 'meta': modifierSymbol = isMac ? '⌘' : 'Win+'; break;
      }
    }
    
    // Special key symbols
    const keyDisplay = key.length === 1 
      ? key.toUpperCase() 
      : key.charAt(0).toUpperCase() + key.slice(1);
    
    return `${modifierSymbol}${keyDisplay}`;
  };
  
  // Render the help overlay
  const renderHelpOverlay = () => {
    return createPortal(
      <AnimatePresence>
        {showHelp && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-background rounded-lg border border-border shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Command size={20} />
                  Keyboard Shortcuts
                </h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-md"
                >
                  Esc
                </button>
              </div>
              
              <div className="p-2 border-b border-border bg-muted/30">
                <div className="flex flex-wrap gap-2">
                  {Object.keys(shortcutsByCategory).map(category => (
                    <button
                      key={category}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        activeCategory === category 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                      onClick={() => setActiveCategory(
                        activeCategory === category ? null : category
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid gap-4">
                  {Object.entries(shortcutsByCategory)
                    .filter(([category]) => 
                      activeCategory === null || activeCategory === category
                    )
                    .map(([category, categoryShortcuts]) => (
                      <div key={category} className="space-y-2">
                        {activeCategory === null && (
                          <h3 className="text-lg font-medium text-muted-foreground mb-2">
                            {category}
                          </h3>
                        )}
                        
                        <div className="grid gap-2">
                          {categoryShortcuts.map((shortcut, index) => (
                            <div 
                              key={index} 
                              className="flex items-center justify-between bg-background rounded-md p-3 hover:bg-muted/50 transition-colors"
                            >
                              <span className="text-sm">{shortcut.description}</span>
                              <span className="bg-muted px-2 py-1 rounded text-xs font-mono">
                                {formatKeyForDisplay(shortcut.key, shortcut.modifier)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="p-4 border-t border-border bg-muted/30 text-sm text-muted-foreground">
                Press <kbd className="rounded bg-muted px-2 py-1 text-xs">{formatKeyForDisplay(showHelpKey, helpModifier)}</kbd> to toggle this help dialog
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    );
  };
  
  // Small indicator that keyboard shortcuts are available
  const renderIndicator = () => {
    if (!showIndicator) return null;
    
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setShowHelp(true)}
          className="bg-background border border-border rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-muted transition-colors"
          aria-label="Show keyboard shortcuts"
        >
          <Command size={16} />
        </button>
      </div>
    );
  };

  return (
    <>
      {renderHelpOverlay()}
      {renderIndicator()}
    </>
  );
}