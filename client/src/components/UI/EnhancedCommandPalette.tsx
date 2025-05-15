import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  CommandDialog, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem,
  CommandSeparator,
  CommandShortcut
} from '@/components/ui/command';
import { SearchIcon, Settings, User, LayoutDashboard, Book, FileText, HelpCircle, Github, LogOut } from 'lucide-react';
import { restartOnboardingTour } from '../Onboarding/OnboardingTour';
import useSoundEffects from '../../hooks/use-sound-effects';
import useKeyboardSound from '../../hooks/use-keyboard-sound';

export function EnhancedCommandPalette() {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { playSound, soundEnabled } = useSoundEffects();

  // Define command groups and items
  const navigationCommands = [
    { label: 'Dashboard', icon: <LayoutDashboard className="mr-2 h-4 w-4" />, action: () => setLocation('/dashboard'), shortcut: 'D' },
    { label: 'Courses', icon: <Book className="mr-2 h-4 w-4" />, action: () => setLocation('/courses'), shortcut: 'C' },
    { label: 'Articles', icon: <FileText className="mr-2 h-4 w-4" />, action: () => setLocation('/articles'), shortcut: 'A' },
  ];

  const userCommands = [
    { label: 'Profile', icon: <User className="mr-2 h-4 w-4" />, action: () => setLocation('/profile'), shortcut: 'P' },
    { label: 'Settings', icon: <Settings className="mr-2 h-4 w-4" />, action: () => setLocation('/settings'), shortcut: 'S' },
    { label: 'Logout', icon: <LogOut className="mr-2 h-4 w-4" />, action: () => setLocation('/logout'), shortcut: 'L' },
  ];

  const helpCommands = [
    { label: 'Documentation', icon: <FileText className="mr-2 h-4 w-4" />, action: () => window.open('/docs', '_blank'), shortcut: 'D' },
    { label: 'GitHub', icon: <Github className="mr-2 h-4 w-4" />, action: () => window.open('https://github.com/rollins-x/rxai', '_blank'), shortcut: 'G' },
    { label: 'Restart Tour', icon: <HelpCircle className="mr-2 h-4 w-4" />, action: () => {
      restartOnboardingTour(); 
      setOpen(false);
    }, shortcut: 'T' },
  ];

  // Handle keyboard shortcut to open command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (soundEnabled) playSound('notification');
        setOpen((open) => !open);
      }
    };
    
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [playSound, soundEnabled]);

  // Use keyboard sound hook for focused navigation
  useKeyboardSound({
    enabled: open,
    onEnter: () => {
      // Handle in the component itself
    },
    onEsc: () => {
      if (open) setOpen(false);
    }
  });

  // Handle command selection with sound
  const handleSelect = (action: () => void) => {
    if (soundEnabled) playSound('click');
    action();
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Type a command or search..." 
        onFocus={() => soundEnabled && playSound('hover')}
      />
      <CommandList>
        <CommandEmpty className="py-6 text-center text-sm">
          No results found.
        </CommandEmpty>
        
        <CommandGroup heading="Navigation">
          {navigationCommands.map((command, index) => (
            <CommandItem 
              key={`nav-${index}`} 
              onSelect={() => handleSelect(command.action)}
              onMouseEnter={() => soundEnabled && playSound('hover')}
            >
              {command.icon}
              <span>{command.label}</span>
              {command.shortcut && (
                <CommandShortcut>⌘{command.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="User">
          {userCommands.map((command, index) => (
            <CommandItem 
              key={`user-${index}`} 
              onSelect={() => handleSelect(command.action)}
              onMouseEnter={() => soundEnabled && playSound('hover')}
            >
              {command.icon}
              <span>{command.label}</span>
              {command.shortcut && (
                <CommandShortcut>⌘{command.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Help & Resources">
          {helpCommands.map((command, index) => (
            <CommandItem 
              key={`help-${index}`} 
              onSelect={() => handleSelect(command.action)}
              onMouseEnter={() => soundEnabled && playSound('hover')}
            >
              {command.icon}
              <span>{command.label}</span>
              {command.shortcut && (
                <CommandShortcut>⌘{command.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export default EnhancedCommandPalette;