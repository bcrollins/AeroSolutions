import React from 'react';
import { Switch } from '@/components/ui/switch';
import useSoundEffects, { SoundEffectType } from '@/hooks/use-sound-effects';

interface SoundToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onToggle?: (checked: boolean) => void;
  soundOnChecked?: SoundEffectType;
  soundOnUnchecked?: SoundEffectType;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * A toggle/switch component that plays sound effects when toggled
 */
const SoundToggle: React.FC<SoundToggleProps> = ({
  checked,
  defaultChecked,
  onToggle,
  soundOnChecked = 'success',
  soundOnUnchecked = 'click',
  disabled,
  id,
  className
}) => {
  const { playSound, soundEnabled } = useSoundEffects();
  
  const handleToggle = (isChecked: boolean) => {
    // Play different sounds based on the toggle state
    if (soundEnabled) {
      playSound(isChecked ? soundOnChecked : soundOnUnchecked);
    }
    
    if (onToggle) {
      onToggle(isChecked);
    }
  };
  
  return (
    <Switch
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={handleToggle}
      disabled={disabled}
      id={id}
      className={className}
    />
  );
};

export default SoundToggle;