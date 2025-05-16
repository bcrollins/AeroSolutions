import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { Menu, X, ChevronDown, ChevronRight, Moon, Sun, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import { useSoundEffects } from '@/hooks/use-sound-effects';

interface NavItem {
  label: string;
  href?: string;
  children?: NavItem[];
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface AdvancedNavbarProps {
  logo?: React.ReactNode;
  navItems: NavItem[];
  userActions?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'solid' | 'transparent' | 'glass';
  sticky?: boolean;
  className?: string;
  onThemeToggle?: () => void;
  showThemeToggle?: boolean;
  showNotifications?: boolean;
  onNotificationsClick?: () => void;
  notificationsCount?: number;
}

/**
 * Advanced navigation bar with beautiful animations and mobile responsiveness
 */
const AdvancedNavbar: React.FC<AdvancedNavbarProps> = ({
  logo,
  navItems,
  userActions,
  position = 'top',
  variant = 'glass',
  sticky = true,
  className,
  onThemeToggle,
  showThemeToggle = true,
  showNotifications = false,
  onNotificationsClick,
  notificationsCount = 0
}) => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const { playSound, settings } = useSoundEffects();
  const soundEnabled = settings?.enabled || false;

  // Background styles based on variant
  const variantStyles = {
    solid: 'bg-background border-b border-border',
    transparent: 'bg-transparent',
    glass: isScrolled
      ? 'bg-background/80 backdrop-blur-md border-b border-border/40'
      : 'bg-transparent'
  };

  // Position styles
  const positionStyles = {
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0',
    left: 'top-0 left-0 bottom-0 h-full flex-col',
    right: 'top-0 right-0 bottom-0 h-full flex-col'
  };

  // Handle scroll events for glass effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll position
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu on location change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Toggle mobile menu with sound effect
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (soundEnabled) {
      playSound(isMobileMenuOpen ? 'click' : 'navigation');
    }
  };

  // Handle dropdown menu visibility
  const toggleDropdown = (label: string) => {
    if (activeDropdown === label) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(label);
      if (soundEnabled) playSound('navigation');
    }
  };

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (onThemeToggle) onThemeToggle();
    if (soundEnabled) playSound('click');
  };

  // Handle notification click
  const handleNotificationsClick = () => {
    if (onNotificationsClick) onNotificationsClick();
    if (soundEnabled) playSound('notification');
  };

  // Render a nav item (top level or dropdown)
  const renderNavItem = (item: NavItem, isDropdownItem = false, isMobile = false) => {
    const isActive = item.href && location === item.href;
    const hasChildren = item.children && item.children.length > 0;
    const isDropdownActive = activeDropdown === item.label;
    
    // Base classes for all nav items
    const baseClasses = cn(
      "relative font-medium transition-colors",
      isActive 
        ? "text-primary" 
        : "text-foreground/80 hover:text-foreground",
      isDropdownItem 
        ? "p-3 w-full text-left" 
        : isMobile 
          ? "py-4 px-6 flex justify-between items-center w-full border-b border-border/10" 
          : "px-4 py-2 rounded-md"
    );
    
    // Content for all nav items
    const itemContent = (
      <>
        <span className="flex items-center gap-2">
          {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
          {item.label}
        </span>
        
        {hasChildren && (
          <span className="ml-1">
            {isMobile ? (
              <ChevronRight className={cn(
                "h-4 w-4 transition-transform", 
                isDropdownActive && "rotate-90"
              )} />
            ) : (
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform", 
                isDropdownActive && "rotate-180"
              )} />
            )}
          </span>
        )}
      </>
    );
    
    // If item has children, render a dropdown trigger
    if (hasChildren) {
      return (
        <div className={cn(
          "relative",
          isMobile ? "w-full" : "group"
        )}>
          <button
            className={cn(
              baseClasses,
              "flex items-center",
              isDropdownActive && "bg-accent/50"
            )}
            onClick={() => toggleDropdown(item.label)}
          >
            {itemContent}
          </button>
          
          <AnimatePresence>
            {isDropdownActive && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "bg-popover border border-border shadow-md rounded-md overflow-hidden z-10",
                  isMobile 
                    ? "w-full mt-1 ml-6 mr-2" 
                    : "absolute left-0 mt-1 min-w-[180px]"
                )}
              >
                <div className="py-1">
                  {item.children?.map((child, idx) => (
                    <div key={idx}>
                      {renderNavItem(child, true, isMobile)}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }
    
    // If item has href, render a link
    if (item.href) {
      return (
        <Link 
          href={item.href}
          className={cn(
            baseClasses,
            isDropdownItem && "hover:bg-accent/50 block"
          )}
          onClick={() => {
            if (soundEnabled) playSound('navigation');
            if (isDropdownItem) setActiveDropdown(null);
          }}
        >
          {itemContent}
          
          {!isDropdownItem && !isMobile && (
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-primary"
              initial={{ width: 0 }}
              animate={{ width: isActive ? '100%' : 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </Link>
      );
    }
    
    // If item has onClick handler, render a button
    if (item.onClick) {
      return (
        <button 
          className={cn(
            baseClasses,
            isDropdownItem && "hover:bg-accent/50 block"
          )}
          onClick={() => {
            item.onClick?.();
            if (soundEnabled) playSound('click');
            if (isDropdownItem) setActiveDropdown(null);
          }}
        >
          {itemContent}
        </button>
      );
    }
    
    // Fallback for items with no href or onClick
    return <div className={baseClasses}>{itemContent}</div>;
  };
  
  // Render desktop navigation
  const renderDesktopNav = () => (
    <div className="hidden md:flex items-center gap-1">
      {navItems.map((item, idx) => (
        <div key={idx} className="relative">
          {renderNavItem(item)}
        </div>
      ))}
    </div>
  );
  
  // Render mobile navigation
  const renderMobileNav = () => (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="md:hidden fixed inset-0 z-40 pt-16 bg-background/95 backdrop-blur-sm"
        >
          <div className="container h-full overflow-y-auto px-4 py-6">
            <div className="flex flex-col">
              {navItems.map((item, idx) => (
                <div key={idx} className="w-full">
                  {renderNavItem(item, false, true)}
                </div>
              ))}
              
              {userActions && (
                <div className="mt-6 pt-6 border-t border-border/10">
                  {userActions}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <header
      className={cn(
        "w-full z-50 transition-all duration-300",
        variantStyles[variant],
        positionStyles[position],
        sticky && "sticky",
        className
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          {logo}
        </div>
        
        {/* Desktop Navigation */}
        {renderDesktopNav()}
        
        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          {showThemeToggle && (
            <motion.button
              className="p-2 rounded-md hover:bg-accent/50 text-foreground/80"
              onClick={handleThemeToggle}
              whileTap={{ scale: 0.95 }}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
          )}
          
          {/* Notifications */}
          {showNotifications && (
            <motion.button
              className="p-2 rounded-md hover:bg-accent/50 text-foreground/80 relative"
              onClick={handleNotificationsClick}
              whileTap={{ scale: 0.95 }}
              aria-label="Notifications"
            >
              <Bell size={20} />
              {notificationsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {notificationsCount > 9 ? '9+' : notificationsCount}
                </span>
              )}
            </motion.button>
          )}
          
          {/* User actions for desktop */}
          <div className="hidden md:flex items-center ml-2">
            {userActions}
          </div>
          
          {/* Mobile menu toggle */}
          <button
            className="p-2 md:hidden rounded-md hover:bg-accent/50 text-foreground/80"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {renderMobileNav()}
    </header>
  );
};

export default AdvancedNavbar;