import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Command, Search, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Keyboard } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { motion, AnimatePresence } from 'framer-motion';

// Define keyboard shortcut guide items
interface ShortcutItem {
  key: string;
  description: string;
  category: 'Navigation' | 'Actions' | 'Search' | 'Accessibility';
}

// Apple-inspired keyboard shortcut guide
const KeyboardShortcutsGuide: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { registerShortcut } = useKeyboardShortcuts({ globalMode: true });
  
  // Register keyboard shortcut to open guide (Command+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Command+K (Mac) or Ctrl+K (Windows)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Register ? key to toggle the guide
  useEffect(() => {
    registerShortcut('?', () => {
      setOpen(prev => !prev);
    });
  }, [registerShortcut]);
  
  // Define all keyboard shortcuts
  const shortcuts: ShortcutItem[] = [
    { key: '/', description: 'Focus search', category: 'Search' },
    { key: 'Esc', description: 'Clear search', category: 'Search' },
    { key: '1-6', description: 'Switch tabs', category: 'Navigation' },
    { key: '←', description: 'Previous page', category: 'Navigation' },
    { key: '→', description: 'Next page', category: 'Navigation' },
    { key: '↑/↓', description: 'Navigate articles', category: 'Navigation' },
    { key: 'S', description: 'Save article', category: 'Actions' },
    { key: 'L', description: 'Like article', category: 'Actions' },
    { key: 'C', description: 'Copy link', category: 'Actions' },
    { key: 'M', description: 'Toggle dark mode', category: 'Accessibility' },
    { key: '+/-', description: 'Adjust text size', category: 'Accessibility' },
    { key: '?', description: 'Show this guide', category: 'Accessibility' },
  ];
  
  // Get unique categories
  const categories = Array.from(new Set(shortcuts.map(s => s.category)));
  
  return (
    <>
      {/* Floating keyboard button to show shortcuts */}
      <motion.div 
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
      >
        <Button 
          size="icon" 
          className="h-12 w-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setOpen(true)}
          aria-label="Keyboard shortcuts"
        >
          <Keyboard className="h-5 w-5" />
        </Button>
      </motion.div>
      
      {/* Keyboard shortcuts guide dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-xl p-0 overflow-hidden border-0 shadow-xl">
          <DialogHeader className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-medium flex items-center">
                <Command className="h-5 w-5 mr-2" /> Keyboard Shortcuts
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setOpen(false)}
                className="h-8 w-8 rounded-full text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="max-h-[70vh] overflow-y-auto p-6">
            <div className="grid gap-6">
              {categories.map(category => (
                <div key={category}>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">{category}</h3>
                  <div className="space-y-2">
                    {shortcuts
                      .filter(s => s.category === category)
                      .map(shortcut => (
                        <div key={shortcut.key} className="flex items-center justify-between">
                          <span className="text-gray-700 dark:text-gray-300">{shortcut.description}</span>
                          <div className="flex items-center gap-1">
                            {shortcut.key.split('/').map((k, i) => (
                              <React.Fragment key={i}>
                                {i > 0 && <span className="text-gray-400">/</span>}
                                {k === '←' ? (
                                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm text-gray-800 inline-flex items-center justify-center min-w-[28px]">
                                    <ArrowLeft className="h-3 w-3" />
                                  </kbd>
                                ) : k === '→' ? (
                                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm text-gray-800 inline-flex items-center justify-center min-w-[28px]">
                                    <ArrowRight className="h-3 w-3" />
                                  </kbd>
                                ) : k === '↑' ? (
                                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm text-gray-800 inline-flex items-center justify-center min-w-[28px]">
                                    <ArrowUp className="h-3 w-3" />
                                  </kbd>
                                ) : k === '↓' ? (
                                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm text-gray-800 inline-flex items-center justify-center min-w-[28px]">
                                    <ArrowDown className="h-3 w-3" />
                                  </kbd>
                                ) : k === '/' ? (
                                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm text-gray-800 inline-flex items-center justify-center min-w-[28px]">
                                    <Search className="h-3 w-3" />
                                  </kbd>
                                ) : (
                                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm text-gray-800 inline-flex items-center justify-center min-w-[28px]">
                                    {k}
                                  </kbd>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t text-center text-sm text-gray-500">
            Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs mx-1">?</kbd> at any time to show this guide
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KeyboardShortcutsGuide;