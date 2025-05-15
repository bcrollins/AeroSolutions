import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useLocation, useNavigate } from 'wouter';
import { Command as CommandPrimitive } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Search,
  FileText,
  Book,
  Home,
  Zap,
  Video,
  GraduationCap,
  MessageSquare,
  PanelLeft,
  LayoutDashboard,
  HelpCircle,
  LifeBuoy,
  LogOut,
  FileCode,
  FileQuestion,
  StickyNote,
  Newspaper,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Define command action types
type CommandAction = {
  id: string;
  name: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string[];
  section: 'navigation' | 'actions' | 'tools' | 'help' | 'account' | 'courses';
  keywords: string[];
  action: () => void;
  disabled?: boolean;
};

// Context for the command palette
type CommandPaletteContextType = {
  isOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  registerCommand: (command: CommandAction) => void;
  unregisterCommand: (id: string) => void;
};

const CommandPaletteContext = createContext<CommandPaletteContextType>({
  isOpen: false,
  openCommandPalette: () => {},
  closeCommandPalette: () => {},
  toggleCommandPalette: () => {},
  registerCommand: () => {},
  unregisterCommand: () => {},
});

export const useCommandPalette = () => useContext(CommandPaletteContext);

interface CommandPaletteProviderProps {
  children: ReactNode;
  defaultCommands?: CommandAction[];
}

export function CommandPaletteProvider({
  children,
  defaultCommands = [],
}: CommandPaletteProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [commands, setCommands] = useState<CommandAction[]>(defaultCommands);
  const [, navigate] = useNavigate();
  const [location] = useLocation();

  // Effect to handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Define commands based on current app state
  useEffect(() => {
    // Navigation commands
    const navigationCommands: CommandAction[] = [
      {
        id: 'home',
        name: 'Home',
        icon: <Home className="h-4 w-4" />,
        shortcut: ['g', 'h'],
        section: 'navigation',
        keywords: ['home', 'main', 'start', 'landing'],
        action: () => {
          navigate('/');
          setIsOpen(false);
        },
      },
      {
        id: 'dashboard',
        name: 'Dashboard',
        icon: <LayoutDashboard className="h-4 w-4" />,
        shortcut: ['g', 'd'],
        section: 'navigation',
        keywords: ['dashboard', 'stats', 'overview', 'analytics'],
        action: () => {
          navigate('/dashboard');
          setIsOpen(false);
        },
      },
      {
        id: 'courses',
        name: 'Browse Courses',
        icon: <Book className="h-4 w-4" />,
        shortcut: ['g', 'c'],
        section: 'navigation',
        keywords: ['courses', 'classes', 'learning', 'catalog'],
        action: () => {
          navigate('/courses');
          setIsOpen(false);
        },
      },
      {
        id: 'articles',
        name: 'Articles & Resources',
        icon: <Newspaper className="h-4 w-4" />,
        shortcut: ['g', 'a'],
        section: 'navigation',
        keywords: ['articles', 'blog', 'resources', 'news', 'read'],
        action: () => {
          navigate('/articles');
          setIsOpen(false);
        },
      },
      {
        id: 'community',
        name: 'Community Forum',
        icon: <MessageSquare className="h-4 w-4" />,
        shortcut: ['g', 'f'],
        section: 'navigation',
        keywords: ['community', 'forum', 'chat', 'discuss', 'questions'],
        action: () => {
          navigate('/community');
          setIsOpen(false);
        },
      },
    ];

    // Course-related commands
    const courseCommands: CommandAction[] = [
      {
        id: 'my-courses',
        name: 'My Courses',
        icon: <BookOpen className="h-4 w-4" />,
        section: 'courses',
        keywords: ['my courses', 'enrolled', 'learning', 'progress'],
        action: () => {
          navigate('/dashboard/courses');
          setIsOpen(false);
        },
      },
      {
        id: 'continue-learning',
        name: 'Continue Learning',
        icon: <GraduationCap className="h-4 w-4" />,
        section: 'courses',
        keywords: ['continue', 'resume', 'last', 'course'],
        action: () => {
          // This would typically navigate to the last accessed course
          navigate('/dashboard/courses/continue');
          setIsOpen(false);
        },
      },
      {
        id: 'ai-fundamentals',
        name: 'AI Fundamentals',
        icon: <Zap className="h-4 w-4" />,
        section: 'courses',
        keywords: ['ai', 'fundamentals', 'basics', 'introduction'],
        action: () => {
          navigate('/courses/ai-fundamentals');
          setIsOpen(false);
        },
      },
      {
        id: 'course-certificates',
        name: 'My Certificates',
        icon: <FileText className="h-4 w-4" />,
        section: 'courses',
        keywords: ['certificates', 'achievements', 'completion', 'awards'],
        action: () => {
          navigate('/dashboard/certificates');
          setIsOpen(false);
        },
      },
    ];

    // Tools commands
    const toolCommands: CommandAction[] = [
      {
        id: 'search',
        name: 'Search...',
        icon: <Search className="h-4 w-4" />,
        shortcut: ['/'],
        section: 'tools',
        keywords: ['search', 'find', 'lookup'],
        action: () => {
          setIsOpen(false);
          // This would typically focus a search input
          document.getElementById('global-search')?.focus();
        },
      },
      {
        id: 'notes',
        name: 'My Notes',
        icon: <StickyNote className="h-4 w-4" />,
        section: 'tools',
        keywords: ['notes', 'annotations', 'save', 'highlights'],
        action: () => {
          navigate('/dashboard/notes');
          setIsOpen(false);
        },
      },
      {
        id: 'calendar',
        name: 'Calendar',
        icon: <Calendar className="h-4 w-4" />,
        section: 'tools',
        keywords: ['calendar', 'schedule', 'events', 'dates'],
        action: () => {
          navigate('/dashboard/calendar');
          setIsOpen(false);
        },
      },
    ];

    // Account commands
    const accountCommands: CommandAction[] = [
      {
        id: 'profile',
        name: 'My Profile',
        icon: <User className="h-4 w-4" />,
        section: 'account',
        keywords: ['profile', 'account', 'me', 'personal'],
        action: () => {
          navigate('/dashboard/profile');
          setIsOpen(false);
        },
      },
      {
        id: 'subscription',
        name: 'Subscription',
        icon: <CreditCard className="h-4 w-4" />,
        section: 'account',
        keywords: ['subscription', 'billing', 'plan', 'payment'],
        action: () => {
          navigate('/dashboard/subscription');
          setIsOpen(false);
        },
      },
      {
        id: 'settings',
        name: 'Settings',
        icon: <Settings className="h-4 w-4" />,
        shortcut: ['g', 's'],
        section: 'account',
        keywords: ['settings', 'preferences', 'options', 'config'],
        action: () => {
          navigate('/settings');
          setIsOpen(false);
        },
      },
      {
        id: 'logout',
        name: 'Log Out',
        icon: <LogOut className="h-4 w-4" />,
        section: 'account',
        keywords: ['logout', 'sign out', 'exit'],
        action: () => {
          // This would typically call a logout function
          window.location.href = '/api/logout';
          setIsOpen(false);
        },
      },
    ];

    // Help commands
    const helpCommands: CommandAction[] = [
      {
        id: 'help-center',
        name: 'Help Center',
        icon: <HelpCircle className="h-4 w-4" />,
        section: 'help',
        keywords: ['help', 'support', 'assistance', 'docs'],
        action: () => {
          navigate('/help');
          setIsOpen(false);
        },
      },
      {
        id: 'contact-support',
        name: 'Contact Support',
        icon: <LifeBuoy className="h-4 w-4" />,
        section: 'help',
        keywords: ['contact', 'support', 'assistance', 'ticket'],
        action: () => {
          navigate('/support');
          setIsOpen(false);
        },
      },
      {
        id: 'shortcuts',
        name: 'Keyboard Shortcuts',
        icon: <FileCode className="h-4 w-4" />,
        shortcut: ['?'],
        section: 'help',
        keywords: ['keyboard', 'shortcuts', 'keys', 'hotkeys'],
        action: () => {
          // This would typically open a keyboard shortcuts overlay
          document.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));
          setIsOpen(false);
        },
      },
      {
        id: 'faq',
        name: 'FAQ',
        icon: <FileQuestion className="h-4 w-4" />,
        section: 'help',
        keywords: ['faq', 'questions', 'answers', 'common'],
        action: () => {
          navigate('/faq');
          setIsOpen(false);
        },
      },
    ];

    // Combine all commands
    setCommands([
      ...navigationCommands,
      ...courseCommands,
      ...toolCommands, 
      ...accountCommands,
      ...helpCommands
    ]);
  }, [navigate, location]);

  // Register and unregister custom commands
  const registerCommand = (command: CommandAction) => {
    setCommands((prevCommands) => {
      // Check if command with same ID already exists
      if (prevCommands.some((cmd) => cmd.id === command.id)) {
        return prevCommands.map((cmd) =>
          cmd.id === command.id ? command : cmd
        );
      }
      return [...prevCommands, command];
    });
  };

  const unregisterCommand = (id: string) => {
    setCommands((prevCommands) =>
      prevCommands.filter((cmd) => cmd.id !== id)
    );
  };

  // Provide context value
  const contextValue: CommandPaletteContextType = {
    isOpen,
    openCommandPalette: () => setIsOpen(true),
    closeCommandPalette: () => setIsOpen(false),
    toggleCommandPalette: () => setIsOpen((prev) => !prev),
    registerCommand,
    unregisterCommand,
  };

  return (
    <CommandPaletteContext.Provider value={contextValue}>
      {children}
      <CommandPaletteModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        commands={commands}
      />
    </CommandPaletteContext.Provider>
  );
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandAction[];
}

function CommandPaletteModal({
  isOpen,
  onClose,
  commands,
}: CommandPaletteModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const commandsBySection = React.useMemo(() => {
    return commands.reduce(
      (acc, command) => {
        if (!acc[command.section]) {
          acc[command.section] = [];
        }
        acc[command.section].push(command);
        return acc;
      },
      {} as Record<string, CommandAction[]>
    );
  }, [commands]);

  // Get section titles
  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'navigation':
        return 'Navigation';
      case 'actions':
        return 'Actions';
      case 'tools':
        return 'Tools';
      case 'help':
        return 'Help & Support';
      case 'account':
        return 'Account';
      case 'courses':
        return 'Courses';
      default:
        return section.charAt(0).toUpperCase() + section.slice(1);
    }
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <div className="max-h-[85vh] overflow-hidden rounded-lg border bg-background shadow-xl">
        <div className="flex flex-col">
          <CommandInput
            placeholder="Type a command or search..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="border-0 border-b focus:ring-0"
          />
          <CommandList className="max-h-[65vh] overflow-y-auto overflow-x-hidden">
            <CommandEmpty className="py-6 text-center text-sm">
              No commands found.
            </CommandEmpty>
            
            {Object.entries(commandsBySection).map(([section, sectionCommands]) => (
              <CommandGroup
                key={section}
                heading={getSectionTitle(section)}
                className="py-2 px-1"
              >
                {sectionCommands.map((command) => (
                  <CommandItem
                    key={command.id}
                    onSelect={() => {
                      command.action();
                      onClose();
                    }}
                    disabled={command.disabled}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5",
                      command.disabled && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    {command.icon && (
                      <span className="flex-shrink-0 text-muted-foreground">
                        {command.icon}
                      </span>
                    )}
                    <span className="flex-grow truncate">
                      {command.name}
                      {command.description && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {command.description}
                        </span>
                      )}
                    </span>
                    {command.shortcut && (
                      <div className="flex-shrink-0 flex items-center gap-1">
                        {command.shortcut.map((key, i) => (
                          <React.Fragment key={i}>
                            <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold">
                              {key}
                            </kbd>
                            {i < command.shortcut!.length - 1 && (
                              <span className="text-xs text-muted-foreground">
                                +
                              </span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
            <div className="py-2 px-4 text-xs text-muted-foreground">
              <p>
                Press <kbd className="rounded bg-muted px-1 py-0.5">↑</kbd> and{" "}
                <kbd className="rounded bg-muted px-1 py-0.5">↓</kbd> to navigate,{" "}
                <kbd className="rounded bg-muted px-1 py-0.5">Enter</kbd> to select,{" "}
                <kbd className="rounded bg-muted px-1 py-0.5">Esc</kbd> to close
              </p>
            </div>
          </CommandList>
        </div>
      </div>
    </CommandDialog>
  );
}

export function CommandButton({ className }: { className?: string }) {
  const { openCommandPalette } = useCommandPalette();
  
  return (
    <button
      onClick={openCommandPalette}
      className={cn(
        "inline-flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground",
        className
      )}
    >
      <div className="flex items-center gap-1">
        <Search className="h-4 w-4" />
        <span>Search or use command...</span>
      </div>
      <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}