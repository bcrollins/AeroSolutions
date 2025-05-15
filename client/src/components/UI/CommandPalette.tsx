import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useRoute } from 'wouter';
import { 
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Home, 
  Settings, 
  User, 
  BookOpen, 
  Layout, 
  DollarSign,
  FileText, 
  Layers,
  History,
  Star,
  PieChart,
  Bell,
  HelpCircle,
  Mail,
  MessageSquare,
  Calendar,
  LogOut,
  CheckCircle2,
  Terminal,
  Command as CommandIcon,
  PanelRight,
  MoonStar,
  Sun,
  ArrowRight,
  ArrowLeft,
  Briefcase
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDevice } from '@/hooks/use-device';

export interface CommandAction {
  id: string;
  name: string;
  description?: string;
  shortcut?: string[];
  icon?: React.ReactNode;
  action: (close: () => void) => void;
  section: 'navigation' | 'actions' | 'settings' | 'search';
  keywords?: string[];
  badge?: 'new' | 'beta' | 'popular' | 'updated';
  disabled?: boolean;
}

interface CommandPaletteProps {
  actions?: CommandAction[];
  placeholder?: string;
  defaultActions?: boolean;
  recentItemsCount?: number;
  showShortcut?: boolean;
  hotkeys?: string[];
  maxResults?: number;
  autoFocus?: boolean;
  searchDelay?: number;
  className?: string;
  contentClassName?: string;
  footerText?: string;
  highlightTerms?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * CommandPalette - A comprehensive command palette for quick navigation and actions
 * 
 * @example
 * <CommandPalette 
 *   actions={[
 *     {
 *       id: 'go-home',
 *       name: 'Go to Homepage',
 *       icon: <Home />,
 *       action: (close) => { navigate('/'); close(); },
 *       section: 'navigation',
 *       shortcut: ['g', 'h']
 *     }
 *   ]}
 *   hotkeys={['cmd+k', 'ctrl+k']}
 * />
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  actions = [],
  placeholder = 'Search commands...',
  defaultActions = true,
  recentItemsCount = 3,
  showShortcut = true,
  hotkeys = ['meta+k', 'ctrl+k'],
  maxResults = 10,
  autoFocus = true,
  searchDelay = 100,
  className = '',
  contentClassName = '',
  footerText = '',
  highlightTerms = true,
  open,
  onOpenChange,
}) => {
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  const isControlled = open !== undefined;
  const isOpenState = isControlled ? open : isOpenInternal;
  const setIsOpenState = useCallback((value: boolean) => {
    if (isControlled && onOpenChange) {
      onOpenChange(value);
    } else {
      setIsOpenInternal(value);
    }
  }, [isControlled, onOpenChange]);
  const [search, setSearch] = useState('');
  const [recentActions, setRecentActions] = useState<CommandAction[]>([]);
  const [filteredActions, setFilteredActions] = useState<CommandAction[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [, navigate] = useLocation();
  const { isMobile } = useDevice();
  
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Load recent actions from localStorage
  useEffect(() => {
    try {
      const savedRecent = localStorage.getItem('command-palette-recent');
      if (savedRecent) {
        const parsed = JSON.parse(savedRecent);
        const matchingActions = parsed
          .map((id: string) => [...defaultCommandActions, ...actions].find(a => a.id === id))
          .filter((a: CommandAction | undefined): a is CommandAction => Boolean(a))
          .slice(0, recentItemsCount);
        
        setRecentActions(matchingActions);
      }
    } catch (error) {
      console.error('Failed to load recent commands:', error);
    }
  }, [actions, recentItemsCount]);
  
  // Save recent actions to localStorage
  const saveRecentAction = useCallback((action: CommandAction) => {
    try {
      const savedRecent = localStorage.getItem('command-palette-recent');
      const recentIds = savedRecent ? JSON.parse(savedRecent) : [];
      
      // Remove the action if it already exists, then add it to the front
      const updatedRecent = [
        action.id,
        ...recentIds.filter((id: string) => id !== action.id)
      ].slice(0, 10); // Limit to 10 most recent
      
      localStorage.setItem('command-palette-recent', JSON.stringify(updatedRecent));
      
      // Update the recent actions list
      const matchingActions = updatedRecent
        .map((id: string) => [...defaultCommandActions, ...actions].find(a => a.id === id))
        .filter((a): a is CommandAction => Boolean(a))
        .slice(0, recentItemsCount);
      
      setRecentActions(matchingActions);
    } catch (error) {
      console.error('Failed to save recent command:', error);
    }
  }, [actions, recentItemsCount]);
  
  // Filter actions based on search input
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      const allActions = [...(defaultActions ? defaultCommandActions : []), ...actions];
      
      if (!search) {
        setFilteredActions(allActions);
        return;
      }
      
      const searchLower = search.toLowerCase();
      const filtered = allActions.filter(action => {
        const nameMatch = action.name.toLowerCase().includes(searchLower);
        const descMatch = action.description?.toLowerCase().includes(searchLower) || false;
        const keywordMatch = action.keywords?.some(k => k.toLowerCase().includes(searchLower)) || false;
        const shortcutMatch = action.shortcut?.some(s => s.toLowerCase().includes(searchLower)) || false;
        
        return nameMatch || descMatch || keywordMatch || shortcutMatch;
      }).slice(0, maxResults);
      
      setFilteredActions(filtered);
      setActiveIndex(0);
    }, searchDelay);
    
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [search, actions, defaultActions, maxResults, searchDelay]);
  
  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isHotkey = hotkeys.some(hotkey => {
        const keys = hotkey.split('+');
        const modifiers = keys.slice(0, -1);
        const key = keys[keys.length - 1];
        
        const modifiersMatch = modifiers.every(modifier => {
          switch (modifier) {
            case 'meta':
            case 'cmd':
              return e.metaKey;
            case 'ctrl':
              return e.ctrlKey;
            case 'alt':
              return e.altKey;
            case 'shift':
              return e.shiftKey;
            default:
              return false;
          }
        });
        
        return modifiersMatch && e.key.toLowerCase() === key.toLowerCase();
      });
      
      if (isHotkey) {
        e.preventDefault();
        setIsOpenState(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hotkeys, setIsOpenState]);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpenState) return;
      
      const visibleActions = filteredActions.filter(a => !a.disabled);
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex(prev => (prev + 1) % visibleActions.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex(prev => (prev - 1 + visibleActions.length) % visibleActions.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (visibleActions[activeIndex]) {
            executeAction(visibleActions[activeIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpenState(false);
          break;
      }
      
      // Handle shortcut keys when command palette is open
      if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
        for (const action of filteredActions) {
          if (action.shortcut && action.shortcut[0] === e.key.toLowerCase() && !action.disabled) {
            e.preventDefault();
            executeAction(action);
            break;
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpenState, activeIndex, filteredActions, setIsOpenState]);
  
  // Focus input on open
  useEffect(() => {
    if (isOpenState && autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpenState, autoFocus]);
  
  // Execute a command action
  const executeAction = useCallback((action: CommandAction) => {
    if (action.disabled) return;
    
    action.action(() => setIsOpenState(false));
    saveRecentAction(action);
  }, [saveRecentAction, setIsOpenState]);
  
  // Highlight matching text
  const highlightMatch = useCallback((text: string, query: string): React.ReactNode => {
    if (!highlightTerms || !query || !text) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? 
            <span key={i} className="bg-primary/20 text-primary font-semibold rounded-sm px-0.5">{part}</span> : 
            part
        )}
      </>
    );
  }, [highlightTerms]);
  
  // Close the command palette
  const handleClose = () => {
    setIsOpenState(false);
    setSearch('');
  };
  
  // Group actions by section
  const getActionsBySection = (section: string): CommandAction[] => {
    return filteredActions.filter(action => action.section === section);
  };
  
  // Get placeholder based on device
  const getPlaceholder = () => {
    if (isMobile) return placeholder;
    return `${placeholder} (${hotkeys[0].includes('meta') ? '⌘' : 'Ctrl'}+K)`;
  };
  
  // Default navigation actions
  const defaultCommandActions: CommandAction[] = defaultActions ? [
    {
      id: 'home',
      name: 'Go to Home',
      description: 'Navigate to the homepage',
      icon: <Home className="h-4 w-4" />,
      action: (close) => { 
        navigate('/'); 
        close();
      },
      section: 'navigation',
      shortcut: ['g', 'h'],
      keywords: ['home', 'main', 'dashboard', 'start'],
    },
    {
      id: 'courses',
      name: 'Browse Courses',
      description: 'View all available AI courses',
      icon: <BookOpen className="h-4 w-4" />,
      action: (close) => { 
        navigate('/courses'); 
        close();
      },
      section: 'navigation',
      shortcut: ['g', 'c'],
      keywords: ['learn', 'education', 'classes', 'training'],
    },
    {
      id: 'profile',
      name: 'View Profile',
      description: 'Go to your user profile',
      icon: <User className="h-4 w-4" />,
      action: (close) => { 
        navigate('/profile'); 
        close();
      },
      section: 'navigation',
      shortcut: ['g', 'p'],
      keywords: ['account', 'me', 'user', 'personal'],
    },
    {
      id: 'settings',
      name: 'Settings',
      description: 'Adjust your account settings',
      icon: <Settings className="h-4 w-4" />,
      action: (close) => { 
        navigate('/settings'); 
        close();
      },
      section: 'navigation',
      shortcut: ['g', 's'],
      keywords: ['preferences', 'options', 'configure'],
    },
    {
      id: 'articles',
      name: 'Browse Articles',
      description: 'Read the latest AI articles',
      icon: <FileText className="h-4 w-4" />,
      action: (close) => { 
        navigate('/articles'); 
        close();
      },
      section: 'navigation',
      shortcut: ['g', 'a'],
      keywords: ['blog', 'content', 'read', 'news'],
    },
    {
      id: 'pricing',
      name: 'View Pricing',
      description: 'See subscription plans and pricing',
      icon: <DollarSign className="h-4 w-4" />,
      action: (close) => { 
        navigate('/pricing'); 
        close();
      },
      section: 'navigation',
      shortcut: ['g', '$'],
      keywords: ['plans', 'subscribe', 'membership', 'payment'],
    },
    {
      id: 'toggle-theme',
      name: 'Toggle Theme',
      description: 'Switch between light and dark mode',
      icon: <MoonStar className="h-4 w-4" />,
      action: (close) => { 
        // Get current theme
        const isDark = document.documentElement.classList.contains('dark-theme');
        // Toggle theme
        document.documentElement.classList.remove(isDark ? 'dark-theme' : 'light-theme');
        document.documentElement.classList.add(isDark ? 'light-theme' : 'dark-theme');
        // Save preference
        localStorage.setItem('theme-preference', isDark ? 'light' : 'dark');
        close();
      },
      section: 'settings',
      shortcut: ['t', 't'],
      keywords: ['dark', 'light', 'mode', 'appearance'],
    },
    {
      id: 'logout',
      name: 'Logout',
      description: 'Sign out of your account',
      icon: <LogOut className="h-4 w-4" />,
      action: (close) => { 
        window.location.href = '/api/logout';
        close();
      },
      section: 'settings',
      shortcut: ['l', 'o'],
      keywords: ['signout', 'exit', 'end session'],
    },
    {
      id: 'help',
      name: 'Help & Support',
      description: 'Get help with using the platform',
      icon: <HelpCircle className="h-4 w-4" />,
      action: (close) => { 
        navigate('/help'); 
        close();
      },
      section: 'settings',
      shortcut: ['h', 'p'],
      keywords: ['support', 'assistance', 'guide', 'faq'],
    },
    {
      id: 'toggle-sidebar',
      name: 'Toggle Sidebar',
      description: 'Show or hide sidebar',
      icon: <PanelRight className="h-4 w-4" />,
      action: (close) => { 
        // Find sidebar element and toggle it
        const sidebarToggle = document.querySelector('[data-sidebar-toggle]') as HTMLElement;
        if (sidebarToggle) {
          sidebarToggle.click();
        }
        close();
      },
      section: 'actions',
      shortcut: ['t', 's'],
      keywords: ['panel', 'menu', 'navigation', 'side'],
    },
    {
      id: 'search',
      name: 'Search Content',
      description: 'Search for courses, articles and more',
      icon: <Search className="h-4 w-4" />,
      action: (close) => { 
        navigate('/search'); 
        close();
      },
      section: 'actions',
      shortcut: ['/', 's'],
      keywords: ['find', 'lookup', 'query'],
      badge: 'popular',
    },
  ] : [];
  
  return (
    <>
      <Dialog open={isOpenState} onOpenChange={setIsOpenState}>
        <DialogContent 
          className={cn(
            "p-0 max-w-2xl gap-0 shadow-xl border-border/50 backdrop-blur-sm", 
            contentClassName
          )}
          showClose={false}
        >
          <Command 
            className={cn("rounded-lg", className)}
            loop
          >
            <div className="flex items-center border-b px-3 sticky top-0 bg-background/90 backdrop-blur-sm z-10">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput 
                placeholder={getPlaceholder()} 
                className="flex h-11 py-3 w-full"
                value={search}
                onValueChange={setSearch}
                ref={inputRef}
              />
              {search && (
                <button 
                  className="rounded text-xs px-1.5 py-0.5 hover:bg-accent text-muted-foreground"
                  onClick={() => setSearch('')}
                >
                  Clear
                </button>
              )}
            </div>
            <CommandList>
              <CommandEmpty className="py-6 text-center text-sm">
                <div className="mx-auto flex flex-col items-center justify-center space-y-1">
                  <SearchX className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No commands found</p>
                  <p className="text-xs text-muted-foreground/70">Try a different search term</p>
                </div>
              </CommandEmpty>
              
              {/* Recent commands */}
              {recentActions.length > 0 && !search && (
                <>
                  <CommandGroup heading="Recent">
                    {recentActions.map((action, index) => (
                      <CommandItem
                        key={action.id}
                        onSelect={() => executeAction(action)}
                        disabled={action.disabled}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 cursor-default",
                          action.disabled && "opacity-50 cursor-not-allowed",
                          activeIndex === index && "bg-accent",
                        )}
                      >
                        <div className="rounded-md bg-primary/10 p-1.5 text-primary mr-1">
                          {action.icon || <Terminal className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm">
                            {highlightMatch(action.name, search)}
                          </div>
                          {action.description && (
                            <div className="text-xs text-muted-foreground">
                              {highlightMatch(action.description, search)}
                            </div>
                          )}
                        </div>
                        {showShortcut && action.shortcut && (
                          <div className="flex">
                            {action.shortcut.map((key, i) => (
                              <React.Fragment key={i}>
                                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                  {key}
                                </kbd>
                                {i < action.shortcut!.length - 1 && (
                                  <span className="mx-0.5 text-xs text-muted-foreground">+</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}
              
              {/* Navigation section */}
              {getActionsBySection('navigation').length > 0 && (
                <>
                  <CommandGroup heading="Navigation">
                    {getActionsBySection('navigation').map((action, index) => (
                      <CommandItem
                        key={action.id}
                        onSelect={() => executeAction(action)}
                        disabled={action.disabled}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 cursor-default",
                          action.disabled && "opacity-50 cursor-not-allowed",
                        )}
                      >
                        <div className="rounded-md bg-primary/10 p-1.5 text-primary mr-1">
                          {action.icon || <Terminal className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{highlightMatch(action.name, search)}</span>
                            {action.badge && (
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[10px] py-0 h-4 px-1.5",
                                  action.badge === 'new' && "bg-green-500/10 text-green-600 border-green-500/20",
                                  action.badge === 'beta' && "bg-blue-500/10 text-blue-600 border-blue-500/20",
                                  action.badge === 'popular' && "bg-orange-500/10 text-orange-600 border-orange-500/20",
                                  action.badge === 'updated' && "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                )}
                              >
                                {action.badge}
                              </Badge>
                            )}
                          </div>
                          {action.description && (
                            <div className="text-xs text-muted-foreground">
                              {highlightMatch(action.description, search)}
                            </div>
                          )}
                        </div>
                        {showShortcut && action.shortcut && (
                          <div className="flex">
                            {action.shortcut.map((key, i) => (
                              <React.Fragment key={i}>
                                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                  {key}
                                </kbd>
                                {i < action.shortcut!.length - 1 && (
                                  <span className="mx-0.5 text-xs text-muted-foreground">+</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}
              
              {/* Actions section */}
              {getActionsBySection('actions').length > 0 && (
                <>
                  <CommandGroup heading="Actions">
                    {getActionsBySection('actions').map((action) => (
                      <CommandItem
                        key={action.id}
                        onSelect={() => executeAction(action)}
                        disabled={action.disabled}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 cursor-default",
                          action.disabled && "opacity-50 cursor-not-allowed",
                        )}
                      >
                        <div className="rounded-md bg-primary/10 p-1.5 text-primary mr-1">
                          {action.icon || <Terminal className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{highlightMatch(action.name, search)}</span>
                            {action.badge && (
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[10px] py-0 h-4 px-1.5",
                                  action.badge === 'new' && "bg-green-500/10 text-green-600 border-green-500/20",
                                  action.badge === 'beta' && "bg-blue-500/10 text-blue-600 border-blue-500/20",
                                  action.badge === 'popular' && "bg-orange-500/10 text-orange-600 border-orange-500/20",
                                  action.badge === 'updated' && "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                )}
                              >
                                {action.badge}
                              </Badge>
                            )}
                          </div>
                          {action.description && (
                            <div className="text-xs text-muted-foreground">
                              {highlightMatch(action.description, search)}
                            </div>
                          )}
                        </div>
                        {showShortcut && action.shortcut && (
                          <div className="flex">
                            {action.shortcut.map((key, i) => (
                              <React.Fragment key={i}>
                                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                  {key}
                                </kbd>
                                {i < action.shortcut!.length - 1 && (
                                  <span className="mx-0.5 text-xs text-muted-foreground">+</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}
              
              {/* Settings section */}
              {getActionsBySection('settings').length > 0 && (
                <>
                  <CommandGroup heading="Settings">
                    {getActionsBySection('settings').map((action) => (
                      <CommandItem
                        key={action.id}
                        onSelect={() => executeAction(action)}
                        disabled={action.disabled}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 cursor-default",
                          action.disabled && "opacity-50 cursor-not-allowed",
                        )}
                      >
                        <div className="rounded-md bg-primary/10 p-1.5 text-primary mr-1">
                          {action.icon || <Terminal className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{highlightMatch(action.name, search)}</span>
                            {action.badge && (
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[10px] py-0 h-4 px-1.5",
                                  action.badge === 'new' && "bg-green-500/10 text-green-600 border-green-500/20",
                                  action.badge === 'beta' && "bg-blue-500/10 text-blue-600 border-blue-500/20",
                                  action.badge === 'popular' && "bg-orange-500/10 text-orange-600 border-orange-500/20",
                                  action.badge === 'updated' && "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                )}
                              >
                                {action.badge}
                              </Badge>
                            )}
                          </div>
                          {action.description && (
                            <div className="text-xs text-muted-foreground">
                              {highlightMatch(action.description, search)}
                            </div>
                          )}
                        </div>
                        {showShortcut && action.shortcut && (
                          <div className="flex">
                            {action.shortcut.map((key, i) => (
                              <React.Fragment key={i}>
                                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                  {key}
                                </kbd>
                                {i < action.shortcut!.length - 1 && (
                                  <span className="mx-0.5 text-xs text-muted-foreground">+</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
            
            {footerText && (
              <div className="border-t py-2 px-4 text-xs text-center text-muted-foreground">
                {footerText}
              </div>
            )}
          </Command>
        </DialogContent>
      </Dialog>
      
      {/* Command palette trigger button */}
      <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-10">
        <button
          onClick={() => setIsOpenState(true)}
          className="bg-background border border-border/40 shadow-lg rounded-full p-3 hover:bg-accent transition-colors duration-200"
          aria-label="Open command palette"
        >
          <CommandIcon className="h-5 w-5" />
        </button>
      </div>
    </>
  );
};

// SearchX icon for empty state
const SearchX = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m13.5 8.5-5 5" />
    <path d="m8.5 8.5 5 5" />
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export default CommandPalette;