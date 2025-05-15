import React from 'react';
import { Switch, SwitchProps } from '@/components/ui/switch';
import useSoundEffects, { SoundEffectType } from '@/hooks/use-sound-effects';

interface SoundToggleProps extends Omit<SwitchProps, 'onCheckedChange'> {
  onToggle?: (checked: boolean) => void;
  soundOnChecked?: SoundEffectType;
  soundOnUnchecked?: SoundEffectType;
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
  ...props
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
      {...props}
    />
  );
};

export default SoundToggle;