import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { CommandIcon } from 'lucide-react';
import useSoundEffects from '@/hooks/use-sound-effects';

interface CommandButtonProps extends ButtonProps {
  setOpen: (open: boolean) => void;
}

/**
 * CommandButton - A button that opens the command palette with sound effects
 */
const CommandButton: React.FC<CommandButtonProps> = ({
  setOpen,
  className,
  children,
  ...props
}) => {
  const { playSound, soundEnabled } = useSoundEffects();

  const handleOpenCommandPalette = () => {
    if (soundEnabled) playSound('notification');
    setOpen(true);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`flex items-center gap-1 px-2 h-8 bg-background/60 backdrop-blur-sm ${className}`}
      onClick={handleOpenCommandPalette}
      {...props}
    >
      <CommandIcon className="h-3.5 w-3.5" />
      <span className="text-xs">Command Menu</span>
      <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
};

export default CommandButton;