import React from 'react';
import { CommandPalette } from './CommandPalette';
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
      actions={actions}
      open={isOpen}
      onOpenChange={setIsOpen}
      contentClassName="bg-background/95 backdrop-blur-md border-border/50"
    />
  );
};

export default CommandPaletteWrapper;