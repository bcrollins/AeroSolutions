import React, { useEffect, useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { Command } from 'cmdk';
import {
  Calculator,
  Calendar,
  Code,
  FileText,
  Laptop,
  LayoutDashboard,
  Search,
  Settings,
  BookOpen,
  X,
  ExternalLink,
  Home,
  ScrollText,
  Newspaper,
  GraduationCap,
  Lightbulb,
  FileCode,
  Bookmark,
  MessagesSquare,
  ChevronRight
} from 'lucide-react';

interface CommandItem {
  id: string;
  name: string;
  shortcut?: string[];
  keywords?: string[];
  section?: string;
  icon?: React.ReactNode;
  perform?: () => void;
  disabled?: boolean;
  sub?: CommandItem[];
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands?: CommandItem[];
  recentSearches?: string[];
}

/**
 * Command palette component (Cmd+K) for keyboard-centric navigation
 */
export default function CommandPalette({
  open,
  onClose,
  commands = [],
  recentSearches = []
}: CommandPaletteProps) {
  const [location, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [pages, setPages] = useState<string[]>([]);
  const [activePage, setActivePage] = useState<string>('root');
  
  // Reset search when opening the command palette
  useEffect(() => {
    if (open) {
      setSearch('');
      setPages(['root']);
      setActivePage('root');
    }
  }, [open]);
  
  // Close with escape key
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [onClose]);
  
  // Define default commands
  const defaultCommands: CommandItem[] = [
    {
      id: 'home',
      name: 'Go to Home',
      shortcut: ['g', 'h'],
      keywords: ['home', 'start', 'main', 'landing'],
      section: 'Pages',
      icon: <Home className="h-4 w-4" />,
      perform: () => {
        navigate('/');
        onClose();
      }
    },
    {
      id: 'dashboard',
      name: 'Go to Dashboard',
      shortcut: ['g', 'd'],
      keywords: ['dashboard', 'overview', 'stats'],
      section: 'Pages',
      icon: <LayoutDashboard className="h-4 w-4" />,
      perform: () => {
        navigate('/dashboard');
        onClose();
      }
    },
    {
      id: 'courses',
      name: 'Browse AI Courses',
      shortcut: ['g', 'c'],
      keywords: ['courses', 'learn', 'training', 'education', 'ai'],
      section: 'Pages',
      icon: <GraduationCap className="h-4 w-4" />,
      perform: () => {
        navigate('/courses');
        onClose();
      }
    },
    {
      id: 'articles',
      name: 'Browse Articles',
      shortcut: ['g', 'a'],
      keywords: ['articles', 'blog', 'news', 'posts', 'read'],
      section: 'Pages',
      icon: <ScrollText className="h-4 w-4" />,
      perform: () => {
        navigate('/articles');
        onClose();
      }
    },
    {
      id: 'news',
      name: 'AI News Hub',
      shortcut: ['g', 'n'],
      keywords: ['news', 'latest', 'updates', 'current', 'events'],
      section: 'Pages',
      icon: <Newspaper className="h-4 w-4" />,
      perform: () => {
        navigate('/news');
        onClose();
      }
    },
    {
      id: 'documentation',
      name: 'Browse Documentation',
      shortcut: ['g', 'o'],
      keywords: ['docs', 'help', 'documentation', 'guide', 'tutorial'],
      section: 'Resources',
      icon: <FileText className="h-4 w-4" />,
      perform: () => {
        navigate('/docs');
        onClose();
      }
    },
    {
      id: 'theme',
      name: 'Change Theme',
      shortcut: ['ctrl', 't'],
      keywords: ['theme', 'dark', 'light', 'appearance', 'mode', 'color'],
      section: 'Preferences',
      icon: <Laptop className="h-4 w-4" />,
      sub: [
        {
          id: 'theme-light',
          name: 'Light Mode',
          perform: () => {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
            localStorage.setItem('rxai-theme', 'light');
            onClose();
          }
        },
        {
          id: 'theme-dark',
          name: 'Dark Mode',
          perform: () => {
            document.documentElement.classList.remove('light');
            document.documentElement.classList.add('dark');
            localStorage.setItem('rxai-theme', 'dark');
            onClose();
          }
        },
        {
          id: 'theme-system',
          name: 'System Preference',
          perform: () => {
            document.documentElement.classList.remove('light', 'dark');
            localStorage.setItem('rxai-theme', 'system');
            onClose();
          }
        }
      ]
    },
    {
      id: 'settings',
      name: 'Settings',
      shortcut: ['g', 's'],
      keywords: ['settings', 'preferences', 'options', 'configuration'],
      section: 'Preferences',
      icon: <Settings className="h-4 w-4" />,
      perform: () => {
        navigate('/settings');
        onClose();
      }
    },
    {
      id: 'calendar',
      name: 'Open Calendar',
      shortcut: ['g', 'l'],
      keywords: ['calendar', 'schedule', 'agenda', 'events', 'planner'],
      section: 'Tools',
      icon: <Calendar className="h-4 w-4" />,
      perform: () => {
        navigate('/calendar');
        onClose();
      }
    },
    {
      id: 'calculator',
      name: 'Open Calculator',
      shortcut: ['g', 'r'],
      keywords: ['calculator', 'calc', 'math', 'compute'],
      section: 'Tools',
      icon: <Calculator className="h-4 w-4" />,
      perform: () => {
        window.open('/calculator', '_blank');
        onClose();
      }
    },
    {
      id: 'code',
      name: 'Code Editor',
      shortcut: ['g', 'e'],
      keywords: ['code', 'editor', 'ide', 'programming', 'develop'],
      section: 'Tools',
      icon: <Code className="h-4 w-4" />,
      perform: () => {
        navigate('/code-editor');
        onClose();
      }
    },
    {
      id: 'forum',
      name: 'Community Forum',
      shortcut: ['g', 'f'],
      keywords: ['forum', 'community', 'discussion', 'chat', 'help'],
      section: 'Community',
      icon: <MessagesSquare className="h-4 w-4" />,
      perform: () => {
        navigate('/forum');
        onClose();
      }
    },
    {
      id: 'resources',
      name: 'Learning Resources',
      shortcut: ['g', 'r'],
      keywords: ['resources', 'learn', 'materials', 'library', 'guides'],
      section: 'Resources',
      icon: <BookOpen className="h-4 w-4" />,
      perform: () => {
        navigate('/resources');
        onClose();
      }
    },
    {
      id: 'bookmarks',
      name: 'Your Bookmarks',
      shortcut: ['g', 'b'],
      keywords: ['bookmarks', 'saved', 'favorites', 'marked'],
      section: 'Personal',
      icon: <Bookmark className="h-4 w-4" />,
      perform: () => {
        navigate('/bookmarks');
        onClose();
      }
    },
    {
      id: 'ai-tools',
      name: 'AI Tools',
      shortcut: ['g', 't'],
      keywords: ['ai', 'tools', 'utilities', 'generators', 'assistants'],
      section: 'Tools',
      icon: <Lightbulb className="h-4 w-4" />,
      perform: () => {
        navigate('/ai-tools');
        onClose();
      }
    },
    {
      id: 'code-snippets',
      name: 'Code Snippets',
      shortcut: ['g', 'p'],
      keywords: ['code', 'snippets', 'examples', 'samples', 'templates'],
      section: 'Resources',
      icon: <FileCode className="h-4 w-4" />,
      perform: () => {
        navigate('/code-snippets');
        onClose();
      }
    }
  ];
  
  // Combine default and custom commands
  const allCommands = [...defaultCommands, ...commands];
  
  // Get active page commands
  const getActivePageCommands = () => {
    if (activePage === 'root') {
      return allCommands;
    }
    
    // Handle subpages
    const parentCommand = allCommands.find(cmd => cmd.id === activePage);
    return parentCommand?.sub || [];
  };
  
  // Navigate to a subpage
  const navigateToPage = (pageId: string) => {
    setActivePage(pageId);
    setPages(prev => [...prev, pageId]);
  };
  
  // Go back to previous page
  const goBack = () => {
    if (pages.length > 1) {
      setPages(prev => prev.slice(0, -1));
      setActivePage(pages[pages.length - 2]);
    }
  };
  
  // Format key for display
  const formatKey = (key: string): string => {
    if (key === 'ctrl') return '⌃';
    if (key === 'alt') return '⌥';
    if (key === 'shift') return '⇧';
    if (key === 'meta' || key === 'cmd') return '⌘';
    if (key === 'enter') return '↵';
    if (key === 'space') return '␣';
    return key.toUpperCase();
  };
  
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Command palette dialog */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ ease: 'easeOut', duration: 0.15 }}
            className="fixed left-1/2 top-[20%] -translate-x-1/2 z-50 w-full max-w-2xl"
          >
            <Command
              className="rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden dark:bg-gray-900 dark:border-gray-700"
              onKeyDown={(e) => {
                // Handle back navigation when in subpage
                if (e.key === 'Backspace' && !search && pages.length > 1) {
                  e.preventDefault();
                  goBack();
                }
              }}
            >
              {/* Command header */}
              <div className="flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
                <Search className="h-4 w-4 text-gray-400 mr-2 shrink-0" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Type a command or search..."
                  className="flex-1 h-12 bg-transparent outline-none placeholder:text-gray-400 text-sm"
                />
                
                {/* Breadcrumb navigation for subpages */}
                {pages.length > 1 && (
                  <button
                    onClick={goBack}
                    className="mr-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    Back
                  </button>
                )}
                
                {/* Keyboard shortcut indicator */}
                <kbd className="hidden sm:flex items-center justify-center h-6 px-2 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400">
                  ESC
                </kbd>
              </div>
              
              {/* Empty state when no results found */}
              {search && !getActivePageCommands().some(cmd => {
                const searchLower = search.toLowerCase();
                const matchesName = cmd.name.toLowerCase().includes(searchLower);
                const matchesKeywords = cmd.keywords?.some(k => k.toLowerCase().includes(searchLower));
                return matchesName || matchesKeywords;
              }) && (
                <div className="py-14 px-4 text-center sm:px-14">
                  <FileText className="mx-auto h-6 w-6 text-gray-400" />
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    No results found for "{search}"
                  </p>
                </div>
              )}
              
              {/* Recent searches (shown when search is empty and on root page) */}
              {!search && activePage === 'root' && recentSearches.length > 0 && (
                <div className="px-2 py-3">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-1">
                    Recent searches
                  </div>
                  <div className="mt-1">
                    {recentSearches.map((item, index) => (
                      <Command.Item
                        key={`recent-${index}`}
                        value={item}
                        onSelect={() => {
                          setSearch(item);
                        }}
                        className="px-3 py-2 text-sm rounded-md flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Search className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                      </Command.Item>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Command groups and items */}
              <Command.List className="max-h-80 overflow-y-auto p-2">
                {/* Group commands by section */}
                {Array.from(new Set(getActivePageCommands()
                  .filter(cmd => {
                    if (!search) return true;
                    
                    const searchLower = search.toLowerCase();
                    const matchesName = cmd.name.toLowerCase().includes(searchLower);
                    const matchesKeywords = cmd.keywords?.some(k => k.toLowerCase().includes(searchLower));
                    return matchesName || matchesKeywords;
                  })
                  .map(cmd => cmd.section)))
                  .map(section => (
                    <Command.Group 
                      key={section || 'default'} 
                      heading={section}
                      className="pt-1 pb-2"
                    >
                      {getActivePageCommands()
                        .filter(cmd => {
                          if (cmd.section !== section) return false;
                          if (!search) return true;
                          
                          const searchLower = search.toLowerCase();
                          const matchesName = cmd.name.toLowerCase().includes(searchLower);
                          const matchesKeywords = cmd.keywords?.some(k => k.toLowerCase().includes(searchLower));
                          return matchesName || matchesKeywords;
                        })
                        .map(command => (
                          <Command.Item
                            key={command.id}
                            value={command.name}
                            disabled={command.disabled}
                            onSelect={() => {
                              if (command.sub && command.sub.length > 0) {
                                navigateToPage(command.id);
                              } else if (command.perform) {
                                command.perform();
                              }
                            }}
                            className={`
                              px-3 py-2 text-sm rounded-md flex items-center justify-between
                              cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                              ${command.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                          >
                            <div className="flex items-center">
                              {command.icon && (
                                <span className="mr-2 text-gray-500">
                                  {command.icon}
                                </span>
                              )}
                              <span className="text-gray-700 dark:text-gray-300">
                                {command.name}
                              </span>
                            </div>
                            
                            <div className="flex items-center">
                              {/* Shortcut key indicator */}
                              {command.shortcut && (
                                <div className="flex space-x-1">
                                  {command.shortcut.map((key, i) => (
                                    <React.Fragment key={`${command.id}-key-${i}`}>
                                      <kbd className="flex items-center justify-center h-5 min-w-[1.25rem] px-1 text-[10px] font-medium text-gray-500 bg-gray-100 border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400">
                                        {formatKey(key)}
                                      </kbd>
                                      {i < command.shortcut!.length - 1 && (
                                        <span className="text-gray-400">+</span>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                              )}
                              
                              {/* Right icon for submenus */}
                              {command.sub && command.sub.length > 0 && (
                                <ChevronRight className="ml-2 h-4 w-4 text-gray-400" />
                              )}
                              
                              {/* External link indicator */}
                              {command.name.includes('Open') && (
                                <ExternalLink className="ml-2 h-3 w-3 text-gray-400" />
                              )}
                            </div>
                          </Command.Item>
                        ))}
                    </Command.Group>
                  ))}
              </Command.List>
              
              {/* Footer */}
              <div className="border-t border-gray-200 py-2 px-4 text-xs text-gray-500 flex justify-between items-center dark:border-gray-700 dark:text-gray-400">
                <div>
                  Press <kbd className="font-sans px-1 py-0.5 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600">Tab</kbd> to navigate
                </div>
                <button 
                  onClick={onClose}
                  className="flex items-center text-xs hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="h-3 w-3 mr-1" /> Close
                </button>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Create a context for the command palette
interface CommandPaletteContextType {
  isOpen: boolean;
  setIsOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextType | undefined>(undefined);

/**
 * Command Palette Provider component
 */
export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || 
          (e.key === 'p' && e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  
  const value = { isOpen, setIsOpen };
  
  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
    </CommandPaletteContext.Provider>
  );
}

/**
 * Hook to use the command palette
 */
export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  
  if (context === undefined) {
    return { isOpen: false, setIsOpen: () => {} };
  }
  
  return context;
}