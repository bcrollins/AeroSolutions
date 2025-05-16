import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { useSoundEffects } from '@/hooks/use-sound-effects';

interface ThemeSwitcherProps {
  variant?: 'icon' | 'toggle' | 'dropdown' | 'sidebar';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabels?: boolean;
  autoCollapse?: boolean;
}

/**
 * An enhanced theme switcher with animations and different variants
 */
const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'icon',
  size = 'md',
  className,
  showLabels = false,
  autoCollapse = true
}) => {
  const { theme, setTheme } = useTheme();
  const { playSound, settings } = useSoundEffects();
  const soundEnabled = settings?.enabled || false;
  const [isOpen, setIsOpen] = useState(false);

  // Icon sizes based on the size prop
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  // Toggle menu open/close
  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (soundEnabled) playSound('click');
  };

  // Close the menu when clicking outside
  useEffect(() => {
    if (!isOpen || !autoCollapse) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.theme-switcher')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen, autoCollapse]);

  // Change theme with animation and sound
  const changeTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    if (soundEnabled) playSound('success');
    if (autoCollapse) setIsOpen(false);
  };

  // Icon-only variant with hover tooltip
  if (variant === 'icon') {
    return (
      <motion.button
        className={cn(
          "relative rounded-full bg-accent/20 p-2 transition-colors hover:bg-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          size === 'sm' ? 'p-1.5' : size === 'lg' ? 'p-2.5' : 'p-2',
          className
        )}
        onClick={() => {
          if (soundEnabled) playSound('click');
          setTheme(theme === 'dark' ? 'light' : 'dark');
        }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? (
          <Sun size={iconSizes[size]} className="text-yellow-400" />
        ) : (
          <Moon size={iconSizes[size]} className="text-slate-800" />
        )}

        {/* Tooltip */}
        {showLabels && (
          <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium py-1 px-2 rounded-md bg-popover border border-border shadow-sm whitespace-nowrap z-10">
            {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          </span>
        )}
      </motion.button>
    );
  }

  // Toggle switch variant
  if (variant === 'toggle') {
    return (
      <motion.button
        className={cn(
          "relative inline-flex h-6 rounded-full bg-accent/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          size === 'sm' ? 'w-11' : size === 'lg' ? 'w-14 h-7' : 'w-12',
          className
        )}
        onClick={() => {
          if (soundEnabled) playSound('click');
          setTheme(theme === 'dark' ? 'light' : 'dark');
        }}
        whileTap={{ scale: 0.97 }}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <span className="sr-only">Toggle theme</span>
        <motion.span
          className={cn(
            "pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-background shadow-sm",
            theme === 'dark' ? 'right-1' : 'left-1',
            size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
          )}
          animate={{ 
            x: theme === 'dark' 
              ? size === 'sm' ? 16 : size === 'lg' ? 28 : 20 
              : 0 
          }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
        >
          {theme === 'dark' ? (
            <Moon size={iconSizes[size] - 8} className="text-slate-700" />
          ) : (
            <Sun size={iconSizes[size] - 8} className="text-yellow-500" />
          )}
        </motion.span>
      </motion.button>
    );
  }

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className="relative theme-switcher">
        <motion.button
          className={cn(
            "flex items-center gap-2 rounded-md bg-accent/20 px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            size === 'sm' ? 'text-xs py-1.5 px-2.5' : size === 'lg' ? 'text-base py-2.5 px-4' : 'text-sm py-2 px-3',
            className
          )}
          onClick={toggleMenu}
          whileTap={{ scale: 0.97 }}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {theme === 'dark' ? (
            <Moon size={iconSizes[size] - 4} className="text-slate-200" />
          ) : theme === 'light' ? (
            <Sun size={iconSizes[size] - 4} className="text-yellow-500" />
          ) : (
            <Monitor size={iconSizes[size] - 4} className="text-foreground" />
          )}
          {showLabels && (
            <span>
              {theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System'}
            </span>
          )}
        </motion.button>

        <AnimatedMenu 
          isOpen={isOpen} 
          theme={theme} 
          changeTheme={changeTheme} 
          size={size} 
          iconSizes={iconSizes} 
        />
      </div>
    );
  }

  // Sidebar variant - full-width buttons in a list
  if (variant === 'sidebar') {
    return (
      <div className={cn("rounded-md border border-border overflow-hidden", className)}>
        <ThemeOption
          theme="light"
          currentTheme={theme}
          onChange={changeTheme}
          label="Light"
          icon={<Sun size={iconSizes[size]} className="text-yellow-500" />}
          size={size}
        />
        <ThemeOption
          theme="dark"
          currentTheme={theme}
          onChange={changeTheme}
          label="Dark"
          icon={<Moon size={iconSizes[size]} className="text-slate-200" />}
          size={size}
        />
        <ThemeOption
          theme="system"
          currentTheme={theme}
          onChange={changeTheme}
          label="System"
          icon={<Monitor size={iconSizes[size]} className="text-foreground" />}
          size={size}
        />
      </div>
    );
  }

  // Default fallback to icon variant
  return (
    <button
      className={cn(
        "rounded-full p-2 bg-accent/20 transition-colors hover:bg-accent/40",
        className
      )}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun size={iconSizes[size]} />
      ) : (
        <Moon size={iconSizes[size]} />
      )}
    </button>
  );
};

// Animated dropdown menu component
const AnimatedMenu = ({ 
  isOpen, 
  theme, 
  changeTheme, 
  size, 
  iconSizes 
}: { 
  isOpen: boolean;
  theme: string;
  changeTheme: (theme: 'light' | 'dark' | 'system') => void;
  size: 'sm' | 'md' | 'lg';
  iconSizes: Record<'sm' | 'md' | 'lg', number>;
}) => {
  const menuVariants = {
    hidden: { opacity: 0, y: -5, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 }
  };

  return (
    <>
      {isOpen && (
        <motion.div
          className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-popover shadow-lg border border-border ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={menuVariants}
          transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
        >
          <div className="py-1">
            <ThemeMenuItem
              theme="light"
              currentTheme={theme}
              onChange={changeTheme}
              label="Light"
              icon={<Sun size={iconSizes[size]} className="text-yellow-500" />}
              size={size}
            />
            <ThemeMenuItem
              theme="dark"
              currentTheme={theme}
              onChange={changeTheme}
              label="Dark"
              icon={<Moon size={iconSizes[size]} className="text-slate-200" />}
              size={size}
            />
            <ThemeMenuItem
              theme="system"
              currentTheme={theme}
              onChange={changeTheme}
              label="System"
              icon={<Monitor size={iconSizes[size]} className="text-foreground" />}
              size={size}
            />
          </div>
        </motion.div>
      )}
    </>
  );
};

// Menu item for dropdown
const ThemeMenuItem = ({ 
  theme, 
  currentTheme, 
  onChange, 
  label, 
  icon,
  size
}: { 
  theme: 'light' | 'dark' | 'system';
  currentTheme: string;
  onChange: (theme: 'light' | 'dark' | 'system') => void;
  label: string;
  icon: React.ReactNode;
  size: 'sm' | 'md' | 'lg';
}) => {
  const isActive = theme === currentTheme;
  
  const sizeClasses = {
    sm: 'py-1.5 px-2.5 text-xs',
    md: 'py-2 px-3 text-sm',
    lg: 'py-2.5 px-4 text-base'
  };
  
  return (
    <button
      className={cn(
        "flex w-full items-center justify-between",
        sizeClasses[size],
        isActive ? "bg-accent/50 text-accent-foreground" : "text-foreground hover:bg-accent/20"
      )}
      onClick={() => onChange(theme)}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
      {isActive && <Check size={16} className="text-primary" />}
    </button>
  );
};

// Theme option for sidebar variant
const ThemeOption = ({ 
  theme, 
  currentTheme, 
  onChange, 
  label, 
  icon,
  size
}: { 
  theme: 'light' | 'dark' | 'system';
  currentTheme: string;
  onChange: (theme: 'light' | 'dark' | 'system') => void;
  label: string;
  icon: React.ReactNode;
  size: 'sm' | 'md' | 'lg';
}) => {
  const isActive = theme === currentTheme;
  
  const sizeClasses = {
    sm: 'py-1.5 px-2.5 text-xs',
    md: 'py-2 px-3 text-sm',
    lg: 'py-2.5 px-4 text-base'
  };
  
  return (
    <button
      className={cn(
        "flex w-full items-center justify-between transition-colors",
        sizeClasses[size],
        isActive 
          ? "bg-accent text-accent-foreground" 
          : "text-foreground hover:bg-accent/20"
      )}
      onClick={() => onChange(theme)}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
      {isActive && <Check size={16} className="text-primary" />}
    </button>
  );
};

export default ThemeSwitcher;