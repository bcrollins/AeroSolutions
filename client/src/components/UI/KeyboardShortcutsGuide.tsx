import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ArrowLeft, ArrowRight, Home, Layers, Book, HelpCircle, Settings } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useSoundEffects } from '@/hooks/use-sound-effects';

/**
 * Apple-inspired keyboard shortcuts guide modal
 * 
 * This component displays an elegant overlay with all available keyboard shortcuts,
 * following Apple's design principles for help overlays.
 */
const KeyboardShortcutsGuide: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { registerShortcut } = useKeyboardShortcuts();
  const { playSound } = useSoundEffects();
  
  // Register the shortcut to toggle the guide
  useEffect(() => {
    registerShortcut('?', () => {
      setIsVisible(prev => !prev);
      playSound(isVisible ? 'click' : 'notification');
    });
    
    registerShortcut('escape', () => {
      if (isVisible) {
        setIsVisible(false);
        playSound('click');
      }
    });
  }, [registerShortcut, isVisible, playSound]);
  
  // Keyboard shortcut sections
  const shortcutSections = [
    {
      title: "Navigation",
      shortcuts: [
        { key: "h", description: "Go to home page", icon: <Home size={16} /> },
        { key: "n", description: "Go to news", icon: <Book size={16} /> },
        { key: "←", description: "Previous page", icon: <ArrowLeft size={16} /> },
        { key: "→", description: "Next page", icon: <ArrowRight size={16} /> },
      ]
    },
    {
      title: "Content",
      shortcuts: [
        { key: "/", description: "Focus search", icon: <Search size={16} /> },
        { key: "1-6", description: "Navigate to tab", icon: <Layers size={16} /> },
        { key: "s", description: "Save article", icon: <Book size={16} /> },
        { key: "Esc", description: "Clear search/close dialog", icon: <X size={16} /> },
      ]
    },
    {
      title: "Interface",
      shortcuts: [
        { key: "?", description: "Toggle this guide", icon: <HelpCircle size={16} /> },
        { key: "t", description: "Toggle theme", icon: <Settings size={16} /> },
        { key: "m", description: "Toggle sound", icon: <Settings size={16} /> },
      ]
    }
  ];
  
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsVisible(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-w-3xl w-full glass-effect rounded-xl p-6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 p-3">
              <button 
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close keyboard shortcuts guide"
              >
                <X size={20} />
              </button>
            </div>
            
            <h2 className="text-2xl font-medium mb-6 text-white flex items-center gap-2">
              <HelpCircle size={20} className="text-electric-cyan-400" />
              Keyboard Shortcuts
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {shortcutSections.map((section) => (
                <div key={section.title} className="space-y-4">
                  <h3 className="text-lg font-medium text-electric-cyan-400">{section.title}</h3>
                  <div className="space-y-3">
                    {section.shortcuts.map((shortcut) => (
                      <div key={shortcut.key} className="flex items-center space-x-3">
                        <kbd className="apple-kbd flex items-center justify-center">
                          {shortcut.key}
                        </kbd>
                        <div className="flex items-center space-x-2">
                          {shortcut.icon}
                          <span className="text-gray-200 text-sm">{shortcut.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-700/30 text-center text-gray-400 text-sm">
              Press <kbd className="apple-kbd-inline">Esc</kbd> to close or click outside
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KeyboardShortcutsGuide;