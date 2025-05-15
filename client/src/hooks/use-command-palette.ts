import React, { createContext, useContext, useState, useEffect } from 'react';

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

export const useCommandPalette = () => useContext(CommandPaletteContext);

interface CommandPaletteProviderProps {
  children: React.ReactNode;
}

export const CommandPaletteProvider: React.FC<CommandPaletteProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const openCommandPalette = () => setIsOpen(true);
  const closeCommandPalette = () => setIsOpen(false);
  const toggleCommandPalette = () => setIsOpen(prev => !prev);
  
  // Listen for keyboard shortcut (Ctrl+K or Cmd+K)
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
  }, []);
  
  const value = {
    isOpen,
    openCommandPalette,
    closeCommandPalette,
    toggleCommandPalette
  };
  
  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
    </CommandPaletteContext.Provider>
  );
};

export default useCommandPalette;