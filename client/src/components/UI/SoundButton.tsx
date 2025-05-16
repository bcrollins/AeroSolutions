import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import type { SoundType } from '@/hooks/use-sound-effects';

interface SoundButtonProps extends ButtonProps {
  soundEffect?: SoundType;
}

/**
 * A button that plays a sound effect when clicked
 */
export const SoundButton: React.FC<SoundButtonProps> = ({
  soundEffect = 'click',
  onClick,
  children,
  ...props
}) => {
  const { playSound, settings } = useSoundEffects();
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Play sound if enabled
    if (settings.enabled) {
      playSound(soundEffect);
    }
    
    // Call the original onClick handler if provided
    if (onClick) {
      onClick(event);
    }
  };
  
  return (
    <Button 
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
};

export default SoundButton;