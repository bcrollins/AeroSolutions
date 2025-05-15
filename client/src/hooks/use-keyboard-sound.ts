import { useEffect } from 'react';
import useSoundEffects, { SoundEffectType } from './use-sound-effects';

interface KeyboardSoundOptions {
  targetKey?: string;
  soundEffect?: SoundEffectType;
  onEnter?: () => void;
  onEsc?: () => void;
  onSpace?: () => void;
  onArrow?: () => void;
  enabled?: boolean;
}

/**
 * Hook to play sound effects on keyboard interactions
 */
export function useKeyboardSound({
  targetKey,
  soundEffect = 'click',
  onEnter,
  onEsc,
  onSpace,
  onArrow,
  enabled = true
}: KeyboardSoundOptions = {}) {
  const { playSound, soundEnabled } = useSoundEffects();
  
  useEffect(() => {
    if (!enabled || !soundEnabled) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      // If a specific target key is provided, only respond to that key
      if (targetKey && key !== targetKey.toLowerCase()) return;
      
      // Handle specific keys
      if (key === 'enter') {
        if (soundEnabled) playSound(soundEffect);
        if (onEnter) onEnter();
      } else if (key === 'escape') {
        if (soundEnabled) playSound('notification');
        if (onEsc) onEsc();
      } else if (key === ' ' || key === 'spacebar') {
        if (soundEnabled) playSound(soundEffect);
        if (onSpace) onSpace();
      } else if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        if (soundEnabled) playSound('hover');
        if (onArrow) onArrow();
      } else if (!targetKey) {
        // If no specific target key and not a special key, play the sound for any key
        if (soundEnabled) playSound('hover');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [soundEnabled, soundEffect, targetKey, onEnter, onEsc, onSpace, onArrow, enabled, playSound]);
}

export default useKeyboardSound;