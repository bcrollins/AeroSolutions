import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { designSystem } from '@/styles/designSystem';

interface NavigationItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

interface NavigationMenuProps {
  items: NavigationItem[];
  className?: string;
  variant?: 'pill' | 'tab' | 'underline' | 'minimal';
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  centered?: boolean;
  sticky?: boolean;
  onItemClick?: (item: NavigationItem) => void;
}

/**
 * NavigationMenu component with Apple-inspired design
 * 
 * Features:
 * - Clean, minimal interface
 * - Multiple visual styles (pills, tabs, underlines)
 * - Horizontal or vertical orientation
 * - Sound effects on interaction
 * - Supports badges and icons
 */
const NavigationMenu: React.FC<NavigationMenuProps> = ({
  items,
  className = '',
  variant = 'pill',
  orientation = 'horizontal',
  size = 'md',
  fullWidth = false,
  centered = false,
  sticky = false,
  onItemClick
}) => {
  const [location] = useLocation();
  const { playSound } = useSoundEffects();
  const [activeItem, setActiveItem] = useState<string>('');
  
  // Determine active item based on current location
  useEffect(() => {
    const matchingItem = items.find(item => location === item.path);
    if (matchingItem) {
      setActiveItem(matchingItem.path);
    }
  }, [location, items]);
  
  // Base container classes
  const containerBaseClasses = 'flex items-center';
  
  // Orientation classes
  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col items-start'
  };
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Alignment classes
  const alignmentClasses = centered ? 'justify-center' : 'justify-start';
  
  // Sticky classes
  const stickyClasses = sticky ? 'sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm' : '';
  
  // Combine container classes
  const containerClasses = `
    ${containerBaseClasses} 
    ${orientationClasses[orientation]} 
    ${widthClasses} 
    ${alignmentClasses} 
    ${stickyClasses}
    ${className}
  `;
  
  // Size classes for items
  const itemSizeClasses = {
    sm: 'text-sm py-1.5 px-2.5',
    md: 'text-base py-2 px-3',
    lg: 'text-lg py-2.5 px-4'
  };
  
  // Process variant styling
  const getItemClasses = (item: NavigationItem) => {
    const isActive = activeItem === item.path;
    const isDisabled = item.disabled;
    
    // Common base classes
    let itemClasses = `
      relative
      transition-all 
      duration-200 
      ${itemSizeClasses[size]}
      ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `;
    
    // Add variant-specific styling
    switch (variant) {
      case 'pill':
        itemClasses += isActive 
          ? ' bg-primary-500 text-white rounded-full font-medium' 
          : ' text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full';
        break;
        
      case 'tab':
        itemClasses += isActive 
          ? ' bg-white dark:bg-gray-800 border-t border-l border-r border-gray-200 dark:border-gray-700 rounded-t-lg font-medium text-primary-600 dark:text-primary-400' 
          : ' text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700';
        break;
        
      case 'underline':
        itemClasses += isActive 
          ? ' font-medium text-primary-600 dark:text-primary-400 border-b-2 border-primary-500 dark:border-primary-400' 
          : ' text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-300 border-b-2 border-transparent';
        break;
        
      case 'minimal':
        itemClasses += isActive 
          ? ' font-medium text-primary-600 dark:text-primary-400' 
          : ' text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-300';
        break;
    }
    
    return itemClasses;
  };
  
  // Handle clicking a navigation item
  const handleClick = (item: NavigationItem) => {
    if (item.disabled) return;
    
    // Play a sound effect
    playSound('navigation');
    
    // Set the active item
    setActiveItem(item.path);
    
    // Navigate to the item's path
    // useLocation()[1](item.path);
    
    // Call the optional click handler
    if (onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <nav className={containerClasses}>
      {items.map((item, index) => (
        <div
          key={`${item.path}-${index}`}
          className={getItemClasses(item)}
          onClick={() => handleClick(item)}
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center">
            {item.icon && (
              <span className="mr-2">
                {item.icon}
              </span>
            )}
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                {item.badge}
              </span>
            )}
          </div>
        </div>
      ))}
    </nav>
  );
};

export default NavigationMenu;