import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { useDevice } from '@/hooks/use-device';
import { 
  Home, 
  Book, 
  User, 
  Search, 
  Settings, 
  MoreHorizontal, 
  X, 
  Grid, 
  Command 
} from 'lucide-react';
import { 
  Drawer,
  DrawerContent,
  DrawerTrigger 
} from '@/components/ui/drawer';
import { ButtonPress } from './MicroInteractions';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  onClick?: () => void;
}

interface MobileNavigationProps {
  items?: NavItem[];
  className?: string;
  showLabels?: boolean;
  variant?: 'default' | 'floating' | 'minimal';
  showOnDesktop?: boolean;
  extraActions?: React.ReactNode;
  commandMenuTrigger?: boolean;
  onCommandMenuOpen?: () => void;
}

/**
 * MobileNavigation - A mobile-friendly bottom navigation bar
 * 
 * @example
 * <MobileNavigation 
 *   items={[
 *     { label: 'Home', icon: <Home />, href: '/' },
 *     { label: 'Courses', icon: <Book />, href: '/courses' },
 *     { label: 'Profile', icon: <User />, href: '/profile' },
 *   ]}
 *   variant="floating"
 *   showLabels={true}
 * />
 */
export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  items = defaultNavItems,
  className = '',
  showLabels = true,
  variant = 'default',
  showOnDesktop = false,
  extraActions,
  commandMenuTrigger = false,
  onCommandMenuOpen,
}) => {
  const [location] = useLocation();
  const { isMobile } = useDevice();
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  // Track scroll direction for auto-hide behavior in floating variant
  useEffect(() => {
    if (variant !== 'floating') return;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY <= 0) {
        setScrollDirection(null);
        setIsVisible(true);
        setLastScrollY(0);
        return;
      }
      
      // Determine scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setScrollDirection('down');
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setScrollDirection('up');
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, variant]);
  
  if (!isMobile && !showOnDesktop) {
    return null;
  }
  
  // Split items to main navigation and more menu
  const mainNavItems = items.slice(0, 4); // First 4 items in the main navigation
  const moreMenuItems = items.length > 4 ? items.slice(4) : [];
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'floating':
        return 'rounded-full shadow-lg mx-auto px-4 left-0 right-0 w-auto max-w-xs border border-border/50 bg-background/90 backdrop-blur-md';
      case 'minimal':
        return 'bg-transparent shadow-none border-t border-border/20';
      default:
        return 'border-t border-border bg-background/95 backdrop-blur-md shadow-sm';
    }
  };
  
  return (
    <AnimatePresence>
      {(isVisible || variant !== 'floating') && (
        <motion.nav
          className={cn(
            'fixed bottom-0 z-40 w-full transition-all duration-300',
            variant === 'floating' && 'bottom-4 px-4',
            getVariantStyles(),
            className,
          )}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className={cn(
            'flex items-center justify-around',
            variant === 'minimal' ? 'h-16' : 'h-16',
          )}>
            {mainNavItems.map((item, index) => (
              <NavButton
                key={index}
                item={item}
                isActive={location === item.href}
                showLabel={showLabels}
                variant={variant}
              />
            ))}
            
            {moreMenuItems.length > 0 && (
              <Drawer
                open={isMoreMenuOpen}
                onOpenChange={setIsMoreMenuOpen}
              >
                <DrawerTrigger asChild>
                  <button
                    className={cn(
                      'flex flex-col items-center justify-center w-16 py-1',
                      isMoreMenuOpen && 'text-primary',
                    )}
                  >
                    <div className="relative">
                      {isMoreMenuOpen ? (
                        <X className="h-5 w-5" />
                      ) : (
                        <MoreHorizontal className="h-5 w-5" />
                      )}
                    </div>
                    {showLabels && (
                      <span className="text-xs mt-1">More</span>
                    )}
                  </button>
                </DrawerTrigger>
                <DrawerContent className="h-[60vh]">
                  <div className="pt-6 pb-10 px-4">
                    <h3 className="text-lg font-medium mb-4">More Options</h3>
                    <div className="grid grid-cols-4 gap-4">
                      {moreMenuItems.map((item, index) => (
                        <NavButtonGrid
                          key={index}
                          item={item}
                          isActive={location === item.href}
                          onClick={() => setIsMoreMenuOpen(false)}
                        />
                      ))}
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            )}
            
            {commandMenuTrigger && moreMenuItems.length === 0 && (
              <ButtonPress>
                <button
                  onClick={onCommandMenuOpen}
                  className="flex flex-col items-center justify-center w-16 py-1"
                >
                  <Command className="h-5 w-5" />
                  {showLabels && (
                    <span className="text-xs mt-1">Commands</span>
                  )}
                </button>
              </ButtonPress>
            )}
            
            {extraActions}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

// Navigation button component
const NavButton: React.FC<{
  item: NavItem;
  isActive: boolean;
  showLabel: boolean;
  variant: 'default' | 'floating' | 'minimal';
}> = ({ item, isActive, showLabel, variant }) => {
  return (
    <ButtonPress scale={0.92}>
      <Link href={item.href}>
        <a
          className={cn(
            'flex flex-col items-center justify-center relative w-16 py-1 transition-colors',
            isActive ? (
              variant === 'minimal' 
                ? 'text-primary'  
                : 'text-primary'
            ) : 'text-muted-foreground hover:text-foreground',
          )}
          onClick={item.onClick}
        >
          {/* Active indicator dot/pill */}
          {isActive && variant !== 'minimal' && (
            <motion.div
              layoutId="nav-indicator"
              className={cn(
                'absolute bg-primary',
                variant === 'floating' 
                  ? 'h-1 w-6 rounded-full -top-1' 
                  : 'h-1 w-6 rounded-full -bottom-1'
              )}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          )}
          
          <div className="relative">
            {/* Icon */}
            {React.cloneElement(item.icon as React.ReactElement, {
              className: cn('h-5 w-5', isActive && 'text-primary'),
            })}
          </div>
          
          {/* Label */}
          {showLabel && (
            <span className={cn(
              'text-xs mt-1 transition-colors',
              isActive && 'font-medium'
            )}>
              {item.label}
            </span>
          )}
        </a>
      </Link>
    </ButtonPress>
  );
};

// Grid style navigation button for the more menu
const NavButtonGrid: React.FC<{
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}> = ({ item, isActive, onClick }) => {
  return (
    <ButtonPress scale={0.95}>
      <Link href={item.href}>
        <a
          className={cn(
            'flex flex-col items-center justify-center p-3 rounded-xl border border-border/30 transition-all',
            isActive && 'bg-primary/10 border-primary/30',
          )}
          onClick={(e) => {
            if (item.onClick) item.onClick();
            if (onClick) onClick();
          }}
        >
          <div className={cn(
            'p-2 rounded-lg mb-1',
            isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          )}>
            {React.cloneElement(item.icon as React.ReactElement, {
              className: 'h-5 w-5',
            })}
          </div>
          <span className="text-xs">{item.label}</span>
        </a>
      </Link>
    </ButtonPress>
  );
};

// Default navigation items
const defaultNavItems: NavItem[] = [
  { label: 'Home', icon: <Home />, href: '/' },
  { label: 'Courses', icon: <Book />, href: '/courses' },
  { label: 'Search', icon: <Search />, href: '/search' },
  { label: 'Profile', icon: <User />, href: '/profile' },
];

export default MobileNavigation;