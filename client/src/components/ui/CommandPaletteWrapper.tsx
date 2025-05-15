import React, { useState, useEffect, createContext, useContext } from 'react';
import CommandPalette from './CommandPalette';

// Context for managing the command palette state
interface CommandPaletteContextType {
  isOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextType>({
  isOpen: false,
  openCommandPalette: () => {},
  closeCommandPalette: () => {},
  toggleCommandPalette: () => {}
});

// Hook for using the command palette
export const useCommandPalette = () => useContext(CommandPaletteContext);

// Wrapper component that provides the command palette functionality
interface CommandPaletteWrapperProps {
  children: React.ReactNode;
}

const CommandPaletteWrapper: React.FC<CommandPaletteWrapperProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const openCommandPalette = () => setIsOpen(true);
  const closeCommandPalette = () => setIsOpen(false);
  const toggleCommandPalette = () => setIsOpen(prev => !prev);
  
  // Listen for keyboard shortcut (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleCommandPalette]);
  
  return (
    <CommandPaletteContext.Provider 
      value={{ isOpen, openCommandPalette, closeCommandPalette, toggleCommandPalette }}
    >
      {children}
      <CommandPalette 
        isOpen={isOpen} 
        setIsOpen={setIsOpen}
        onClose={closeCommandPalette} 
      />
    </CommandPaletteContext.Provider>
  );
};

export default CommandPaletteWrapper;