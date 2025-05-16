import { useEffect } from 'react';
import { useSoundEffects } from './use-sound-effects';

// Sound types
type SoundEffectType = 
  | 'click' 
  | 'success' 
  | 'error' 
  | 'notification' 
  | 'hover' 
  | 'navigation' 
  | 'focus' 
  | 'typing' 
  | 'complete' 
  | 'screenshot';

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
  const { playSound, settings } = useSoundEffects();
  const soundEnabled = settings.enabled;
  
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