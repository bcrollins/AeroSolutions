import React, { useState, useEffect, useCallback } from 'react';
import { Command } from 'cmdk';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Sparkles, Navigation, Settings, Keyboard, CheckCircle2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useSoundEffects } from '@/hooks/use-sound-effects';

// Command types
interface CommandItem {
  id: string;
  name: string;
  description?: string;
  keywords?: string[];
  icon?: JSX.Element;
  action: () => void;
  shortcut?: string;
  category: 'navigation' | 'action' | 'settings' | 'search';
}

interface CommandPaletteProps {
  onClose?: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  onClose, 
  isOpen, 
  setIsOpen 
}) => {
  const [location, setLocation] = useLocation();
  const [inputValue, setInputValue] = useState('');
  const [pages, setPages] = useState<string[]>([]);
  const { playSound } = useSoundEffects();
  
  // Default commands
  const commands: CommandItem[] = [
    // Navigation commands
    {
      id: 'nav-home',
      name: 'Go to Home',
      description: 'Navigate to the home page',
      keywords: ['home', 'start', 'main', 'landing'],
      icon: <Navigation className="h-4 w-4" />,
      action: () => {
        playSound('navigation');
        navigate('/');
        setIsOpen(false);
      },
      shortcut: 'g h',
      category: 'navigation'
    },
    {
      id: 'nav-articles',
      name: 'Go to Articles',
      description: 'Browse all articles',
      keywords: ['articles', 'blog', 'posts', 'read'],
      icon: <Navigation className="h-4 w-4" />,
      action: () => {
        playSound('navigation');
        navigate('/articles');
        setIsOpen(false);
      },
      shortcut: 'g a',
      category: 'navigation'
    },
    {
      id: 'nav-courses',
      name: 'Go to Courses',
      description: 'Browse all courses',
      keywords: ['courses', 'learning', 'education', 'study'],
      icon: <Navigation className="h-4 w-4" />,
      action: () => {
        playSound('navigation');
        navigate('/courses');
        setIsOpen(false);
      },
      shortcut: 'g c',
      category: 'navigation'
    },
    
    // Settings commands
    {
      id: 'settings-theme',
      name: 'Toggle Dark Mode',
      description: 'Switch between light and dark theme',
      keywords: ['theme', 'dark', 'light', 'mode', 'color'],
      icon: <Settings className="h-4 w-4" />,
      action: () => {
        playSound('click');
        // Dispatch event for theme toggle
        window.dispatchEvent(new CustomEvent('toggle-dark-mode'));
        setIsOpen(false);
      },
      shortcut: '⌥ d',
      category: 'settings'
    },
    {
      id: 'settings-accessibility',
      name: 'Accessibility Settings',
      description: 'Adjust font size, contrast, and other accessibility options',
      keywords: ['accessibility', 'font', 'contrast', 'a11y'],
      icon: <Settings className="h-4 w-4" />,
      action: () => {
        playSound('navigation');
        navigate('/settings/accessibility');
        setIsOpen(false);
      },
      category: 'settings'
    },
    {
      id: 'shortcuts-guide',
      name: 'Keyboard Shortcuts',
      description: 'View available keyboard shortcuts',
      keywords: ['keyboard', 'shortcuts', 'keys', 'bindings'],
      icon: <Keyboard className="h-4 w-4" />,
      action: () => {
        playSound('click');
        // Trigger the shortcuts guide
        window.dispatchEvent(new CustomEvent('show-shortcuts-guide'));
        setIsOpen(false);
      },
      shortcut: '?',
      category: 'settings'
    },
    
    // Action commands
    {
      id: 'action-clear-history',
      name: 'Clear Browsing History',
      description: 'Clear your local browsing history',
      keywords: ['clear', 'history', 'browse', 'delete'],
      icon: <CheckCircle2 className="h-4 w-4" />,
      action: () => {
        playSound('click');
        // Clear browsing history from localStorage
        try {
          localStorage.removeItem('browsingHistory');
          localStorage.removeItem('recentlyViewed');
          setIsOpen(false);
          // Show confirmation toast
          window.dispatchEvent(new CustomEvent('show-toast', { 
            detail: {
              title: 'History Cleared',
              description: 'Your local browsing history has been cleared',
              variant: 'default'
            }
          }));
        } catch (e) {
          console.error('Failed to clear history:', e);
        }
      },
      category: 'action'
    },
    
    // Search command
    {
      id: 'search-articles',
      name: 'Search Articles',
      description: 'Search for articles by keyword',
      keywords: ['search', 'find', 'articles', 'keywords'],
      icon: <Search className="h-4 w-4" />,
      action: () => {
        playSound('navigation');
        navigate(`/search?q=${encodeURIComponent(inputValue)}`);
        setIsOpen(false);
      },
      category: 'search'
    },
    {
      id: 'search-courses',
      name: 'Search Courses',
      description: 'Search for courses by keyword',
      keywords: ['search', 'find', 'courses', 'learning'],
      icon: <Search className="h-4 w-4" />,
      action: () => {
        playSound('navigation');
        navigate(`/courses/search?q=${encodeURIComponent(inputValue)}`);
        setIsOpen(false);
      },
      category: 'search'
    },
  ];
  
  // Handle closing the dialog
  const handleClose = useCallback(() => {
    setInputValue('');
    setIsOpen(false);
    if (onClose) onClose();
  }, [onClose, setIsOpen]);
  
  // Listen for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to open
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Listen for the custom event to open the command palette
    const openCommandPalette = () => setIsOpen(true);
    window.addEventListener('open-command-palette', openCommandPalette);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', openCommandPalette);
    };
  }, [isOpen, handleClose, setIsOpen]);
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[550px] p-0 gap-0 bg-white dark:bg-gray-950">
        <Command
          className="rounded-md border border-gray-200 dark:border-gray-800 bg-transparent"
          shouldFilter={true}
          label="Command Palette"
          loop={true}
        >
          <div className="p-4 pb-0">
            <div className="flex items-center gap-2 text-lg font-medium text-primary mb-4">
              <Sparkles className="h-5 w-5" />
              <DialogTitle>Command Palette</DialogTitle>
            </div>
            <Command.Input 
              autoFocus
              placeholder="Type a command or search..."
              value={inputValue}
              onValueChange={setInputValue}
              className="h-11 w-full bg-transparent border-none focus:outline-none focus:ring-0 text-base placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
          
          <Command.List className="max-h-[300px] overflow-y-auto p-2 mt-2">
            <Command.Empty className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              No commands found.
            </Command.Empty>
            
            {inputValue.startsWith('>') ? (
              // Command mode
              <Command.Group heading="Commands">
                {commands
                  .filter(cmd => cmd.category === 'action' || cmd.category === 'settings')
                  .map((cmd) => (
                    <Command.Item
                      key={cmd.id}
                      value={`${cmd.name} ${cmd.keywords?.join(' ') || ''}`}
                      onSelect={() => cmd.action()}
                      className="px-2 py-1.5 rounded-md text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {cmd.icon || <CheckCircle2 className="h-4 w-4" />}
                        <span>{cmd.name}</span>
                      </div>
                      {cmd.shortcut && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                          {cmd.shortcut}
                        </span>
                      )}
                    </Command.Item>
                  ))}
              </Command.Group>
            ) : inputValue.startsWith('/') ? (
              // Search mode
              <Command.Group heading="Search">
                {commands
                  .filter(cmd => cmd.category === 'search')
                  .map((cmd) => (
                    <Command.Item
                      key={cmd.id}
                      value={`${cmd.name} ${cmd.keywords?.join(' ') || ''}`}
                      onSelect={() => cmd.action()}
                      className="px-2 py-1.5 rounded-md text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {cmd.icon || <Search className="h-4 w-4" />}
                        <span>{cmd.name}</span>
                      </div>
                      {cmd.shortcut && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                          {cmd.shortcut}
                        </span>
                      )}
                    </Command.Item>
                  ))}
              </Command.Group>
            ) : (
              <>
                <Command.Group heading="Navigation">
                  {commands
                    .filter(cmd => cmd.category === 'navigation')
                    .map((cmd) => (
                      <Command.Item
                        key={cmd.id}
                        value={`${cmd.name} ${cmd.keywords?.join(' ') || ''}`}
                        onSelect={() => cmd.action()}
                        className="px-2 py-1.5 rounded-md text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          {cmd.icon || <Navigation className="h-4 w-4" />}
                          <span>{cmd.name}</span>
                        </div>
                        {cmd.shortcut && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                            {cmd.shortcut}
                          </span>
                        )}
                      </Command.Item>
                    ))}
                </Command.Group>
                
                <Command.Group heading="Actions">
                  {commands
                    .filter(cmd => cmd.category === 'action' || cmd.category === 'settings')
                    .map((cmd) => (
                      <Command.Item
                        key={cmd.id}
                        value={`${cmd.name} ${cmd.keywords?.join(' ') || ''}`}
                        onSelect={() => cmd.action()}
                        className="px-2 py-1.5 rounded-md text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          {cmd.icon || <CheckCircle2 className="h-4 w-4" />}
                          <span>{cmd.name}</span>
                        </div>
                        {cmd.shortcut && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                            {cmd.shortcut}
                          </span>
                        )}
                      </Command.Item>
                    ))}
                </Command.Group>
              </>
            )}
            
            <div className="py-2 px-2 mt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div>
                  <span className="mr-2">Use</span>
                  <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    ↑
                  </kbd>
                  <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 ml-1">
                    ↓
                  </kbd>
                  <span className="mx-1">to navigate</span>
                </div>
                
                <div>
                  <span className="mr-1">Press</span>
                  <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Enter
                  </kbd>
                  <span className="ml-1">to select</span>
                </div>
              </div>
            </div>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;