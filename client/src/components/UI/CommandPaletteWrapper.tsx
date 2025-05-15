import React from 'react';
import CommandPalette from './CommandPalette';
import { useCommandPalette } from '@/hooks/use-command-palette';

/**
 * CommandPaletteWrapper - Component that wraps the CommandPalette and connects it to the CommandPaletteProvider context
 * 
 * This allows for dynamic registration of commands from anywhere in the app
 */
const CommandPaletteWrapper: React.FC = () => {
  const { isOpen, setIsOpen, actions } = useCommandPalette();

  return (
    <CommandPalette
      open={isOpen}
      onOpenChange={setIsOpen}
      actions={actions}
      footerText="Press ⌘K or Ctrl+K to open this command palette"
      placeholder="Type a command or search..."
      highlightTerms={true}
      showShortcut={true}
    />
  );
};

export default CommandPaletteWrapper;