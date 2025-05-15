import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type Theme = 'light' | 'dark' | 'system';

interface ThemeSwitcherProps {
  variant?: 'icon' | 'toggle' | 'dropdown';
  showLabels?: boolean;
  className?: string;
  iconSize?: number;
  tooltips?: boolean;
  additionalThemes?: { name: string; value: Theme; icon: React.ReactNode }[];
}

/**
 * Enhanced theme switcher with animations and multiple display options
 */
export default function ThemeSwitcher({
  variant = 'icon',
  showLabels = false,
  className = '',
  iconSize = 18,
  tooltips = true,
  additionalThemes = []
}: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), []);
  
  if (!mounted) return null;
  
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const currentTheme = theme === 'system' ? systemTheme : theme;
  
  // Theme icons with animations
  const themeIcons = {
    light: (
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <Sun size={iconSize} className="text-amber-500" />
      </motion.div>
    ),
    dark: (
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Moon size={iconSize} className="text-indigo-400" />
      </motion.div>
    ),
    system: <Monitor size={iconSize} className="text-gray-500" />
  };
  
  // Labels for each theme
  const themeLabels = {
    light: 'Light',
    dark: 'Dark',
    system: 'System'
  };
  
  // All theme options
  const themeOptions = [
    { name: 'Light', value: 'light' as Theme, icon: themeIcons.light },
    { name: 'Dark', value: 'dark' as Theme, icon: themeIcons.dark },
    { name: 'System', value: 'system' as Theme, icon: themeIcons.system },
    ...additionalThemes
  ];
  
  // Toggle between dark and light mode
  const toggleTheme = () => {
    if (currentTheme === 'dark') {
      setTheme('light' as Theme);
    } else {
      setTheme('dark' as Theme);
    }
  };
  
  // Render different variants
  if (variant === 'toggle') {
    return (
      <div className={`flex items-center ${className}`}>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            value=""
            className="sr-only peer"
            checked={currentTheme === 'dark'}
            onChange={toggleTheme}
          />
          <motion.div
            className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-200 rounded-full peer 
              peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] 
              after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 
              after:border after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all 
              dark:border-gray-600 peer-checked:bg-primary`}
            animate={{ backgroundColor: currentTheme === 'dark' ? 'var(--color-primary)' : '' }}
          />
          <span className="ml-3 text-sm font-medium">
            {currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </span>
        </label>
      </div>
    );
  }
  
  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={className}>
            {currentTheme === 'dark' ? themeIcons.dark : currentTheme === 'light' ? themeIcons.light : themeIcons.system}
            {showLabels && (
              <span className="ml-2">{themeLabels[theme as keyof typeof themeLabels]}</span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {themeOptions.map((option) => (
            <DropdownMenuItem 
              key={option.value}
              onClick={() => setTheme(option.value as Theme)}
              className="cursor-pointer flex items-center"
            >
              <div className="mr-2">{option.icon}</div>
              <span>{option.name}</span>
              {theme === option.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto"
                >
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </motion.div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  // Default icon variant
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className={className}
          >
            <motion.div
              key={currentTheme}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {currentTheme === 'dark' ? themeIcons.dark : themeIcons.light}
            </motion.div>
            <span className="sr-only">
              Toggle {currentTheme === 'dark' ? 'Light' : 'Dark'} Mode
            </span>
          </Button>
        </TooltipTrigger>
        {tooltips && (
          <TooltipContent>
            <p>Switch to {currentTheme === 'dark' ? 'Light' : 'Dark'} Mode</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}