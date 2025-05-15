import React from 'react';
import { useCommandPalette } from '@/hooks/use-command-palette';
import { Button } from '@/components/ui/button';
import { Command } from 'lucide-react';

interface CommandButtonProps {
  className?: string;
}

/**
 * A button component that opens the command palette when clicked
 */
export const CommandButton: React.FC<CommandButtonProps> = ({ className }) => {
  const { setIsOpen } = useCommandPalette();
  
  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={() => setIsOpen(true)}
    >
      <Command className="h-4 w-4 mr-1" />
      <span className="hidden sm:inline-block">Command</span>
      <kbd className="ml-2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
};

export default CommandButton;