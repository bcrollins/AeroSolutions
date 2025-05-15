// Note that this context is needed by existing functionality
// But we don't need to implement it fully since we're using our updated components 
// in the src/components/ui/ directory
import { createContext, useContext } from 'react';

// Context type
export interface CommandPaletteContextType {
  isOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
}

// Create default context
const defaultContext: CommandPaletteContextType = {
  isOpen: false,
  openCommandPalette: () => {},
  closeCommandPalette: () => {},
  toggleCommandPalette: () => {}
};

// Create context
const CommandPaletteContext = createContext<CommandPaletteContextType>(defaultContext);

// Hook for using the command palette
export const useCommandPalette = () => useContext(CommandPaletteContext);

// Simple provider implementation (for compatibility with existing code)
export const CommandPaletteProvider = ({ children }: { children: any }) => {
  return children;
};

export default useCommandPalette;