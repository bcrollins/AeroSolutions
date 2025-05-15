import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CommandPalette } from './CommandPalette';
import { useCommandPalette } from '@/hooks/use-command-palette';
import { ScaleIn, FadeIn } from './MicroInteractions';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Search,
  Settings,
  Lightbulb,
  User,
  BookOpen,
  MessageSquare,
  BarChart,
  Calendar,
  FileText,
  Home,
  Coffee,
  Compass,
  Keyboard,
  Layers,
  HelpCircle,
  Code,
  Cpu,
  Bell,
  Zap
} from 'lucide-react';

// Command categories
export type CommandCategory = 
  | 'navigation' 
  | 'tools' 
  | 'learning' 
  | 'account' 
  | 'settings' 
  | 'help'
  | 'analytics'
  | 'ai'
  | 'experimental';

// Command definition
export interface Command {
  id: string;
  title: string;
  description?: string;
  category: CommandCategory;
  icon?: React.ReactNode;
  action: () => void;
  keywords?: string[];
  shortcut?: string;
  disabled?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
}

/**
 * EnhancedCommandPalette - An enhanced version of the command palette with more functionality
 */
export const EnhancedCommandPalette: React.FC = () => {
  const { isOpen, setIsOpen } = useCommandPalette();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCommands, setFilteredCommands] = useState<Command[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<CommandCategory | null>(null);
  const [recentCommands, setRecentCommands] = useState<Command[]>([]);
  const [showKeyboardShortcutsModal, setShowKeyboardShortcutsModal] = useState(false);
  const commandsRef = useRef<Command[]>([]);
  
  // Simulated global commands (would be registered from various parts of the app)
  const globalCommands: Command[] = [
    // Navigation commands
    {
      id: 'home',
      title: 'Go to Home',
      description: 'Navigate to the homepage',
      category: 'navigation',
      icon: <Home size={18} />,
      action: () => { window.location.href = '/'; },
      keywords: ['home', 'main', 'dashboard'],
      shortcut: 'g h',
      isPopular: true
    },
    {
      id: 'courses',
      title: 'Browse Courses',
      description: 'View all available courses',
      category: 'navigation',
      icon: <BookOpen size={18} />,
      action: () => { window.location.href = '/courses'; },
      keywords: ['courses', 'learning', 'education'],
      shortcut: 'g c'
    },
    {
      id: 'articles',
      title: 'Read Articles',
      description: 'Browse AI-related articles',
      category: 'navigation',
      icon: <FileText size={18} />,
      action: () => { window.location.href = '/articles'; },
      keywords: ['articles', 'blog', 'news', 'read'],
      shortcut: 'g a'
    },

    // Tools
    {
      id: 'ai-assistant',
      title: 'Open AI Assistant',
      description: 'Get help from our AI assistant',
      category: 'tools',
      icon: <Cpu size={18} />,
      action: () => { window.location.href = '/assistant'; },
      keywords: ['ai', 'assistant', 'help', 'chat'],
      shortcut: 't a',
      isNew: true
    },
    {
      id: 'calendar',
      title: 'My Learning Calendar',
      description: 'View your learning schedule',
      category: 'tools',
      icon: <Calendar size={18} />,
      action: () => { window.location.href = '/calendar'; },
      keywords: ['calendar', 'schedule', 'planner'],
      shortcut: 't c'
    },
    {
      id: 'analytics',
      title: 'Learning Analytics',
      description: 'View your learning progress',
      category: 'analytics',
      icon: <BarChart size={18} />,
      action: () => { window.location.href = '/analytics'; },
      keywords: ['analytics', 'stats', 'progress', 'metrics'],
      shortcut: 't s'
    },

    // Account
    {
      id: 'profile',
      title: 'My Profile',
      description: 'View and edit your profile',
      category: 'account',
      icon: <User size={18} />,
      action: () => { window.location.href = '/profile'; },
      keywords: ['profile', 'account', 'user', 'me'],
      shortcut: 'a p'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'View your notifications',
      category: 'account',
      icon: <Bell size={18} />,
      action: () => { window.location.href = '/notifications'; },
      keywords: ['notifications', 'alerts', 'messages'],
      shortcut: 'a n'
    },

    // Settings
    {
      id: 'settings',
      title: 'Settings',
      description: 'Adjust your preferences',
      category: 'settings',
      icon: <Settings size={18} />,
      action: () => { window.location.href = '/settings'; },
      keywords: ['settings', 'preferences', 'options', 'configure'],
      shortcut: 's'
    },
    {
      id: 'theme',
      title: 'Change Theme',
      description: 'Switch between light and dark mode',
      category: 'settings',
      icon: <Layers size={18} />,
      action: () => { /* Toggle theme */ },
      keywords: ['theme', 'dark', 'light', 'mode', 'appearance'],
      shortcut: 's t'
    },
    {
      id: 'keyboard-shortcuts',
      title: 'View Keyboard Shortcuts',
      description: 'See all available keyboard shortcuts',
      category: 'help',
      icon: <Keyboard size={18} />,
      action: () => { setShowKeyboardShortcutsModal(true); },
      keywords: ['keyboard', 'shortcuts', 'hotkeys', 'keys'],
      shortcut: '?'
    },

    // AI
    {
      id: 'ai-tools',
      title: 'AI Toolkit',
      description: 'Access specialized AI tools',
      category: 'ai',
      icon: <Zap size={18} />,
      action: () => { window.location.href = '/ai-tools'; },
      keywords: ['ai', 'tools', 'toolkit', 'smart', 'intelligence'],
      shortcut: 'ai t',
      isNew: true
    },
    {
      id: 'ai-playground',
      title: 'AI Playground',
      description: 'Experiment with AI models',
      category: 'ai',
      icon: <Code size={18} />,
      action: () => { window.location.href = '/playground'; },
      keywords: ['playground', 'experiment', 'ai', 'models'],
      shortcut: 'ai p',
      isNew: true
    },

    // Help
    {
      id: 'help-center',
      title: 'Help Center',
      description: 'Browse help articles and guides',
      category: 'help',
      icon: <HelpCircle size={18} />,
      action: () => { window.location.href = '/help'; },
      keywords: ['help', 'support', 'guides', 'faq', 'questions'],
      shortcut: 'h'
    },
    {
      id: 'quick-tips',
      title: 'Quick Tips',
      description: 'Get helpful tips for using the platform',
      category: 'help',
      icon: <Lightbulb size={18} />,
      action: () => { /* Show quick tips */ },
      keywords: ['tips', 'tricks', 'help', 'advice'],
      shortcut: 'h t'
    }
  ];
  
  // Initialize commands
  useEffect(() => {
    commandsRef.current = globalCommands;
  }, []);
  
  // Load recent commands from localStorage
  useEffect(() => {
    try {
      const storedRecent = localStorage.getItem('rxai-recent-commands');
      if (storedRecent) {
        const recentIds = JSON.parse(storedRecent) as string[];
        const foundCommands = recentIds
          .map(id => commandsRef.current.find(cmd => cmd.id === id))
          .filter(Boolean) as Command[];
        setRecentCommands(foundCommands.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to load recent commands:', error);
    }
  }, []);
  
  // Filter commands based on search term
  useEffect(() => {
    const allCommands = commandsRef.current;
    
    if (!searchTerm && !selectedCategory) {
      setFilteredCommands(allCommands);
      return;
    }
    
    let filtered = allCommands;
    
    if (selectedCategory) {
      filtered = filtered.filter(cmd => cmd.category === selectedCategory);
    }
    
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        cmd =>
          cmd.title.toLowerCase().includes(lowerTerm) ||
          (cmd.description && cmd.description.toLowerCase().includes(lowerTerm)) ||
          (cmd.keywords && cmd.keywords.some(k => k.toLowerCase().includes(lowerTerm)))
      );
    }
    
    setFilteredCommands(filtered);
    setSelectedIndex(0);
  }, [searchTerm, selectedCategory]);
  
  // Handle keyboard navigation within command palette
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  }, [isOpen, filteredCommands, selectedIndex, setIsOpen]);
  
  // Handle global keyboard shortcuts to open command palette or execute commands
  const handleGlobalKeyPress = useCallback((e: KeyboardEvent) => {
    // Skip if inside input, textarea or other editable elements
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      (e.target as HTMLElement)?.isContentEditable
    ) {
      return;
    }
    
    // Command Palette activation with Cmd/Ctrl+K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen(true);
      return;
    }
    
    // Keyboard shortcut handling for shortcut keys
    if (!isOpen && !e.metaKey && !e.ctrlKey) {
      const pressedKey = e.key.toLowerCase();
      
      // Handle single-key shortcuts
      if (pressedKey === '?') {
        e.preventDefault();
        const helpCommand = commandsRef.current.find(cmd => cmd.id === 'keyboard-shortcuts');
        if (helpCommand) executeCommand(helpCommand);
        return;
      }
      
      // Check all command shortcuts
      for (const command of commandsRef.current) {
        if (command.shortcut && command.shortcut.toLowerCase() === pressedKey) {
          e.preventDefault();
          executeCommand(command);
          return;
        }
      }
    }
  }, [isOpen, setIsOpen]);
  
  useEffect(() => {
    // Add both event listeners for command palette navigation and global shortcuts
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleGlobalKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', handleGlobalKeyPress);
    };
  }, [handleKeyDown, handleGlobalKeyPress]);
  
  // Execute a command and add to recent list
  const executeCommand = (command: Command) => {
    if (command.disabled) return;
    
    command.action();
    setIsOpen(false);
    
    // Update recent commands
    const newRecent = [
      command.id,
      ...recentCommands.map(cmd => cmd.id).filter(id => id !== command.id)
    ].slice(0, 5);
    
    try {
      localStorage.setItem('rxai-recent-commands', JSON.stringify(newRecent));
      
      const foundCommands = newRecent
        .map(id => commandsRef.current.find(cmd => cmd.id === id))
        .filter(Boolean) as Command[];
      
      setRecentCommands(foundCommands);
    } catch (error) {
      console.error('Failed to save recent commands:', error);
    }
  };
  
  // Get category icon
  const getCategoryIcon = (category: CommandCategory) => {
    switch (category) {
      case 'navigation': return <Compass size={16} />;
      case 'tools': return <Coffee size={16} />;
      case 'learning': return <BookOpen size={16} />;
      case 'account': return <User size={16} />;
      case 'settings': return <Settings size={16} />;
      case 'help': return <HelpCircle size={16} />;
      case 'analytics': return <BarChart size={16} />;
      case 'ai': return <Cpu size={16} />;
      case 'experimental': return <Zap size={16} />;
      default: return null;
    }
  };
  
  // Group commands by category
  const commandsByCategory = filteredCommands.reduce<Record<CommandCategory, Command[]>>(
    (acc, command) => {
      if (!acc[command.category]) {
        acc[command.category] = [];
      }
      acc[command.category].push(command);
      return acc;
    },
    {} as Record<CommandCategory, Command[]>
  );
  
  // Group commands by category for the keyboard shortcuts modal
  const groupedCommands = commandsRef.current.reduce<Record<CommandCategory, Command[]>>(
    (acc, command) => {
      if (!acc[command.category]) {
        acc[command.category] = [];
      }
      if (command.shortcut) {
        acc[command.category].push(command);
      }
      return acc;
    },
    {} as Record<CommandCategory, Command[]>
  );
  
  // Format shortcut key for display
  const formatShortcut = (shortcut: string) => {
    return shortcut.split(' ').map(part => (
      <kbd key={part} className="px-2 py-1 mx-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700 shadow-sm">
        {part}
      </kbd>
    ));
  };

  return (
    <div>
      {/* Keyboard Shortcuts Modal */}
      <Dialog open={showKeyboardShortcutsModal} onOpenChange={setShowKeyboardShortcutsModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <Keyboard className="mr-2" /> Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Use these keyboard shortcuts to navigate quickly through the RXAI platform
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(groupedCommands).map(([category, commands]) => (
                <FadeIn key={category}>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b">
                      <h3 className="font-medium flex items-center">
                        {getCategoryIcon(category as CommandCategory)}
                        <span className="ml-2 capitalize">{category}</span>
                      </h3>
                    </div>
                    <div className="divide-y">
                      {commands.map(command => (
                        <div key={command.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800">
                          <div className="flex items-center">
                            {command.icon && <span className="mr-2 text-gray-500">{command.icon}</span>}
                            <div>
                              <div>{command.title}</div>
                              {command.description && (
                                <div className="text-xs text-gray-500 mt-0.5">{command.description}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            {command.shortcut && formatShortcut(command.shortcut)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-4">
              <h3 className="font-medium mb-2 flex items-center">
                <Lightbulb className="w-4 h-4 mr-2 text-blue-500" />
                Pro Tip
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Press <kbd className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded border">Ctrl</kbd> + <kbd className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded border">K</kbd> or <kbd className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded border">⌘</kbd> + <kbd className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded border">K</kbd> anytime to open the command palette.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowKeyboardShortcutsModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Command Palette */}
      <CommandPalette
        open={isOpen}
        onOpenChange={setIsOpen}
        placeholder="Search commands, navigation, and more..."
        actions={globalCommands.map(cmd => ({
          id: cmd.id,
          name: cmd.title,
          description: cmd.description,
          icon: cmd.icon,
          action: close => {
            cmd.action();
            close();
          },
          section: cmd.category as any,
          keywords: cmd.keywords,
          shortcut: cmd.shortcut ? cmd.shortcut.split(' ') : undefined,
          badge: cmd.isNew ? 'new' : cmd.isPopular ? 'popular' : undefined,
          disabled: cmd.disabled
        }))}
        contentClassName="max-w-xl"
      />
          
          {selectedCategory ? (
            <div className="space-y-4">
              <button
                className="text-xs text-blue-600 dark:text-blue-400 flex items-center px-2"
                onClick={() => setSelectedCategory(null)}
              >
                ← Back to all categories
              </button>
              
              <div className="space-y-1">
                {(commandsByCategory[selectedCategory] || []).map((command, index) => (
                  <ScaleIn key={command.id} delay={index * 0.03}>
                    <button
                      className={cn(
                        'w-full flex items-center justify-between px-2 py-2 text-sm rounded text-left group',
                        index === selectedIndex ? 'bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100' : 'hover:bg-gray-100 dark:hover:bg-gray-800',
                        command.disabled && 'opacity-50 cursor-not-allowed'
                      )}
                      onClick={() => !command.disabled && executeCommand(command)}
                    >
                      <div className="flex items-center">
                        {command.icon && <span className="mr-2 text-gray-500 dark:text-gray-400 group-hover:text-current">{command.icon}</span>}
                        <div>
                          <div className="flex items-center">
                            <span>{command.title}</span>
                            {command.isNew && (
                              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100 font-medium">New</span>
                            )}
                            {command.isPopular && (
                              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100 font-medium">Popular</span>
                            )}
                          </div>
                          {command.description && (
                            <div className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">{command.description}</div>
                          )}
                        </div>
                      </div>
                      
                      {command.shortcut && (
                        <div className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-500 dark:text-gray-400">
                          {command.shortcut}
                        </div>
                      )}
                    </button>
                  </ScaleIn>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCommands.length === 0 && searchTerm ? (
                <div className="px-2 py-4 text-center text-gray-500 dark:text-gray-400">
                  <Search className="mx-auto h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">No results found for "{searchTerm}"</p>
                  <p className="text-xs mt-1">Try a different search term or browse categories</p>
                </div>
              ) : (
                searchTerm === '' && (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(commandsByCategory).map((category, idx) => (
                      <button
                        key={category}
                        className="flex items-center px-3 py-2 text-sm rounded border hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                        onClick={() => setSelectedCategory(category as CommandCategory)}
                      >
                        <span className="mr-2 text-gray-500 dark:text-gray-400">
                          {getCategoryIcon(category as CommandCategory)}
                        </span>
                        <span className="capitalize">{category}</span>
                        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                          {commandsByCategory[category as CommandCategory].length}
                        </span>
                      </button>
                    ))}
                  </div>
                )
              )}
              
              {searchTerm !== '' && filteredCommands.length > 0 && (
                <div className="space-y-4">
                  {Object.entries(commandsByCategory).map(([category, commands]) => (
                    <div key={category}>
                      <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {category}
                      </div>
                      <div className="space-y-1 mt-1">
                        {commands.map((command, commandIndex) => {
                          const index = filteredCommands.findIndex(cmd => cmd.id === command.id);
                          return (
                            <button
                              key={command.id}
                              className={cn(
                                'w-full flex items-center justify-between px-2 py-2 text-sm rounded text-left group',
                                index === selectedIndex ? 'bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100' : 'hover:bg-gray-100 dark:hover:bg-gray-800',
                                command.disabled && 'opacity-50 cursor-not-allowed'
                              )}
                              onClick={() => !command.disabled && executeCommand(command)}
                            >
                              <div className="flex items-center">
                                {command.icon && <span className="mr-2 text-gray-500 dark:text-gray-400 group-hover:text-current">{command.icon}</span>}
                                <span>{command.title}</span>
                              </div>
                              
                              {command.shortcut && (
                                <div className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-500 dark:text-gray-400">
                                  {command.shortcut}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      }
    />
    </div>
  );
};